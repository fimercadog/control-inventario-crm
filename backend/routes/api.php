<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContingencyController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DealController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WarehouseController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas sin sesion: throttle por IP para frenar fuerza bruta / enumeracion.
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');

// Formularios publicos del sitio de marketing (demo / contacto).
Route::post('/leads', [LeadController::class, 'store'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function (): void {
    // Sin permiso: cualquier usuario autenticado.
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Cada recurso exige el permiso Spatie correspondiente (mismo mapa que el
    // menu del frontend). `can:` responde 403 si el usuario no lo tiene.
    Route::get('/dashboard', DashboardController::class)->middleware('can:dashboard.view');
    Route::get('/reports', ReportController::class)->middleware('can:reports.view');

    // Modo contingencia: el estado lo lee cualquier usuario (para renderizar el
    // banner y el modo solo-lectura); activar/desactivar exige settings.manage.
    Route::get('/contingency/status', [ContingencyController::class, 'status']);
    Route::post('/contingency/activate', [ContingencyController::class, 'activate'])->middleware('can:settings.manage');
    Route::post('/contingency/deactivate', [ContingencyController::class, 'deactivate'])->middleware('can:settings.manage');

    Route::get('/leads', [LeadController::class, 'index'])->middleware('can:leads.view');
    Route::match(['put', 'patch'], '/leads/{lead}', [LeadController::class, 'update'])->middleware('can:leads.view');
    Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->middleware('can:leads.view');

    Route::get('/company', [CompanyController::class, 'show'])->middleware('can:settings.manage');
    Route::put('/company', [CompanyController::class, 'update'])->middleware('can:settings.manage');

    // CRM
    Route::apiResource('clients', ClientController::class)->middleware('can:clients.manage');
    Route::apiResource('deals', DealController::class)->middleware('can:deals.manage');
    Route::apiResource('activities', ActivityController::class)->middleware('can:activities.manage');

    // Inventario
    Route::apiResource('products', ProductController::class)->middleware('can:products.manage');
    Route::apiResource('warehouses', WarehouseController::class)->middleware('can:warehouses.manage');
    Route::apiResource('suppliers', SupplierController::class)->middleware('can:suppliers.manage');
    Route::apiResource('stock-movements', StockMovementController::class)->only(['index', 'store'])->middleware('can:stock.manage');

    Route::apiResource('purchase-orders', PurchaseOrderController::class)->middleware('can:purchase_orders.manage');
    Route::post('/purchase-orders/{purchase_order}/items', [PurchaseOrderController::class, 'addItem'])->middleware('can:purchase_orders.manage');
    Route::delete('/purchase-orders/{purchase_order}/items/{item}', [PurchaseOrderController::class, 'removeItem'])->middleware('can:purchase_orders.manage');
    Route::post('/purchase-orders/{purchase_order}/receive', [PurchaseOrderController::class, 'receive'])->middleware('can:purchase_orders.manage');

    // Puente CRM <-> Inventario: un pedido consume stock al confirmarse.
    Route::apiResource('orders', OrderController::class)->middleware('can:orders.manage');
    Route::post('/orders/{order}/items', [OrderController::class, 'addItem'])->middleware('can:orders.manage');
    Route::delete('/orders/{order}/items/{item}', [OrderController::class, 'removeItem'])->middleware('can:orders.manage');
    Route::post('/orders/{order}/confirm', [OrderController::class, 'confirm'])->middleware('can:orders.manage');

    Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show'])->middleware('can:audit.view');
    Route::get('/permissions', [RoleController::class, 'permissions'])->middleware('can:roles.manage');
    Route::apiResource('roles', RoleController::class)->only(['index', 'show', 'store', 'update'])->middleware('can:roles.manage');
    Route::apiResource('users', UserController::class)->only(['index', 'store', 'update'])->middleware('can:users.manage');

    // El permiso por recurso se valida dentro del controlador.
    Route::get('/exports/{resource}.{format}', ExportController::class)
        ->whereIn('resource', ['clients', 'deals', 'products', 'suppliers', 'stock-movements', 'purchase-orders', 'orders', 'audit-logs'])
        ->whereIn('format', ['csv', 'pdf']);
});
