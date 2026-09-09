<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Brand;
use App\Models\Breed;
use App\Models\Category;
use App\Models\Client;
use App\Models\ClientNote;
use App\Models\Company;
use App\Models\Consultation;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Segment;
use App\Models\Service;
use App\Models\Species;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\Supplier;
use App\Models\Unit;
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
            'name' => 'Clínica Veterinaria Los Andes',
        ], [
            'nit' => '901.245.880-3',
            'email' => 'recepcion@vetlosandes.co',
            'phone' => '+57 601 555 0188',
            'address' => 'Calle 93 #14-20, Bogota',
            'timezone' => 'America/Bogota',
            'locale' => 'es',
        ]);

        $permissionNames = [
            'dashboard.view', 'leads.view', 'clients.manage', 'clients.delete', 'deals.manage', 'activities.manage',
            'products.manage', 'warehouses.manage', 'stock.manage', 'suppliers.manage', 'purchase_orders.manage',
            'orders.manage', 'reports.view', 'users.manage', 'roles.manage', 'audit.view', 'settings.manage',
            // Vertical veterinaria
            'services.manage', 'patients.manage', 'appointments.manage', 'medical_records.manage',
            'vaccinations.manage', 'prescriptions.manage', 'procedures.manage', 'clinical_reports.view',
        ];

        $vetClinicalPermissions = [
            'services.manage', 'patients.manage', 'appointments.manage', 'medical_records.manage',
            'vaccinations.manage', 'prescriptions.manage', 'procedures.manage', 'clinical_reports.view',
        ];

        foreach ($permissionNames as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $roles = [
            'Super Admin' => $permissionNames,
            'Administrador de empresa' => $permissionNames,
            'Veterinario/a' => array_merge(
                ['dashboard.view', 'clients.manage', 'orders.manage', 'reports.view'],
                $vetClinicalPermissions,
            ),
            'Recepción' => [
                'dashboard.view', 'clients.manage', 'patients.manage', 'services.manage',
                'appointments.manage', 'orders.manage', 'reports.view',
            ],
            'Ventas' => ['dashboard.view', 'leads.view', 'clients.manage', 'deals.manage', 'activities.manage', 'orders.manage', 'reports.view'],
            'Inventario' => ['dashboard.view', 'products.manage', 'warehouses.manage', 'stock.manage', 'suppliers.manage', 'purchase_orders.manage', 'orders.manage', 'reports.view'],
            'Usuario' => ['dashboard.view'],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web'])->syncPermissions($rolePermissions);
        }

        $demoUsers = [
            ['name' => 'Sofia Mercado', 'email' => 'superadmin@vetlosandes.co', 'role' => 'Super Admin'],
            ['name' => 'Camila Rojas', 'email' => 'admin@vetlosandes.co', 'role' => 'Administrador de empresa'],
            ['name' => 'Sebastian Moreno', 'email' => 'ventas@vetlosandes.co', 'role' => 'Ventas'],
            ['name' => 'Valentina Castro', 'email' => 'inventario@vetlosandes.co', 'role' => 'Inventario'],
            ['name' => 'Laura Medina', 'email' => 'usuario@vetlosandes.co', 'role' => 'Usuario'],
        ];

        $seededUsers = collect($demoUsers)->map(function (array $demoUser) use ($company) {
            $user = User::updateOrCreate(
                ['email' => $demoUser['email']],
                ['company_id' => $company->id, 'name' => $demoUser['name'], 'password' => Hash::make('password'), 'status' => 'active'],
            );
            $user->syncRoles([$demoUser['role']]);

            return $user;
        });
        $admin = $seededUsers->firstWhere('email', 'admin@vetlosandes.co');
        $salesUser = $seededUsers->firstWhere('email', 'ventas@vetlosandes.co');
        $owners = [$salesUser, $admin];

        // Bodegas.
        $warehouses = collect([
            ['name' => 'Bodega Principal', 'location' => 'Bogota, zona industrial'],
            ['name' => 'Bodega Norte', 'location' => 'Chia, parque logistico'],
        ])->map(fn ($data) => Warehouse::firstOrCreate(['company_id' => $company->id, 'name' => $data['name']], $data + ['status' => 'active']));
        $mainWarehouse = $warehouses[0];

        // Catalogos de inventario.
        $categories = collect(['Oficina', 'Mobiliario', 'Electronica', 'Aseo'])
            ->mapWithKeys(fn ($name) => [$name => Category::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])]);
        $brands = collect(['Generica', 'HP', 'Logitech', 'Ergo'])
            ->mapWithKeys(fn ($name) => [$name => Brand::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])]);
        $units = collect([
            ['name' => 'Unidad', 'abbreviation' => 'un'],
            ['name' => 'Caja', 'abbreviation' => 'cja'],
            ['name' => 'Kilogramo', 'abbreviation' => 'kg'],
            ['name' => 'Litro', 'abbreviation' => 'lt'],
        ])->mapWithKeys(fn ($data) => [$data['name'] => Unit::firstOrCreate(['company_id' => $company->id, 'name' => $data['name']], $data + ['status' => 'active'])]);
        $unidadUnit = $units['Unidad'];

        // Productos.
        $products = collect([
            ['sku' => 'SKU-1001', 'name' => 'Resma papel carta', 'category' => 'Oficina', 'brand' => 'Generica', 'cost' => 8500, 'price' => 12500, 'reorder' => 20, 'public' => true, 'description' => 'Resma de 500 hojas tamano carta, 75 g/m2, blancura alta para impresion laser e inkjet.'],
            ['sku' => 'SKU-1002', 'name' => 'Toner impresora HP 12A', 'category' => 'Oficina', 'brand' => 'HP', 'cost' => 65000, 'price' => 98000, 'reorder' => 5, 'public' => true, 'description' => 'Cartucho de toner negro compatible con LaserJet 1010/1020/3050, rendimiento aproximado 2.000 paginas.'],
            ['sku' => 'SKU-1003', 'name' => 'Silla ergonomica', 'category' => 'Mobiliario', 'brand' => 'Ergo', 'cost' => 210000, 'price' => 320000, 'reorder' => 3, 'public' => true, 'description' => 'Silla de oficina con soporte lumbar ajustable, apoyabrazos 3D y base metalica con ruedas para piso duro.'],
            ['sku' => 'SKU-1004', 'name' => 'Monitor 24" LED', 'category' => 'Electronica', 'brand' => 'HP', 'cost' => 480000, 'price' => 650000, 'reorder' => 4, 'public' => true, 'description' => 'Monitor IPS Full HD de 24 pulgadas, 75 Hz, entradas HDMI y VGA, base con ajuste de inclinacion.'],
            ['sku' => 'SKU-1005', 'name' => 'Teclado inalambrico', 'category' => 'Electronica', 'brand' => 'Logitech', 'cost' => 45000, 'price' => 72000, 'reorder' => 10, 'public' => true, 'description' => 'Teclado inalambrico 2.4 GHz con distribucion en espanol, teclas silenciosas y hasta 24 meses de bateria.'],
            ['sku' => 'SKU-1006', 'name' => 'Mouse optico', 'category' => 'Electronica', 'brand' => 'Logitech', 'cost' => 22000, 'price' => 38000, 'reorder' => 15, 'public' => true, 'description' => 'Mouse optico USB de 1.000 DPI, diseno ambidiestro y cable de 1,5 m.'],
            ['sku' => 'SKU-1007', 'name' => 'Dispensador de gel antibacterial', 'category' => 'Aseo', 'brand' => 'Generica', 'cost' => 18000, 'price' => 29000, 'reorder' => 8],
            ['sku' => 'SKU-1008', 'name' => 'Caja archivador oficio', 'category' => 'Oficina', 'brand' => 'Generica', 'cost' => 9000, 'price' => 15000, 'reorder' => 12],
        ])->map(fn ($data) => Product::firstOrCreate(
            ['company_id' => $company->id, 'sku' => $data['sku']],
            [
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'category_id' => $categories[$data['category']]->id,
                'brand_id' => $brands[$data['brand']]->id,
                'unit_id' => $unidadUnit->id,
                'cost_price' => $data['cost'],
                'unit_price' => $data['price'],
                'reorder_level' => $data['reorder'],
                'status' => 'active',
                'is_public' => $data['public'] ?? false,
            ],
        ));

        // Proveedores.
        $suppliers = collect([
            ['name' => 'Papeleria Continental', 'contact_name' => 'Jorge Nino', 'email' => 'ventas@papelcontinental.co'],
            ['name' => 'Tecno Import SAS', 'contact_name' => 'Marcela Duran', 'email' => 'compras@tecnoimport.co'],
            ['name' => 'Muebles y Espacios Ltda', 'contact_name' => 'Ricardo Pena', 'email' => 'pedidos@mueblesyespacios.co'],
        ])->map(fn ($data) => Supplier::firstOrCreate(['company_id' => $company->id, 'name' => $data['name']], $data + ['status' => 'active']));

        // Segmentos de cliente.
        $segments = collect(['Mayorista', 'Minorista', 'Institucional', 'Distribuidor'])
            ->mapWithKeys(fn ($name) => [$name => Segment::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])]);

        // Especies y razas (vertical veterinaria).
        $speciesBreeds = [
            'Perro' => ['Labrador Retriever', 'Golden Retriever', 'Criollo', 'Poodle', 'Bulldog Francés'],
            'Gato' => ['Siamés', 'Persa', 'Criollo', 'Angora'],
            'Ave' => ['Periquito', 'Canario', 'Agapornis'],
            'Conejo' => ['Mini Lop', 'Cabeza de León'],
        ];
        $species = collect($speciesBreeds)->mapWithKeys(function (array $breedNames, string $speciesName) use ($company) {
            $species = Species::firstOrCreate(['company_id' => $company->id, 'name' => $speciesName], ['status' => 'active']);
            foreach ($breedNames as $breedName) {
                Breed::firstOrCreate(
                    ['company_id' => $company->id, 'species_id' => $species->id, 'name' => $breedName],
                    ['status' => 'active'],
                );
            }

            return [$speciesName => $species];
        });

        // Catálogo de servicios de la clínica.
        collect([
            ['Consulta general', 'consulta', 30, 45000],
            ['Consulta especializada', 'consulta', 45, 80000],
            ['Vacunación', 'vacunacion', 15, 35000],
            ['Desparasitación', 'vacunacion', 15, 25000],
            ['Cirugía', 'cirugia', 120, 350000],
            ['Curación', 'curacion', 20, 30000],
            ['Hospitalización (día)', 'hospitalizacion', null, 120000],
            ['Peluquería / Baño', 'peluqueria', 60, 40000],
        ])->each(fn ($data) => Service::firstOrCreate(
            ['company_id' => $company->id, 'name' => $data[0]],
            ['type' => $data[1], 'estimated_duration_minutes' => $data[2], 'price' => $data[3], 'status' => 'active'],
        ));

        // Clientes.
        $clients = collect([
            ['name' => 'Laura Gutierrez', 'company_name' => 'Constructora Alfa', 'email' => 'compras@constructoraalfa.co', 'segment' => 'Mayorista'],
            ['name' => 'Andres Vargas', 'company_name' => 'Grupo Bienestar', 'email' => 'andres.vargas@grupobienestar.co', 'segment' => 'Institucional'],
            ['name' => 'Marcela Rios', 'company_name' => 'Colegio San Rafael', 'email' => 'administracion@sanrafael.edu.co', 'segment' => 'Institucional'],
            ['name' => 'Felipe Castano', 'company_name' => 'Clinica Vida Sana', 'email' => 'felipe.castano@vidasana.co', 'segment' => 'Institucional'],
            ['name' => 'Diana Torres', 'company_name' => 'Restaurante El Fogon', 'email' => 'diana@elfogon.co', 'segment' => 'Minorista'],
            ['name' => 'Camilo Herrera', 'company_name' => null, 'email' => 'camilo.herrera@gmail.com', 'segment' => 'Minorista'],
        ])->map(fn ($data) => Client::firstOrCreate(
            ['company_id' => $company->id, 'email' => $data['email']],
            ['name' => $data['name'], 'company_name' => $data['company_name'], 'segment_id' => $segments[$data['segment']]->id, 'status' => 'active'],
        ));

        // Contactos ligados a clientes.
        collect([
            [0, 'Laura Gutierrez', 'Jefe de compras', 'laura.gutierrez@constructoraalfa.co', '+57 310 555 0101'],
            [0, 'Mario Beltran', 'Asistente de compras', 'mario.beltran@constructoraalfa.co', '+57 310 555 0102'],
            [1, 'Andres Vargas', 'Gerente administrativo', 'andres.vargas@grupobienestar.co', '+57 315 555 0110'],
            [2, 'Marcela Rios', 'Coordinadora', 'marcela.rios@sanrafael.edu.co', '+57 320 555 0120'],
        ])->each(fn ($data) => Contact::firstOrCreate(
            ['company_id' => $company->id, 'name' => $data[1], 'client_id' => $clients[$data[0]]->id],
            ['role' => $data[2], 'email' => $data[3], 'phone' => $data[4], 'status' => 'active'],
        ));

        // Pacientes (mascotas) ligados a sus propietarios.
        $breedFor = fn (string $speciesName, string $breedName) => Breed::query()
            ->where(['company_id' => $company->id, 'species_id' => $species[$speciesName]->id, 'name' => $breedName])
            ->value('id');
        collect([
            [5, 'Luna', 'Perro', 'Golden Retriever', 'female', '2021-03-14', 28.4, true],
            [5, 'Rocky', 'Perro', 'Labrador Retriever', 'male', '2019-07-02', 32.1, false],
            [0, 'Michi', 'Gato', 'Criollo', 'female', '2022-11-20', 4.2, true],
            [1, 'Kiara', 'Perro', 'Criollo', 'female', '2020-01-05', 15.8, true],
            [4, 'Pipo', 'Ave', 'Periquito', 'unknown', null, 0.05, false],
            [2, 'Toby', 'Perro', 'Poodle', 'male', '2023-05-30', 6.7, false],
        ])->each(fn ($data) => Patient::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[$data[0]]->id, 'name' => $data[1]],
            [
                'species_id' => $species[$data[2]]->id,
                'breed_id' => $breedFor($data[2], $data[3]),
                'sex' => $data[4],
                'birth_date' => $data[5],
                'weight' => $data[6],
                'sterilized' => $data[7],
                'status' => 'active',
            ],
        ));

        // Citas de la agenda (algunas hoy, otras esta semana).
        $vetPatients = Patient::where('company_id', $company->id)->get();
        $consultaService = Service::where(['company_id' => $company->id, 'name' => 'Consulta general'])->first();
        $vacunaService = Service::where(['company_id' => $company->id, 'name' => 'Vacunación'])->first();
        if ($vetPatients->isNotEmpty() && $consultaService) {
            $appointmentPlan = [
                [0, $consultaService, now()->setTime(9, 0), 'confirmed', 'Control anual', 'Consultorio 1'],
                [1, $vacunaService, now()->setTime(10, 30), 'scheduled', 'Refuerzo antirrábica', 'Consultorio 1'],
                [2, $consultaService, now()->setTime(11, 0), 'attended', 'Chequeo por vómitos', 'Consultorio 2'],
                [3, $consultaService, now()->addDay()->setTime(15, 0), 'scheduled', 'Primera consulta', 'Consultorio 1'],
                [4, $consultaService, now()->addDays(2)->setTime(16, 30), 'scheduled', 'Revisión ala', 'Consultorio 2'],
            ];
            foreach ($appointmentPlan as [$idx, $service, $start, $status, $reason, $room]) {
                $patient = $vetPatients->get($idx % $vetPatients->count());
                $minutes = $service?->estimated_duration_minutes ?: 30;
                Appointment::firstOrCreate(
                    ['company_id' => $company->id, 'patient_id' => $patient->id, 'starts_at' => $start],
                    [
                        'service_id' => $service?->id,
                        'practitioner_id' => $admin?->id,
                        'ends_at' => $start->copy()->addMinutes($minutes),
                        'duration_minutes' => $minutes,
                        'resource' => $room,
                        'reason' => $reason,
                        'status' => $status,
                    ],
                );
            }
        }

        // Historia clínica: un par de consultas SOAP.
        if ($vetPatients->isNotEmpty()) {
            collect([
                [0, now()->subDays(20), 'Control anual', 28.4, 38.6,
                    'Propietario refiere apetito normal y actividad habitual.',
                    'Mucosas rosadas, TLLC < 2s. Auscultación cardiopulmonar sin hallazgos.',
                    'Paciente sano. Peso adecuado.',
                    'Continuar plan de alimentación. Próximo control en 12 meses. Refuerzo de vacunas al día.'],
                [2, now()->subDays(3), 'Vómitos de 24h', 15.6, 39.1,
                    'Vómito x3 en las últimas 24h, última comida no retenida. Bebe agua.',
                    'Abdomen doloroso a la palpación craneal. Deshidratación 5%.',
                    'Gastroenteritis aguda, probable indiscreción alimentaria.',
                    'Fluidoterapia SC. Dieta blanda 48h. Antiemético. Control en 48h si no mejora.'],
            ])->each(fn ($d) => Consultation::firstOrCreate(
                [
                    'company_id' => $company->id,
                    'patient_id' => $vetPatients->get($d[0] % $vetPatients->count())->id,
                    'date' => $d[1]->toDateString(),
                ],
                [
                    'vet_id' => $admin?->id,
                    'reason' => $d[2],
                    'weight' => $d[3],
                    'temperature' => $d[4],
                    'subjective' => $d[5],
                    'objective' => $d[6],
                    'assessment' => $d[7],
                    'plan' => $d[8],
                ],
            ));
        }

        // Notas comerciales sobre algunos clientes.
        collect([
            [0, 'Cliente pidio cotizacion para proyecto nuevo. Prefiere entregas los martes.'],
            [1, 'Renovacion anual en negociacion. Sensible al precio, valora el soporte.'],
            [3, 'Contacto inicial por el sitio web. Interesado en el modulo de inventario.'],
        ])->each(fn ($data) => ClientNote::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[$data[0]]->id, 'body' => $data[1]],
            ['user_id' => $admin->id],
        ));

        // Deals en distintas etapas del pipeline.
        $stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'won', 'lost'];
        $deals = collect();
        foreach ($clients as $index => $client) {
            $deals->push(Deal::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $client->id, 'title' => 'Suministro de oficina - '.$client->company_name ?? $client->name],
                ['owner_id' => $owners[$index % count($owners)]->id, 'amount' => 800000 + $index * 350000, 'stage' => $stages[$index % count($stages)], 'expected_close_date' => Carbon::today()->addDays(10 + $index * 5)],
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

        // Tareas pendientes y seguimientos programados.
        collect([
            ['task', 'Enviar cotizacion a Constructora Alfa', 0, 1, false],
            ['task', 'Confirmar disponibilidad de sillas ergonomicas', null, 3, false],
            ['followup', 'Volver a llamar a Grupo Bienestar', 1, 7, false],
            ['followup', 'Retomar contacto con Colegio San Rafael', 2, -2, false],
        ])->each(fn ($data) => Activity::firstOrCreate(
            ['company_id' => $company->id, 'subject' => $data[1]],
            [
                'client_id' => $data[2] === null ? null : $clients[$data[2]]->id,
                'type' => $data[0],
                'due_date' => Carbon::today()->addDays($data[3]),
                'completed' => $data[4],
            ],
        ));

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
                PurchaseOrderItem::create(['purchase_order_id' => $purchaseOrder->id, 'product_id' => $product->id, 'product_name' => $product->name, 'sku' => $product->sku, 'quantity' => $qty, 'unit_cost' => $product->cost_price]);
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

        // Transferencia demo: mueve stock de la Bodega Principal a la Norte.
        if (StockTransfer::where('company_id', $company->id)->doesntExist()) {
            $transferProduct = $products[0];
            $transfer = StockTransfer::create([
                'company_id' => $company->id,
                'product_id' => $transferProduct->id,
                'from_warehouse_id' => $mainWarehouse->id,
                'to_warehouse_id' => $warehouses[1]->id,
                'quantity' => 15,
                'reference' => 'TR-0001',
                'notes' => 'Reabastecimiento de la sucursal norte.',
                'status' => 'completed',
            ]);
            foreach ([[$mainWarehouse->id, -15], [$warehouses[1]->id, 15]] as [$warehouseId, $qty]) {
                StockMovement::create([
                    'company_id' => $company->id, 'product_id' => $transferProduct->id, 'warehouse_id' => $warehouseId,
                    'type' => 'adjustment', 'quantity' => $qty, 'reason' => 'Transferencia entre bodegas',
                    'reference' => 'transfer:'.$transfer->id,
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
        foreach ($orderPlans as $planIndex => $plan) {
            // Sin `status` en la clave: un pedido ya confirmado no debe generar
            // un duplicado en un segundo reseed.
            $order = Order::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $plan['client']->id, 'warehouse_id' => $mainWarehouse->id],
                ['owner_id' => $owners[$planIndex % count($owners)]->id, 'status' => 'draft', 'total' => 0],
            );
            if ($order->items()->count() > 0) {
                continue;
            }
            $total = 0;
            foreach ($plan['items'] as [$product, $qty]) {
                OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'product_name' => $product->name, 'sku' => $product->sku, 'quantity' => $qty, 'unit_price' => $product->unit_price]);
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

        // Cotizaciones: una en borrador, una enviada, una aceptada.
        $quotePlans = [
            ['client' => $clients[0], 'status' => 'draft', 'title' => 'Dotacion de oficina Q1', 'items' => [[$products[0], 40], [$products[7], 20]]],
            ['client' => $clients[1], 'status' => 'sent', 'title' => 'Equipos de computo', 'items' => [[$products[3], 3], [$products[4], 3]]],
            ['client' => $clients[2], 'status' => 'accepted', 'title' => 'Mobiliario aulas', 'items' => [[$products[2], 6]]],
        ];
        foreach ($quotePlans as $plan) {
            $quote = Quote::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $plan['client']->id, 'title' => $plan['title']],
                ['status' => 'draft', 'valid_until' => Carbon::today()->addDays(15), 'total' => 0],
            );
            if ($quote->items()->count() > 0) {
                continue;
            }
            $total = 0;
            foreach ($plan['items'] as [$product, $qty]) {
                QuoteItem::create(['quote_id' => $quote->id, 'product_id' => $product->id, 'product_name' => $product->name, 'sku' => $product->sku, 'quantity' => $qty, 'unit_price' => $product->unit_price]);
                $total += $qty * $product->unit_price;
            }
            $quote->update(['total' => $total, 'status' => $plan['status']]);
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
