<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Company;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $company = Company::firstOrCreate([
            'name' => 'Andes Distribuciones S.A.S.',
        ], [
            'nit' => '901.245.880-3',
            'email' => 'ventas@andescomercial.co',
            'phone' => '+57 601 555 0188',
            'address' => 'Calle 93 #14-20, Bogota',
            'timezone' => 'America/Bogota',
            'locale' => 'es',
        ]);

        $permissionNames = [
            'dashboard.view', 'leads.view', 'clients.manage', 'deals.manage', 'activities.manage',
            'products.manage', 'warehouses.manage', 'stock.manage', 'suppliers.manage', 'purchase_orders.manage',
            'orders.manage', 'reports.view', 'users.manage', 'roles.manage', 'audit.view', 'settings.manage',
        ];

        foreach ($permissionNames as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $roles = [
            'Super Admin' => $permissionNames,
            'Administrador de empresa' => $permissionNames,
            'Ventas' => ['dashboard.view', 'leads.view', 'clients.manage', 'deals.manage', 'activities.manage', 'orders.manage', 'reports.view'],
            'Inventario' => ['dashboard.view', 'products.manage', 'warehouses.manage', 'stock.manage', 'suppliers.manage', 'purchase_orders.manage', 'orders.manage', 'reports.view'],
            'Usuario' => ['dashboard.view'],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web'])->syncPermissions($rolePermissions);
        }

        $demoUsers = [
            ['name' => 'Sofia Mercado', 'email' => 'superadmin@andescomercial.co', 'role' => 'Super Admin'],
            ['name' => 'Camila Rojas', 'email' => 'admin@andescomercial.co', 'role' => 'Administrador de empresa'],
            ['name' => 'Sebastian Moreno', 'email' => 'ventas@andescomercial.co', 'role' => 'Ventas'],
            ['name' => 'Valentina Castro', 'email' => 'inventario@andescomercial.co', 'role' => 'Inventario'],
            ['name' => 'Laura Medina', 'email' => 'usuario@andescomercial.co', 'role' => 'Usuario'],
        ];

        $seededUsers = collect($demoUsers)->map(function (array $demoUser) use ($company) {
            $user = User::updateOrCreate(
                ['email' => $demoUser['email']],
                ['company_id' => $company->id, 'name' => $demoUser['name'], 'password' => Hash::make('password'), 'status' => 'active'],
            );
            $user->syncRoles([$demoUser['role']]);

            return $user;
        });
        $admin = $seededUsers->firstWhere('email', 'admin@andescomercial.co');

        // Bodegas.
        $warehouses = collect([
            ['name' => 'Bodega Principal', 'location' => 'Bogota, zona industrial'],
            ['name' => 'Bodega Norte', 'location' => 'Chia, parque logistico'],
        ])->map(fn ($data) => Warehouse::firstOrCreate(['company_id' => $company->id, 'name' => $data['name']], $data + ['status' => 'active']));
        $mainWarehouse = $warehouses[0];

        // Productos.
        $products = collect([
            ['sku' => 'SKU-1001', 'name' => 'Resma papel carta', 'category' => 'Oficina', 'cost' => 8500, 'price' => 12500, 'reorder' => 20],
            ['sku' => 'SKU-1002', 'name' => 'Toner impresora HP 12A', 'category' => 'Oficina', 'cost' => 65000, 'price' => 98000, 'reorder' => 5],
            ['sku' => 'SKU-1003', 'name' => 'Silla ergonomica', 'category' => 'Mobiliario', 'cost' => 210000, 'price' => 320000, 'reorder' => 3],
            ['sku' => 'SKU-1004', 'name' => 'Monitor 24" LED', 'category' => 'Electronica', 'cost' => 480000, 'price' => 650000, 'reorder' => 4],
            ['sku' => 'SKU-1005', 'name' => 'Teclado inalambrico', 'category' => 'Electronica', 'cost' => 45000, 'price' => 72000, 'reorder' => 10],
            ['sku' => 'SKU-1006', 'name' => 'Mouse optico', 'category' => 'Electronica', 'cost' => 22000, 'price' => 38000, 'reorder' => 15],
            ['sku' => 'SKU-1007', 'name' => 'Dispensador de gel antibacterial', 'category' => 'Aseo', 'cost' => 18000, 'price' => 29000, 'reorder' => 8],
            ['sku' => 'SKU-1008', 'name' => 'Caja archivador oficio', 'category' => 'Oficina', 'cost' => 9000, 'price' => 15000, 'reorder' => 12],
        ])->map(fn ($data) => Product::firstOrCreate(
            ['company_id' => $company->id, 'sku' => $data['sku']],
            ['name' => $data['name'], 'category' => $data['category'], 'unit' => 'unidad', 'cost_price' => $data['cost'], 'unit_price' => $data['price'], 'reorder_level' => $data['reorder'], 'status' => 'active'],
        ));

        // Proveedores.
        $suppliers = collect([
            ['name' => 'Papeleria Continental', 'contact_name' => 'Jorge Nino', 'email' => 'ventas@papelcontinental.co'],
            ['name' => 'Tecno Import SAS', 'contact_name' => 'Marcela Duran', 'email' => 'compras@tecnoimport.co'],
            ['name' => 'Muebles y Espacios Ltda', 'contact_name' => 'Ricardo Pena', 'email' => 'pedidos@mueblesyespacios.co'],
        ])->map(fn ($data) => Supplier::firstOrCreate(['company_id' => $company->id, 'name' => $data['name']], $data + ['status' => 'active']));

        // Clientes.
        $clients = collect([
            ['name' => 'Laura Gutierrez', 'company_name' => 'Constructora Alfa', 'email' => 'compras@constructoraalfa.co'],
            ['name' => 'Andres Vargas', 'company_name' => 'Grupo Bienestar', 'email' => 'andres.vargas@grupobienestar.co'],
            ['name' => 'Marcela Rios', 'company_name' => 'Colegio San Rafael', 'email' => 'administracion@sanrafael.edu.co'],
            ['name' => 'Felipe Castano', 'company_name' => 'Clinica Vida Sana', 'email' => 'felipe.castano@vidasana.co'],
            ['name' => 'Diana Torres', 'company_name' => 'Restaurante El Fogon', 'email' => 'diana@elfogon.co'],
            ['name' => 'Camilo Herrera', 'company_name' => null, 'email' => 'camilo.herrera@gmail.com'],
        ])->map(fn ($data) => Client::firstOrCreate(['company_id' => $company->id, 'email' => $data['email']], $data + ['status' => 'active']));

        // Deals en distintas etapas del pipeline.
        $stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'won', 'lost'];
        $deals = collect();
        foreach ($clients as $index => $client) {
            $deals->push(Deal::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $client->id, 'title' => 'Suministro de oficina - '.$client->company_name ?? $client->name],
                ['amount' => 800000 + $index * 350000, 'stage' => $stages[$index % count($stages)], 'expected_close_date' => Carbon::today()->addDays(10 + $index * 5)],
            ));
        }

        // Actividades de seguimiento sobre algunos deals/clientes.
        foreach ($deals->take(5) as $index => $deal) {
            Activity::firstOrCreate(
                ['company_id' => $company->id, 'deal_id' => $deal->id, 'subject' => 'Seguimiento comercial #'.($index + 1)],
                [
                    'client_id' => $deal->client_id,
                    'type' => ['call', 'meeting', 'email'][$index % 3],
                    'notes' => 'Llamada de seguimiento sobre la propuesta enviada.',
                    'due_date' => Carbon::today()->addDays($index + 1),
                    'completed' => $index % 2 === 0,
                ],
            );
        }

        // Orden de compra recibida: genera entradas de stock reales.
        $purchaseOrder = PurchaseOrder::firstOrCreate(
            // Sin `status` en la clave: una vez recibida, un segundo reseed no
            // debe encontrar "no match" y crear una orden duplicada.
            ['company_id' => $company->id, 'supplier_id' => $suppliers[0]->id, 'warehouse_id' => $mainWarehouse->id],
            ['status' => 'draft', 'order_date' => Carbon::today()->subDays(20), 'expected_date' => Carbon::today()->subDays(10), 'total' => 0],
        );
        if ($purchaseOrder->items()->count() === 0) {
            $poItems = [[$products[0], 200], [$products[1], 30], [$products[7], 150]];
            $total = 0;
            foreach ($poItems as [$product, $qty]) {
                PurchaseOrderItem::create(['purchase_order_id' => $purchaseOrder->id, 'product_id' => $product->id, 'quantity' => $qty, 'unit_cost' => $product->cost_price]);
                $total += $qty * $product->cost_price;
                StockMovement::create([
                    'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $mainWarehouse->id,
                    'type' => 'in', 'quantity' => $qty, 'reason' => 'Recepcion de orden de compra',
                    'reference' => 'purchase_order:'.$purchaseOrder->id,
                ]);
            }
            $purchaseOrder->update(['status' => 'received', 'total' => $total]);
        }

        // Ajuste inicial de stock para el resto de productos (existencia de arranque).
        foreach ($products->slice(3) as $product) {
            if (StockMovement::where('product_id', $product->id)->doesntExist()) {
                StockMovement::create([
                    'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $mainWarehouse->id,
                    'type' => 'in', 'quantity' => $product->reorder_level * 4, 'reason' => 'Ajuste inicial de inventario',
                ]);
            }
        }

        // Segunda orden de compra, todavia en borrador (sin recibir).
        PurchaseOrder::firstOrCreate(
            ['company_id' => $company->id, 'supplier_id' => $suppliers[1]->id, 'warehouse_id' => $mainWarehouse->id],
            ['status' => 'draft', 'order_date' => Carbon::today(), 'expected_date' => Carbon::today()->addDays(15), 'total' => 0],
        );

        // Pedidos: algunos confirmados (consumen stock), uno en borrador.
        $orderPlans = [
            ['client' => $clients[0], 'confirmed' => true, 'items' => [[$products[0], 20], [$products[7], 10]]],
            ['client' => $clients[1], 'confirmed' => true, 'items' => [[$products[3], 2], [$products[5], 5]]],
            ['client' => $clients[2], 'confirmed' => false, 'items' => [[$products[2], 4]]],
        ];
        foreach ($orderPlans as $plan) {
            // Sin `status` en la clave: un pedido ya confirmado no debe generar
            // un duplicado en un segundo reseed.
            $order = Order::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $plan['client']->id, 'warehouse_id' => $mainWarehouse->id],
                ['status' => 'draft', 'total' => 0],
            );
            if ($order->items()->count() > 0) {
                continue;
            }
            $total = 0;
            foreach ($plan['items'] as [$product, $qty]) {
                OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => $qty, 'unit_price' => $product->unit_price]);
                $total += $qty * $product->unit_price;
            }
            $order->update(['total' => $total]);
            if ($plan['confirmed']) {
                foreach ($plan['items'] as [$product, $qty]) {
                    StockMovement::create([
                        'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $mainWarehouse->id,
                        'type' => 'out', 'quantity' => -$qty, 'reason' => 'Confirmacion de pedido', 'reference' => 'order:'.$order->id,
                    ]);
                }
                $order->update(['status' => 'confirmed']);
            }
        }

        // Leads del sitio publico.
        collect([
            ['name' => 'Julian Pardo', 'company_name' => 'Ferreteria Central', 'email' => 'julian@ferreteriacentral.co', 'source' => 'contact', 'status' => 'new'],
            ['name' => 'Natalia Ortega', 'company_name' => 'Distribuciones Ortega', 'email' => 'natalia@distribucionesortega.co', 'source' => 'demo', 'status' => 'contacted'],
            ['name' => 'Tomas Salazar', 'company_name' => null, 'email' => 'tomas.salazar@gmail.com', 'source' => 'contact', 'status' => 'discarded'],
        ])->each(fn ($data) => Lead::firstOrCreate(
            ['company_id' => $company->id, 'email' => $data['email']],
            $data + ['ip_address' => '190.85.'.rand(1, 254).'.'.rand(1, 254)],
        ));

        // Bitacora de auditoria: acciones tipicas del panel.
        $auditLogs = [
            ['login', 'auth', User::class, $admin->id, 0],
            ['client.created', 'clientes', Client::class, $clients[0]->id, 5],
            ['deal.updated', 'deals', Deal::class, $deals[0]->id, 4],
            ['order.confirmed', 'pedidos', Order::class, null, 3],
            ['product.created', 'productos', Product::class, $products[0]->id, 6],
            ['purchase_order.received', 'compras', PurchaseOrder::class, $purchaseOrder->id, 10],
            ['user.created', 'usuarios', User::class, $seededUsers->last()->id, 15],
            ['settings.updated', 'configuracion', Company::class, $company->id, 20],
        ];

        foreach ($auditLogs as [$action, $module, $entity, $entityId, $daysAgo]) {
            $log = AuditLog::firstOrCreate(
                ['company_id' => $company->id, 'action' => $action, 'entity' => $entity, 'entity_id' => $entityId],
                [
                    'user_id' => $admin->id,
                    'module' => $module,
                    'ip_address' => '190.85.'.rand(1, 254).'.'.rand(1, 254),
                    'new_values' => ['message' => 'Accion registrada por el sistema de demostracion'],
                ],
            );

            if ($log->wasRecentlyCreated) {
                $at = Carbon::now()->subDays($daysAgo)->subHours(rand(0, 8));
                $log->forceFill(['created_at' => $at, 'updated_at' => $at])->saveQuietly();
            }
        }
    }
}
