<?php

namespace Database\Seeders;

use App\Models\AccountPayable;
use App\Models\AccountReceivable;
use App\Models\Activity;
use App\Models\Appointment;
use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Brand;
use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\CashSession;
use App\Models\Category;
use App\Models\Client;
use App\Models\ClientNote;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Department;
use App\Models\Diagnosis;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Lead;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\PermissionRequest;
use App\Models\Position;
use App\Models\Procedure;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Segment;
use App\Models\Service;
use App\Models\SickLeave;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use App\Models\VacationRequest;
use App\Models\Warehouse;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Dataset demo de la vertical Recursos Humanos & Nómina (HRMS).
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $company = Company::firstOrCreate([
            'name' => 'Talent & HR Solutions S.A.S.',
        ], [
            'nit' => '901.245.880-3',
            'email' => 'contacto@talenthrms.test',
            'phone' => '+57 601 555 0188',
            'address' => 'Calle 93 #14-20, Bogotá',
            'timezone' => 'America/Bogota',
            'locale' => 'es',
        ]);

        [$users] = $this->seedRolesAndUsers($company);
        $admin = $users['admin@talenthrms.test'];
        $reception = $users['recepcion@talenthrms.test'];

        $warehouses = $this->seedWarehouses($company);
        $mainWarehouse = $warehouses['Almacén Central / Insumos'];

        [$products, $publicProducts] = $this->seedInventoryCatalog($company);
        $suppliers = $this->seedSuppliers($company);
        $this->seedCashRegisters($company);
        $segments = $this->seedSegments($company);
        $services = $this->seedServices($company);

        $clients = $this->seedOwners($company, $segments);
        $this->seedContacts($company, $clients);

        $this->seedStock($company, $products, $suppliers, $mainWarehouse, $warehouses);
        $this->seedLeads($company);
        $this->seedProductSales($company, $clients, $publicProducts, $mainWarehouse, $reception);
        $this->seedSurgeryQuotes($company, $clients, $services);
        $this->seedWellnessDeals($company, $clients, $admin, $users['ventas@talenthrms.test']);
        $this->seedClientNotesAndTasks($company, $clients, $admin, $reception);

        // Módulos específicos de Recursos Humanos (HRMS)
        [$depts, $positions] = $this->seedDepartmentsAndPositions($company);
        $employees = $this->seedEmployees($company, $depts, $positions);
        $this->seedAttendances($company, $employees);
        $this->seedVacationAndPermissionRequests($company, $employees, $admin);

        // Módulos financieros transversales
        $this->seedInvoicesAndAccounts($company, $clients, $products, $reception, $mainWarehouse);
        $this->seedAccountsPayable($company, $suppliers);
        $this->seedCashSessions($company, $reception);
    }

    private function seedRolesAndUsers(Company $company): array
    {
        $permissionNames = [
            'dashboard.view', 'leads.view', 'clients.manage', 'clients.delete', 'deals.manage', 'activities.manage',
            'products.manage', 'warehouses.manage', 'stock.manage', 'suppliers.manage', 'purchase_orders.manage',
            'purchase_receipts.manage', 'orders.manage', 'invoices.manage', 'accounts_receivable.view',
            'accounts_payable.view', 'payments.manage', 'cash.manage', 'reports.view',
            'users.manage', 'roles.manage', 'audit.view', 'settings.manage', 'services.manage',
            'patients.manage', 'appointments.manage', 'medical_records.manage',
            'vaccinations.manage', 'prescriptions.manage', 'procedures.manage', 'clinical_reports.view',
            'hrms.view', 'employees.manage', 'payroll.manage', 'attendances.manage',
        ];

        foreach ($permissionNames as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $roles = [
            'Super Admin' => $permissionNames,
            'Administrador de empresa' => $permissionNames,
            'Director HR' => $permissionNames,
            'Recepción' => [
                'dashboard.view', 'leads.view', 'clients.manage', 'patients.manage', 'services.manage',
                'appointments.manage', 'orders.manage', 'invoices.manage', 'accounts_receivable.view',
                'payments.manage', 'cash.manage', 'reports.view',
            ],
            'Ventas' => ['dashboard.view', 'leads.view', 'clients.manage', 'deals.manage', 'reports.view'],
            'Inventario' => ['dashboard.view', 'products.manage', 'warehouses.manage', 'stock.manage'],
            'Usuario' => ['dashboard.view'],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web'])->syncPermissions($rolePermissions);
        }

        $demo = [
            ['superadmin@talenthrms.test', 'Sofía Mercado', 'Super Admin'],
            ['admin@talenthrms.test', 'Camila Rojas', 'Administrador de empresa'],
            ['hr@talenthrms.test', 'Dra. Andrea Gómez', 'Director HR'],
            ['recepcion@talenthrms.test', 'Marcela Duarte', 'Recepción'],
            ['inventario@talenthrms.test', 'Valentina Castro', 'Inventario'],
            ['ventas@talenthrms.test', 'Sebastián Moreno', 'Ventas'],
        ];

        $users = [];
        foreach ($demo as [$email, $name, $role]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                ['company_id' => $company->id, 'name' => $name, 'password' => Hash::make('password'), 'status' => 'active'],
            );
            $user->syncRoles([$role]);
            $users[$email] = $user;
        }

        return [$users];
    }

    private function seedDepartmentsAndPositions(Company $company): array
    {
        $depData = [
            'Gestión Humana & Selección' => ['Director de Talentos', 'Analista de Selección', 'Generalista HR'],
            'Tecnología & Desarrollo' => ['Líder Técnico', 'Desarrollador Senior', 'Desarrollador Frontend'],
            'Finanzas & Contabilidad' => ['Jefe Contable', 'Analista Financiero'],
            'Operaciones & Comercial' => ['Gerente Operativo', 'Ejecutivo Comercial'],
        ];

        $depts = [];
        $positions = [];

        foreach ($depData as $deptName => $posList) {
            $dept = Department::firstOrCreate(
                ['company_id' => $company->id, 'name' => $deptName],
                ['description' => "Departamento de $deptName", 'status' => 'active']
            );
            $depts[$deptName] = $dept;

            foreach ($posList as $posName) {
                $pos = Position::firstOrCreate(
                    ['company_id' => $company->id, 'department_id' => $dept->id, 'name' => $posName],
                    ['description' => "Cargo de $posName", 'status' => 'active']
                );
                $positions[$posName] = $pos;
            }
        }

        return [$depts, $positions];
    }

    private function seedEmployees(Company $company, array $depts, array $positions): Collection
    {
        $employeesData = [
            ['EMP-001', 'Andrea', 'María', 'Gómez', 'Pérez', 'CC', '1018293847', 'andrea.gomez@talenthrms.test', '+57 310 555 0101', '1988-03-14', 'female', 'Gestión Humana & Selección', 'Director de Talentos', 'indefinite', 8500000],
            ['EMP-002', 'Carlos', 'Eduardo', 'Mendoza', 'Ríos', 'CC', '1020394857', 'carlos.mendoza@talenthrms.test', '+57 311 555 0102', '1992-07-02', 'male', 'Tecnología & Desarrollo', 'Líder Técnico', 'indefinite', 9200000],
            ['EMP-003', 'Mariana', 'Lucía', 'Fernández', 'Ortiz', 'CC', '52839201', 'mariana.fernandez@talenthrms.test', '+57 312 555 0103', '1995-11-20', 'female', 'Tecnología & Desarrollo', 'Desarrollador Senior', 'indefinite', 6800000],
            ['EMP-004', 'Santiago', 'Alberto', 'Morales', 'Castro', 'CC', '1032948201', 'santiago.morales@talenthrms.test', '+57 313 555 0104', '1985-02-10', 'male', 'Finanzas & Contabilidad', 'Jefe Contable', 'indefinite', 5800000],
            ['EMP-005', 'Valentina', 'Isabel', 'Torres', 'Vargas', 'CC', '1015839201', 'valentina.torres@talenthrms.test', '+57 314 555 0105', '1998-01-05', 'female', 'Gestión Humana & Selección', 'Analista de Selección', 'fixed_term', 3500000],
            ['EMP-006', 'Gabriel', 'Antonio', 'Silva', 'Osorio', 'CC', '80192837', 'gabriel.silva@talenthrms.test', '+57 316 555 0108', '1976-09-12', 'male', 'Operaciones & Comercial', 'Gerente Operativo', 'indefinite', 7500000],
            ['EMP-007', 'Camila', 'Esperanza', 'Vargas', 'Restrepo', 'CC', '1028394812', 'camila.vargas@talenthrms.test', '+57 317 555 0109', '1990-12-01', 'female', 'Operaciones & Comercial', 'Ejecutivo Comercial', 'indefinite', 3800000],
            ['EMP-008', 'Daniela', 'Sofía', 'Ríos', 'Méndez', 'CC', '52938471', 'daniela.rios@talenthrms.test', '+57 318 555 0110', '1984-06-25', 'female', 'Finanzas & Contabilidad', 'Analista Financiero', 'fixed_term', 3200000],
        ];

        $out = collect();
        foreach ($employeesData as $d) {
            [$code, $fn, $mn, $ln, $sln, $docType, $docNum, $email, $phone, $bday, $gender, $deptName, $posName, $contract, $salary] = $d;

            $emp = Employee::firstOrCreate(
                ['company_id' => $company->id, 'employee_code' => $code],
                [
                    'first_name' => $fn,
                    'middle_name' => $mn,
                    'last_name' => $ln,
                    'second_last_name' => $sln,
                    'identification_type' => $docType,
                    'identification_number' => $docNum,
                    'email' => $email,
                    'phone' => $phone,
                    'birth_date' => $bday,
                    'gender' => $gender,
                    'address' => 'Calle 100 #15-30, Bogotá',
                    'city' => 'Bogotá',
                    'hire_date' => Carbon::today()->subMonths(18),
                    'employment_status' => 'active',
                    'department_id' => $depts[$deptName]->id,
                    'position_id' => $positions[$posName]->id,
                    'contract_type' => $contract,
                    'salary' => $salary,
                    'work_schedule' => 'Lunes a Viernes 8:00 AM - 5:00 PM',
                ]
            );
            $out->push($emp);
        }

        return $out;
    }

    private function seedAttendances(Company $company, Collection $employees): void
    {
        for ($i = 0; $i < 5; $i++) {
            $date = Carbon::today()->subDays($i);
            if ($date->isWeekend()) continue;

            foreach ($employees as $emp) {
                Attendance::firstOrCreate(
                    ['company_id' => $company->id, 'employee_id' => $emp->id, 'date' => $date->toDateString()],
                    [
                        'check_in' => '08:0'.random_int(0, 5).':00',
                        'check_out' => '17:0'.random_int(0, 9).':00',
                        'status' => 'present',
                        'late_minutes' => random_int(0, 5),
                        'notes' => 'Registro biológico biométrico regular',
                    ]
                );
            }
        }
    }

    private function seedVacationAndPermissionRequests(Company $company, Collection $employees, User $admin): void
    {
        if ($employees->count() >= 3) {
            VacationRequest::firstOrCreate(
                ['company_id' => $company->id, 'employee_id' => $employees[0]->id, 'start_date' => Carbon::today()->addDays(10)->toDateString()],
                [
                    'end_date' => Carbon::today()->addDays(25)->toDateString(),
                    'requested_days' => 15,
                    'reason' => 'Vacaciones anuales reglamentarias',
                    'status' => 'approved',
                    'approved_by' => $admin->id,
                    'approved_at' => Carbon::now()->subDays(2),
                ]
            );

            PermissionRequest::firstOrCreate(
                ['company_id' => $company->id, 'employee_id' => $employees[1]->id, 'start_date' => Carbon::today()->subDays(3)->toDateString()],
                [
                    'end_date' => Carbon::today()->subDays(3)->toDateString(),
                    'type' => 'medical',
                    'reason' => 'Cita médica especialista EPS',
                    'status' => 'approved',
                    'approved_by' => $admin->id,
                ]
            );

            SickLeave::firstOrCreate(
                ['company_id' => $company->id, 'employee_id' => $employees[2]->id, 'start_date' => Carbon::today()->subDays(5)->toDateString()],
                [
                    'end_date' => Carbon::today()->subDays(3)->toDateString(),
                    'type' => 'general',
                    'description' => 'Incapacidad médica por virosis',
                    'days' => 2,
                    'status' => 'processed',
                ]
            );
        }
    }

    private function seedWarehouses(Company $company): array
    {
        return collect([
            ['name' => 'Almacén Central / Insumos', 'location' => 'Piso 1'],
            ['name' => 'Depósito de Papelería', 'location' => 'Piso 2'],
        ])->mapWithKeys(fn ($data) => [
            $data['name'] => Warehouse::firstOrCreate(
                ['company_id' => $company->id, 'name' => $data['name']],
                $data + ['status' => 'active'],
            ),
        ])->all();
    }

    private function seedInventoryCatalog(Company $company): array
    {
        $categories = collect(['Equipos', 'Papelería', 'Tecnología', 'Mobiliario'])
            ->mapWithKeys(fn ($name) => [$name => Category::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])]);
        $brands = collect(['Dell', 'HP', 'Logitech', 'Genérico'])
            ->mapWithKeys(fn ($name) => [$name => Brand::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])]);
        $units = collect([
            ['name' => 'Unidad', 'abbreviation' => 'un'],
            ['name' => 'Caja', 'abbreviation' => 'cja'],
        ])->mapWithKeys(fn ($d) => [$d['name'] => Unit::firstOrCreate(['company_id' => $company->id, 'name' => $d['name']], $d + ['status' => 'active'])]);

        $rows = [
            ['PROD-LAPTOP', 'Laptop Empresarial Core i7', 'Tecnología', 'Dell', 'Unidad', 2800000, 4200000, 5, true, 'Equipo para onboarding de colaboradores.'],
            ['PROD-MONITOR', 'Monitor 24 FHD', 'Tecnología', 'HP', 'Unidad', 450000, 780000, 10, true, 'Monitor secundario ergonómico.'],
            ['PROD-KIT-PER', 'Kit Teclado + Mouse Inalámbrico', 'Tecnología', 'Logitech', 'Unidad', 85000, 150000, 15, true, 'Periféricos ergonómicos.'],
        ];

        $products = collect($rows)->map(function (array $r) use ($company, $categories, $brands, $units) {
            [$sku, $name, $cat, $brand, $unit, $cost, $price, $reorder, $public, $desc] = $r;

            return Product::firstOrCreate(
                ['company_id' => $company->id, 'sku' => $sku],
                [
                    'name' => $name,
                    'description' => $desc,
                    'category_id' => $categories[$cat]->id,
                    'brand_id' => $brands[$brand]->id,
                    'unit_id' => $units[$unit]->id ?? $units['Unidad']->id,
                    'cost_price' => $cost,
                    'unit_price' => $price,
                    'reorder_level' => $reorder,
                    'status' => 'active',
                    'is_public' => $public,
                ],
            );
        });

        return [$products, $products];
    }

    private function seedSuppliers(Company $company): Collection
    {
        return collect([
            ['name' => 'Suministros Corporativos Colombia', 'contact_name' => 'Jorge Niño', 'email' => 'ventas@suministroscorp.example'],
            ['name' => 'Dotaciones & Equipo SAS', 'contact_name' => 'Marcela Durán', 'email' => 'comercial@dotaciones.example'],
        ])->map(fn ($d) => Supplier::firstOrCreate(['company_id' => $company->id, 'name' => $d['name']], $d + ['status' => 'active']));
    }

    private function seedCashRegisters(Company $company): void
    {
        CashRegister::firstOrCreate(
            ['company_id' => $company->id, 'name' => 'Caja principal RRHH'],
            ['status' => 'active'],
        );
    }

    private function seedSegments(Company $company): array
    {
        return collect(['Corporativo', 'Pyme', 'Multinacional'])
            ->mapWithKeys(fn ($name) => [$name => Segment::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])])
            ->all();
    }

    private function seedServices(Company $company): array
    {
        return collect([
            ['Consultoría en Selección & Headhunting', 'consulta', 60, 1500000],
            ['Auditoría de Nómina & Seguridad Social', 'consulta', 120, 2800000],
            ['Capacitación Corporativa en Liderazgo', 'otro', 240, 3500000],
        ])->mapWithKeys(fn ($d) => [
            $d[0] => Service::firstOrCreate(
                ['company_id' => $company->id, 'name' => $d[0]],
                ['type' => $d[1], 'estimated_duration_minutes' => $d[2], 'price' => $d[3], 'status' => 'active'],
            ),
        ])->all();
    }

    private function seedOwners(Company $company, array $segments): Collection
    {
        $rows = [
            ['Nexa BPO Colombia', 'Nexa BPO S.A.', 'contacto@nexabpo.example', '+57 601 555 0101', 'Av 68 #40-11, Bogotá', 'Corporativo'],
            ['Banco de la Sabana', 'Banco Sabana S.A.', 'rrhh@bancosabana.example', '+57 601 555 0102', 'Calle 72 #10-34, Bogotá', 'Multinacional'],
            ['Logística & Envíos Express', 'Logística Express', 'gestion@logisticaexpress.example', '+57 601 555 0103', 'Cra 30 #12-45, Bogotá', 'Pyme'],
        ];

        return collect($rows)->map(fn ($d) => Client::firstOrCreate(
            ['company_id' => $company->id, 'email' => $d[2]],
            [
                'name' => $d[0], 'company_name' => $d[1], 'phone' => $d[3], 'address' => $d[4],
                'segment_id' => $segments[$d[5]]->id, 'status' => 'active',
            ],
        ));
    }

    private function seedContacts(Company $company, Collection $clients): void
    {
        collect([
            [0, 'Ana María Lima', 'Gerente de Talentos', 'ana.lima@nexabpo.example', '+57 322 555 0312'],
            [1, 'Roberto Gómez', 'VP de Recursos Humanos', 'roberto.gomez@bancosabana.example', '+57 323 555 0313'],
        ])->each(fn ($d) => Contact::firstOrCreate(
            ['company_id' => $company->id, 'name' => $d[1], 'client_id' => $clients[$d[0]]->id],
            ['role' => $d[2], 'email' => $d[3], 'phone' => $d[4], 'status' => 'active'],
        ));
    }

    private function seedStock(Company $company, Collection $products, Collection $suppliers, Warehouse $mainWarehouse, array $warehouses): void
    {
        foreach ($products as $product) {
            StockMovement::firstOrCreate(
                ['company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $mainWarehouse->id, 'reason' => 'Inventario inicial de equipos'],
                ['type' => 'in', 'quantity' => 20]
            );
        }
    }

    private function seedLeads(Company $company): void
    {
        Lead::firstOrCreate(
            ['company_id' => $company->id, 'email' => 'prospecto.rrhh@empresa.example'],
            ['name' => 'Empresa Soluciones IT', 'phone' => '+57 300 111 2233', 'message' => 'Solicitud de presupuesto para outsourcing de nómina', 'status' => 'new']
        );
    }

    private function seedProductSales(Company $company, Collection $clients, Collection $publicProducts, Warehouse $warehouse, User $reception): void
    {
        $order = Order::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[0]->id, 'warehouse_id' => $warehouse->id],
            ['owner_id' => $reception->id, 'status' => 'confirmed', 'total' => 4200000]
        );
        if ($order->items()->count() === 0 && $publicProducts->count() > 0) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $publicProducts[0]->id,
                'product_name' => $publicProducts[0]->name,
                'sku' => $publicProducts[0]->sku,
                'quantity' => 1,
                'unit_price' => $publicProducts[0]->unit_price,
            ]);
        }
    }

    private function seedSurgeryQuotes(Company $company, Collection $clients, array $services): void
    {
        Quote::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[0]->id, 'title' => 'Propuesta de Consultoría HR'],
            ['status' => 'sent', 'valid_until' => Carbon::today()->addDays(30), 'total' => 3500000]
        );
    }

    private function seedWellnessDeals(Company $company, Collection $clients, User $admin, User $sales): void
    {
        Deal::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[0]->id, 'title' => 'Contrato Anual de Reclutamiento'],
            ['owner_id' => $admin->id, 'amount' => 12000000, 'stage' => 'won', 'expected_close_date' => Carbon::today()]
        );
    }

    private function seedClientNotesAndTasks(Company $company, Collection $clients, User $admin, User $reception): void
    {
        ClientNote::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[0]->id, 'body' => 'Reunión mensual de seguimiento de contratación.'],
            ['user_id' => $admin->id]
        );
    }

    private function seedInvoicesAndAccounts(Company $company, Collection $clients, Collection $products, User $reception, Warehouse $warehouse): void
    {
        $invoice = Invoice::firstOrCreate(
            ['company_id' => $company->id, 'number' => 'FE-HR1001'],
            [
                'client_id' => $clients[0]->id,
                'warehouse_id' => $warehouse->id,
                'user_id' => $reception->id,
                'issue_date' => Carbon::today()->subDays(10),
                'due_date' => Carbon::today()->addDays(20),
                'status' => 'paid',
                'subtotal' => 3500000,
                'discount' => 0,
                'tax' => 665000,
                'total' => 4165000,
                'notes' => 'Factura por servicios de consultoría HR',
            ]
        );

        if ($invoice->wasRecentlyCreated) {
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'product_id' => null,
                'product_name' => 'Consultoría de Selección Corporativa',
                'sku' => 'SERV-HR01',
                'quantity' => 1,
                'unit_price' => 3500000,
                'discount' => 0,
                'tax' => 665000,
                'line_total' => 4165000,
            ]);

            AccountReceivable::create([
                'company_id' => $company->id,
                'client_id' => $clients[0]->id,
                'invoice_id' => $invoice->id,
                'original_amount' => 4165000,
                'paid_amount' => 4165000,
                'balance' => 0,
                'due_date' => Carbon::today()->addDays(20),
                'status' => 'paid',
            ]);
        }
    }

    private function seedAccountsPayable(Company $company, Collection $suppliers): void
    {
        AccountPayable::firstOrCreate(
            ['company_id' => $company->id, 'supplier_id' => $suppliers[0]->id, 'original_amount' => 1500000],
            ['paid_amount' => 0, 'balance' => 1500000, 'due_date' => Carbon::today()->addDays(15), 'status' => 'pending']
        );
    }

    private function seedCashSessions(Company $company, User $reception): void
    {
        $register = CashRegister::where('company_id', $company->id)->first();
        if (!$register) return;

        $s1 = CashSession::firstOrCreate(
            ['company_id' => $company->id, 'cash_register_id' => $register->id, 'opened_at' => Carbon::today()->setTime(8, 0)],
            ['opened_by' => $reception->id, 'opening_amount' => 500000, 'expected_amount' => 500000, 'closing_amount' => 0, 'difference' => 0, 'status' => 'open', 'notes' => 'Turno activo RRHH']
        );
    }
}
