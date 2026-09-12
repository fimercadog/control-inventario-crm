<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ClientNoteController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContingencyController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PublicCatalogController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SegmentController;
use App\Http\Controllers\Api\StockAlertController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\StockTransferController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WarehouseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas sin sesion: throttle por IP para frenar fuerza bruta / enumeracion.
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');

// Formularios publicos del sitio de marketing (demo / contacto).
Route::post('/public/leads', [LeadController::class, 'store'])->middleware('throttle:5,1');

// Catalogo publico: navegable por visitantes anonimos. La solicitud de
// cotizacion entra al CRM como Cliente + Quote en borrador.
Route::prefix('public/catalog')->group(function (): void {
    // Limiters con nombre (contador propio, ver AppServiceProvider): navegar el
    // catalogo no consume la cuota de "solicitar cotizacion".
    Route::middleware('throttle:catalog-read')->group(function (): void {
        Route::get('/products', [PublicCatalogController::class, 'products']);
        Route::get('/products/{id}', [PublicCatalogController::class, 'product'])->whereNumber('id');
        Route::get('/categories', [PublicCatalogController::class, 'categories']);
    });
    Route::post('/quote-requests', [PublicCatalogController::class, 'storeQuoteRequest'])->middleware('throttle:catalog-quote');
});

Route::middleware('auth:sanctum')->group(function (): void {
    // Sin permiso: cualquier usuario autenticado.
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Cada recurso exige el permiso Spatie correspondiente (mismo mapa que el
    // menu del frontend). `can:` responde 403 si el usuario no lo tiene.
    Route::get('/dashboard', DashboardController::class)->middleware('can:dashboard.view');
    Route::get('/reports', ReportController::class)->middleware(['can:reports.view', 'plan:analytics']);
    Route::get('/reports/commercial', [ReportController::class, 'commercial'])->middleware(['can:reports.view', 'plan:analytics']);

    // Modo contingencia: el estado lo lee cualquier usuario (para renderizar el
    // banner y el modo solo-lectura); activar/desactivar exige settings.manage
    // y esta fuera del plan low ticket (FASE 8).
    Route::get('/contingency/status', [ContingencyController::class, 'status']);
    Route::post('/contingency/activate', [ContingencyController::class, 'activate'])->middleware(['can:settings.manage', 'plan:premium']);
    Route::post('/contingency/deactivate', [ContingencyController::class, 'deactivate'])->middleware(['can:settings.manage', 'plan:premium']);

    Route::get('/leads', [LeadController::class, 'index'])->middleware(['can:leads.view', 'plan:crm_pro']);
    Route::post('/leads', [LeadController::class, 'storeManual'])->middleware(['can:leads.view', 'plan:crm_pro']);
    Route::match(['put', 'patch'], '/leads/{lead}', [LeadController::class, 'update'])->middleware(['can:leads.view', 'plan:crm_pro']);
    Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->middleware(['can:leads.view', 'plan:crm_pro']);

    Route::get('/company', [CompanyController::class, 'show'])->middleware('can:settings.manage');
    Route::put('/company', [CompanyController::class, 'update'])->middleware('can:settings.manage');

    // CRM
    // El borrado permanente de clientes exige su propio permiso: Ventas crea y
    // edita (clients.manage) pero no hace hard-delete (solo roles administrativos
    // tienen clients.delete). Sin historial -> se borra; con historial la FK
    // RESTRICT del BaseCrudController responde 422 ("marcalo como inactivo").
    Route::apiResource('clients', ClientController::class)->except('destroy')->middleware('can:clients.manage');
    Route::delete('/clients/{client}', [ClientController::class, 'destroy'])->middleware('can:clients.delete');
    Route::get('/clients/{client}/history', [ClientController::class, 'history'])->middleware('can:clients.manage');
    Route::apiResource('contacts', ContactController::class)->middleware(['can:clients.manage', 'plan:crm_pro']);
    Route::apiResource('segments', SegmentController::class)->middleware(['can:clients.manage', 'plan:crm_pro']);
    Route::apiResource('client-notes', ClientNoteController::class)->only(['index', 'store', 'destroy'])->middleware(['can:clients.manage', 'plan:crm_pro']);
    Route::apiResource('deals', DealController::class)->middleware(['can:deals.manage', 'plan:crm_pro']);
    Route::apiResource('activities', ActivityController::class)->middleware(['can:activities.manage', 'plan:crm_pro']);

    Route::apiResource('quotes', QuoteController::class)->middleware('can:deals.manage');
    Route::post('/quotes/{quote}/items', [QuoteController::class, 'addItem'])->middleware('can:deals.manage');
    Route::delete('/quotes/{quote}/items/{item}', [QuoteController::class, 'removeItem'])->middleware('can:deals.manage');
    Route::post('/quotes/{quote}/send', [QuoteController::class, 'send'])->middleware('can:deals.manage');
    Route::post('/quotes/{quote}/respond', [QuoteController::class, 'respond'])->middleware('can:deals.manage');
    Route::post('/quotes/{quote}/convert', [QuoteController::class, 'convert'])->middleware('can:deals.manage');

    // Inventario
    Route::apiResource('products', ProductController::class)->middleware('can:products.manage');
    Route::post('/products/{id}/image', [ProductController::class, 'image'])->middleware('can:products.manage')->whereNumber('id');
    Route::apiResource('categories', CategoryController::class)->middleware('can:products.manage');
    Route::apiResource('brands', BrandController::class)->middleware(['can:products.manage', 'plan:inventory_pro']);
    Route::apiResource('units', UnitController::class)->middleware(['can:products.manage', 'plan:inventory_pro']);
    Route::apiResource('warehouses', WarehouseController::class)->middleware(['can:warehouses.manage', 'plan:inventory_pro']);
    Route::apiResource('suppliers', SupplierController::class)->middleware(['can:suppliers.manage', 'plan:inventory_pro']);
    Route::apiResource('stock-movements', StockMovementController::class)->only(['index', 'store'])->middleware('can:stock.manage');
    Route::apiResource('stock-transfers', StockTransferController::class)->only(['index', 'store'])->middleware(['can:stock.manage', 'plan:inventory_pro']);
    Route::get('/stock-alerts', StockAlertController::class)->middleware(['can:products.manage', 'plan:inventory_pro']);

    Route::apiResource('purchase-orders', PurchaseOrderController::class)->middleware(['can:purchase_orders.manage', 'plan:inventory_pro']);
    Route::post('/purchase-orders/{purchase_order}/items', [PurchaseOrderController::class, 'addItem'])->middleware(['can:purchase_orders.manage', 'plan:inventory_pro']);
    Route::delete('/purchase-orders/{purchase_order}/items/{item}', [PurchaseOrderController::class, 'removeItem'])->middleware(['can:purchase_orders.manage', 'plan:inventory_pro']);
    Route::post('/purchase-orders/{purchase_order}/receive', [PurchaseOrderController::class, 'receive'])->middleware(['can:purchase_orders.manage', 'plan:inventory_pro']);

    // Puente CRM <-> Inventario: un pedido consume stock al confirmarse.
    Route::apiResource('orders', OrderController::class)->middleware('can:orders.manage');
    Route::post('/orders/{order}/items', [OrderController::class, 'addItem'])->middleware('can:orders.manage');
    Route::delete('/orders/{order}/items/{item}', [OrderController::class, 'removeItem'])->middleware('can:orders.manage');
    Route::post('/orders/{order}/confirm', [OrderController::class, 'confirm'])->middleware('can:orders.manage');

    Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show'])->middleware(['can:audit.view', 'plan:premium']);
    Route::get('/permissions', [RoleController::class, 'permissions'])->middleware(['can:roles.manage', 'plan:premium']);
    Route::apiResource('roles', RoleController::class)->only(['index', 'show', 'store', 'update'])->middleware(['can:roles.manage', 'plan:premium']);
    Route::apiResource('users', UserController::class)->only(['index', 'store', 'update'])->middleware(['can:users.manage', 'plan:team']);

    // El permiso por recurso se valida dentro del controlador.
    Route::get('/exports/{resource}.{format}', ExportController::class)
        ->whereIn('resource', ['clients', 'deals', 'products', 'suppliers', 'stock-movements', 'purchase-orders', 'orders', 'audit-logs'])
        ->whereIn('format', ['csv', 'pdf']);
});
