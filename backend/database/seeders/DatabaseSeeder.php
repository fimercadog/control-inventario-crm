<?php

namespace Database\Seeders;

use App\Models\AccountPayable;
use App\Models\AccountReceivable;
use App\Models\Activity;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Brand;
use App\Models\Breed;
use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\CashSession;
use App\Models\Category;
use App\Models\Client;
use App\Models\ClientNote;
use App\Models\ClinicalApplication;
use App\Models\Company;
use App\Models\Consultation;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Diagnosis;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Lead;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\Procedure;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\PurchaseReceipt;
use App\Models\PurchaseReceiptItem;
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
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Dataset demo de la vertical Clínica Estética & Medicina Antiaging Élite.
 *
 * Todo el contenido es ficticio y coherente con una clínica de medicina estética:
 * pacientes y valoraciones, agenda con citas pasadas/hoy/futuras, ficha médica
 * SOAP, aplicaciones y dosis (algunas descuentan stock), diagnósticos estéticos,
 * recomendaciones, tratamientos y protocolos, catálogo e insumos médicos,
 * ventas de producto/dermocosmética, presupuestos, facturación, cuentas por cobrar,
 * cuentas por pagar, sesiones de caja, transferencias y solicitudes del sitio público.
 * `migrate:fresh --seed` es idempotente.
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $company = Company::firstOrCreate([
            'name' => 'Clínica Estética & Medicina Antiaging Élite',
        ], [
            'nit' => '901.245.880-3',
            'email' => 'recepcion@esteticaelite.co',
            'phone' => '+57 601 555 0188',
            'address' => 'Calle 93 #14-20, Chicó, Bogotá',
            'timezone' => 'America/Bogota',
            'locale' => 'es',
        ]);

        [$users, $doctors] = $this->seedRolesAndUsers($company);
        $admin = $users['admin@esteticaelite.co'];
        $reception = $users['recepcion@esteticaelite.co'];

        $warehouses = $this->seedWarehouses($company);
        $mainWarehouse = $warehouses['Farmacia & Insumos Estéticos'];

        [$products, $publicProducts] = $this->seedInventoryCatalog($company);
        $suppliers = $this->seedSuppliers($company);
        $this->seedCashRegisters($company);
        $segments = $this->seedSegments($company);
        $species = $this->seedSpeciesAndBreeds($company);
        $services = $this->seedServices($company);

        $clients = $this->seedOwners($company, $segments);
        $this->seedContacts($company, $clients);
        $patients = $this->seedPatients($company, $clients, $species);

        $this->seedStock($company, $products, $suppliers, $mainWarehouse, $warehouses);
        $this->seedStockTransfers($company, $products, $warehouses);

        $appointments = $this->seedAppointments($company, $patients, $services, $doctors);
        $consultations = $this->seedConsultations($company, $patients, $appointments, $doctors);
        $diagnoses = $this->seedDiagnoses($company);
        $this->attachDiagnoses($consultations, $diagnoses);
        $this->seedClinicalApplications($company, $patients, $products, $doctors, $mainWarehouse, $consultations);
        $this->seedPrescriptions($company, $consultations, $products, $doctors);
        $this->seedProcedures($company, $patients, $services, $doctors);

        $this->seedLeads($company);
        $orders = $this->seedProductSales($company, $clients, $publicProducts, $mainWarehouse, $reception);
        $this->seedSurgeryQuotes($company, $clients, $services);
        $this->seedWellnessDeals($company, $clients, $admin, $users['ventas@esteticaelite.co']);

        [$invoices, $receivables] = $this->seedInvoicesAndReceivables($company, $clients, $orders, $mainWarehouse, $admin);
        $payables = $this->seedPurchaseReceiptsAndPayables($company, $suppliers, $mainWarehouse, $admin, $products);
        $this->seedCashSessionsMovementsAndPayments($company, $admin, $reception, $receivables, $payables);

        $this->seedClientNotesAndTasks($company, $clients, $patients, $admin, $reception);
        $this->seedAuditLog($company, $admin, $clients, $patients);
    }

    // ---------------------------------------------------------------- usuarios

    /** @return array{0: array<string,User>, 1: array<int,User>} */
    private function seedRolesAndUsers(Company $company): array
    {
        $permissionNames = [
            'dashboard.view', 'leads.view', 'clients.manage', 'clients.delete', 'deals.manage', 'activities.manage',
            'products.manage', 'warehouses.manage', 'stock.manage', 'suppliers.manage', 'purchase_orders.manage',
            'purchase_receipts.manage', 'orders.manage', 'invoices.manage', 'accounts_receivable.view',
            'accounts_payable.view', 'payments.manage', 'cash.manage', 'reports.view',
            'users.manage', 'roles.manage', 'audit.view', 'settings.manage',
            'services.manage', 'patients.manage', 'appointments.manage', 'medical_records.manage',
            'vaccinations.manage', 'prescriptions.manage', 'procedures.manage', 'clinical_reports.view',
        ];

        $clinical = [
            'services.manage', 'patients.manage', 'appointments.manage', 'medical_records.manage',
            'vaccinations.manage', 'prescriptions.manage', 'procedures.manage', 'clinical_reports.view',
        ];

        foreach ($permissionNames as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $roles = [
            'Super Admin' => $permissionNames,
            'Administrador de empresa' => $permissionNames,
            'Médico/a Especialista' => array_merge(['dashboard.view', 'clients.manage', 'orders.manage', 'reports.view'], $clinical),
            'Recepción' => [
                'dashboard.view', 'leads.view', 'clients.manage', 'patients.manage', 'services.manage',
                'appointments.manage', 'orders.manage', 'invoices.manage', 'accounts_receivable.view',
                'payments.manage', 'cash.manage', 'reports.view',
            ],
            'Ventas' => [
                'dashboard.view', 'leads.view', 'clients.manage', 'deals.manage', 'activities.manage',
                'orders.manage', 'invoices.manage', 'accounts_receivable.view', 'payments.manage', 'cash.manage', 'reports.view',
            ],
            'Inventario' => [
                'dashboard.view', 'products.manage', 'warehouses.manage', 'stock.manage', 'suppliers.manage',
                'purchase_orders.manage', 'purchase_receipts.manage', 'accounts_payable.view', 'payments.manage',
                'cash.manage', 'orders.manage', 'reports.view',
            ],
            'Usuario' => ['dashboard.view'],
        ];
        foreach ($roles as $roleName => $rolePermissions) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web'])->syncPermissions($rolePermissions);
        }

        $demo = [
            ['superadmin@esteticaelite.co', 'Sofía Mercado', 'Super Admin'],
            ['admin@esteticaelite.co', 'Camila Rojas', 'Administrador de empresa'],
            ['medico@esteticaelite.co', 'Dr. Alejandro Restrepo', 'Médico/a Especialista'],
            ['medica@esteticaelite.co', 'Dra. Sofía Valenzuela', 'Médico/a Especialista'],
            ['recepcion@esteticaelite.co', 'Marcela Duarte', 'Recepción'],
            ['inventario@esteticaelite.co', 'Valentina Castro', 'Inventario'],
            ['ventas@esteticaelite.co', 'Sebastián Moreno', 'Ventas'],
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

        $doctors = [$users['medico@esteticaelite.co'], $users['medica@esteticaelite.co']];

        return [$users, $doctors];
    }

    // -------------------------------------------------------------- inventario

    /** @return array<string,Warehouse> */
    private function seedWarehouses(Company $company): array
    {
        return collect([
            ['name' => 'Farmacia & Insumos Estéticos', 'location' => 'Recepción, cabina principal'],
            ['name' => 'Depósito de Reserva', 'location' => 'Bodega médica interna'],
        ])->mapWithKeys(fn ($data) => [
            $data['name'] => Warehouse::firstOrCreate(
                ['company_id' => $company->id, 'name' => $data['name']],
                $data + ['status' => 'active'],
            ),
        ])->all();
    }

    /** @return array{0: Collection<int,Product>, 1: Collection<int,Product>} */
    private function seedInventoryCatalog(Company $company): array
    {
        $categories = collect(['Biológicos & Inyectables', 'Ácido Hialurónico', 'Bioestimuladores', 'Peelings & Cosmiatría', 'Sueroterapia IV', 'Insumos Médicos Estéticos'])
            ->mapWithKeys(fn ($name) => [$name => Category::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])]);
        $brands = collect(['Allergan (Botox)', 'Galderma (Restylane/Sculptra)', 'Merz Aesthetics (Radiesse)', 'Teoxane', 'Mesoestetic', 'Genérico'])
            ->mapWithKeys(fn ($name) => [$name => Brand::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])]);
        $units = collect([
            ['name' => 'Unidad', 'abbreviation' => 'un'],
            ['name' => 'Vial', 'abbreviation' => 'vial'],
            ['name' => 'Jeringa', 'abbreviation' => 'ser'],
            ['name' => 'Dosis', 'abbreviation' => 'dosis'],
            ['name' => 'Frasco', 'abbreviation' => 'fco'],
            ['name' => 'Caja', 'abbreviation' => 'caja'],
        ])->mapWithKeys(fn ($d) => [$d['name'] => Unit::firstOrCreate(['company_id' => $company->id, 'name' => $d['name']], $d + ['status' => 'active'])]);

        // [sku, nombre, categoría, marca, unidad, costo, precio, reorden, público, descripción]
        $rows = [
            ['BOT-100U', 'Toxina Botulínica Botox® 100U', 'Biológicos & Inyectables', 'Allergan (Botox)', 'Vial', 350000, 650000, 10, false, 'Relajante muscular para atenuación de arrugas dinámicas.'],
            ['HIA-LIP', 'Restylane Kysse 1ml (Perfilado Labial)', 'Ácido Hialurónico', 'Galderma (Restylane/Sculptra)', 'Jeringa', 420000, 850000, 15, false, 'Ácido hialurónico reticulado para volumen e hidratación de labios.'],
            ['HIA-VOL', 'Juvederm Voluma 1ml (Pómulos & Mentón)', 'Ácido Hialurónico', 'Allergan (Botox)', 'Jeringa', 480000, 950000, 12, false, 'Restauración de volumen en tercio medio e inferior facial.'],
            ['BIO-RAD', 'Radiesse 1.5ml (Hidroxiapatita Cálcica)', 'Bioestimuladores', 'Merz Aesthetics (Radiesse)', 'Jeringa', 720000, 1500000, 8, false, 'Bioestimulador de colágeno propio para tensión dérmica.'],
            ['BIO-SCU', 'Sculptra Vial (Ácido Poli-L-Láctico)', 'Bioestimuladores', 'Galderma (Restylane/Sculptra)', 'Vial', 890000, 1800000, 6, false, 'Inductor tisular de colágeno de larga duración.'],
            ['SUER-VITC', 'Sueroterapia Vitamina C Megadosis 25g', 'Sueroterapia IV', 'Genérico', 'Frasco', 35000, 120000, 30, false, 'Infusión intravenosa antioxidante y fortalecedora del sistema inmune.'],
            ['SUER-GLUT', 'Glutatión Antioxidante 1200mg', 'Sueroterapia IV', 'Genérico', 'Frasco', 45000, 150000, 20, false, 'Desintoxicante celular y potenciador del brillo cutáneo.'],
            ['PEEL-GLIC', 'Peeling Químico Glicólico 30% 50ml', 'Peelings & Cosmiatría', 'Mesoestetic', 'Frasco', 85000, 220000, 10, false, 'Renovación epidérmica para textura y manchas finas.'],
            ['HYDRA-SER', 'Serum Hydrafacial Hidratante 100ml', 'Peelings & Cosmiatría', 'Genérico', 'Frasco', 65000, 180000, 15, false, 'Solución hidro-exfoliante para aparatología facial.'],
            ['CREM-HYAL', 'Crema Antiaging Mesoestetic 50ml', 'Peelings & Cosmiatría', 'Mesoestetic', 'Unidad', 75000, 160000, 15, true, 'Crema hidratante y regeneradora con ácido hialurónico biocompatible.'],
            ['INS-CANULA', 'Microcánula Estética 25G x 50mm', 'Insumos Médicos Estéticos', 'Genérico', 'Unidad', 12000, 0, 50, false, 'Cánula de punta roma para aplicación segura de rellenos.'],
            ['INS-JERINGA', 'Jeringa Insulina 1ml x100', 'Insumos Médicos Estéticos', 'Genérico', 'Caja', 25000, 0, 10, false, 'Jeringa ultra-fina para toxina botulínica. Uso interno.'],
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

        $publicProducts = $products->filter(fn (Product $p) => $p->is_public)->values();

        return [$products, $publicProducts];
    }

    /** @return Collection<int,Supplier> */
    private function seedSuppliers(Company $company): Collection
    {
        return collect([
            ['name' => 'Allergan Aesthetics Colombia', 'contact_name' => 'Jorge Niño', 'email' => 'pedidos@allergan.example'],
            ['name' => 'Galderma Medical Colombia SAS', 'contact_name' => 'Marcela Durán', 'email' => 'ventas@galderma.example'],
            ['name' => 'Mesoestetic Pharma Group', 'contact_name' => 'Ricardo Peña', 'email' => 'atencion@mesoestetic.example'],
        ])->map(fn ($d) => Supplier::firstOrCreate(['company_id' => $company->id, 'name' => $d['name']], $d + ['status' => 'active']));
    }

    private function seedCashRegisters(Company $company): void
    {
        CashRegister::firstOrCreate(
            ['company_id' => $company->id, 'name' => 'Caja principal'],
            ['status' => 'active'],
        );
    }

    /** @return array<string,Segment> */
    private function seedSegments(Company $company): array
    {
        return collect(['Particular', 'Convenio VIP', 'Corporativo', 'Fidelizado / Frecuente'])
            ->mapWithKeys(fn ($name) => [$name => Segment::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])])
            ->all();
    }

    // ---------------------------------------------------------- clínica: base

    /** @return array<string,Species> */
    private function seedSpeciesAndBreeds(Company $company): array
    {
        $map = [
            'Facial' => ['Frente & Entrecejo', 'Patas de Gallo', 'Labios & Perfilado', 'Pómulos & Ojeras', 'Surcos Nasogenianos', 'Contorno Mandibular'],
            'Corporal' => ['Abdomen & Flancos', 'Glúteos & Muslos', 'Brazos & Escote'],
            'Capilar' => ['Fortalecimiento Capilar', 'Alopecia Androgenética'],
            'Antiaging' => ['Sueroterapia IV Detox', 'Bioestimulación Cutánea'],
        ];

        return collect($map)->mapWithKeys(function (array $breeds, string $speciesName) use ($company) {
            $species = Species::firstOrCreate(['company_id' => $company->id, 'name' => $speciesName], ['status' => 'active']);
            foreach ($breeds as $breed) {
                Breed::firstOrCreate(
                    ['company_id' => $company->id, 'species_id' => $species->id, 'name' => $breed],
                    ['status' => 'active'],
                );
            }

            return [$speciesName => $species];
        })->all();
    }

    /** @return array<string,Service> */
    private function seedServices(Company $company): array
    {
        return collect([
            ['Valoración Médica Estética', 'consulta', 45, 80000],
            ['Toxina Botulínica (Botox 3 zonas)', 'vacunacion', 30, 550000],
            ['Perfilado de Labios con Ácido Hialurónico', 'vacunacion', 45, 850000],
            ['Armonización Facial con Rellenos', 'cirugia', 60, 1400000],
            ['Bioestimulador Radiesse (Hidroxiapatita)', 'cirugia', 60, 1500000],
            ['Bioestimulador Sculptra (Vial)', 'cirugia', 60, 1800000],
            ['Peeling Médico Renovador', 'curacion', 45, 220000],
            ['Hydrafacial & Higiene Facial Profunda', 'peluqueria', 60, 280000],
            ['Sueroterapia IV Vitamina C Detox', 'hospitalizacion', 45, 180000],
            ['Contorno Corporal & Enzimas Reductoras', 'curacion', 45, 350000],
            ['Depilación Láser Diodo (Sesión Zonal)', 'otro', 30, 150000],
        ])->mapWithKeys(fn ($d) => [
            $d[0] => Service::firstOrCreate(
                ['company_id' => $company->id, 'name' => $d[0]],
                ['type' => $d[1], 'estimated_duration_minutes' => $d[2], 'price' => $d[3], 'status' => 'active'],
            ),
        ])->all();
    }

    // ------------------------------------------------------- clientes/pacientes

    /** @return Collection<int,Client> */
    private function seedOwners(Company $company, array $segments): Collection
    {
        $rows = [
            ['Camila Herrera', null, 'camila.herrera@gmail.com', '+57 310 555 0101', 'Cra 15 #85-40, Bogotá', 'Particular'],
            ['Andrés Vargas', null, 'andres.vargas@gmail.com', '+57 311 555 0102', 'Calle 53 #24-18, Bogotá', 'Particular'],
            ['Marcela Ríos', null, 'marcela.rios@hotmail.com', '+57 312 555 0103', 'Cra 7 #127-33, Bogotá', 'Particular'],
            ['Felipe Castaño', null, 'felipe.castano@gmail.com', '+57 313 555 0104', 'Calle 100 #19-54, Bogotá', 'Particular'],
            ['Diana Torres', null, 'diana.torres@gmail.com', '+57 314 555 0105', 'Cra 50 #6-20, Bogotá', 'Particular'],
            ['Juan David Peláez', null, 'jd.pelaez@gmail.com', '+57 315 555 0106', 'Calle 72 #10-34, Bogotá', 'Particular'],
            ['Laura Gutiérrez', null, 'laura.gutierrez@gmail.com', '+57 316 555 0107', 'Cra 19 #45-12, Bogotá', 'Particular'],
            ['Santiago Rojas', null, 'santiago.rojas@gmail.com', '+57 317 555 0108', 'Calle 140 #7-90, Bogotá', 'Particular'],
            ['Natalia Ospina', null, 'natalia.ospina@gmail.com', '+57 318 555 0109', 'Cra 24 #63-11, Bogotá', 'Particular'],
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
            [0, 'Paola Méndez', 'Asistente personal', 'paola@herrera.example', '+57 320 555 0310'],
            [2, 'Hernán Cortés', 'Contacto corporativo', 'hernan@rios.example', '+57 321 555 0311'],
        ])->each(fn ($d) => Contact::firstOrCreate(
            ['company_id' => $company->id, 'name' => $d[1], 'client_id' => $clients[$d[0]]->id],
            ['role' => $d[2], 'email' => $d[3], 'phone' => $d[4], 'status' => 'active'],
        ));
    }

    /** @return Collection<int,Patient> */
    private function seedPatients(Company $company, Collection $clients, array $species): Collection
    {
        $breedId = fn (string $sp, string $br) => Breed::query()
            ->where(['company_id' => $company->id, 'species_id' => $species[$sp]->id, 'name' => $br])->value('id');

        // [clientIdx, nombre, especie, raza, sexo, nacimiento, peso, esterilizado, microchip]
        $rows = [
            [0, 'Camila Herrera (Facial)', 'Facial', 'Frente & Entrecejo', 'female', '1992-03-14', 58.4, false, null],
            [1, 'Andrés Vargas (Corporal)', 'Corporal', 'Abdomen & Flancos', 'male', '1985-07-02', 78.1, false, null],
            [2, 'Marcela Ríos (Facial)', 'Facial', 'Labios & Perfilado', 'female', '1990-11-20', 54.2, false, null],
            [3, 'Felipe Castaño (Antiaging)', 'Antiaging', 'Sueroterapia IV Detox', 'male', '1978-02-10', 81.1, false, null],
            [4, 'Diana Torres (Facial)', 'Facial', 'Pómulos & Ojeras', 'female', '1988-01-05', 60.8, false, null],
            [5, 'Juan David Peláez (Facial)', 'Facial', 'Contorno Mandibular', 'male', '1983-05-30', 76.7, false, null],
            [6, 'Laura Gutiérrez (Capilar)', 'Capilar', 'Fortalecimiento Capilar', 'female', '1994-01-18', 56.2, false, null],
            [7, 'Santiago Rojas (Facial)', 'Facial', 'Surcos Nasogenianos', 'male', '1980-09-12', 82.9, false, null],
            [8, 'Natalia Ospina (Corporal)', 'Corporal', 'Glúteos & Muslos', 'female', '1995-06-25', 62.8, false, null],
        ];

        return collect($rows)->map(fn ($d) => Patient::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[$d[0]]->id, 'name' => $d[1]],
            [
                'species_id' => $species[$d[2]]->id,
                'breed_id' => $breedId($d[2], $d[3]),
                'sex' => $d[4],
                'birth_date' => $d[5],
                'weight' => $d[6],
                'sterilized' => $d[7],
                'microchip' => $d[8],
                'status' => 'active',
            ],
        ));
    }

    // ------------------------------------------------------------------ stock

    private function seedStock(
        Company $company,
        Collection $products,
        Collection $suppliers,
        Warehouse $mainWarehouse,
        array $warehouses,
    ): void {
        $po = PurchaseOrder::firstOrCreate(
            ['company_id' => $company->id, 'supplier_id' => $suppliers[0]->id, 'warehouse_id' => $mainWarehouse->id],
            ['status' => 'draft', 'order_date' => Carbon::today()->subDays(18), 'expected_date' => Carbon::today()->subDays(11), 'total' => 0],
        );
        if ($po->items()->count() === 0) {
            $lines = [
                [$products->firstWhere('sku', 'BOT-100U'), 20],
                [$products->firstWhere('sku', 'HIA-LIP'), 25],
                [$products->firstWhere('sku', 'BIO-RAD'), 15],
                [$products->firstWhere('sku', 'SUER-VITC'), 50],
                [$products->firstWhere('sku', 'CREM-HYAL'), 30],
            ];
            $total = 0;
            foreach ($lines as [$product, $qty]) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id, 'product_id' => $product->id, 'product_name' => $product->name,
                    'sku' => $product->sku, 'quantity' => $qty, 'unit_cost' => $product->cost_price,
                ]);
                $total += $qty * $product->cost_price;
                StockMovement::create([
                    'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $mainWarehouse->id,
                    'type' => 'in', 'quantity' => $qty, 'reason' => 'Recepción de orden de compra',
                    'reference' => 'purchase_order:'.$po->id,
                ]);
            }
            $po->update(['status' => 'received', 'total' => $total]);
        }

        foreach ($products as $product) {
            if (StockMovement::where('product_id', $product->id)->doesntExist()) {
                StockMovement::create([
                    'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $mainWarehouse->id,
                    'type' => 'in', 'quantity' => max(6, $product->reorder_level * 3), 'reason' => 'Inventario inicial',
                ]);
            }
        }

        // Ajuste para generar alerta de stock bajo (Sculptra)
        $sculptra = $products->firstWhere('sku', 'BIO-SCU');
        if ($sculptra) {
            $inQty = StockMovement::where('product_id', $sculptra->id)->where('type', 'in')->sum('quantity');
            $outQty = StockMovement::where('product_id', $sculptra->id)->where('type', 'out')->sum('quantity');
            $currentStock = $inQty - $outQty;
            if ($currentStock > 3) {
                StockMovement::create([
                    'company_id' => $company->id,
                    'product_id' => $sculptra->id,
                    'warehouse_id' => $mainWarehouse->id,
                    'type' => 'out',
                    'quantity' => -($currentStock - 3),
                    'reason' => 'Ajuste por consumo en procedimiento demo',
                    'reference' => 'adjust:low_stock_demo',
                ]);
            }
        }
    }

    private function seedStockTransfers(Company $company, Collection $products, array $warehouses): void
    {
        $deposit = $warehouses['Depósito de Reserva'] ?? null;
        $pharmacy = $warehouses['Farmacia & Insumos Estéticos'] ?? null;
        if (! $deposit || ! $pharmacy) {
            return;
        }

        $botox = $products->firstWhere('sku', 'BOT-100U');
        $kysse = $products->firstWhere('sku', 'HIA-LIP');

        if ($botox) {
            StockTransfer::firstOrCreate(
                ['company_id' => $company->id, 'product_id' => $botox->id, 'reference' => 'TRF-INT-001'],
                [
                    'from_warehouse_id' => $deposit->id,
                    'to_warehouse_id' => $pharmacy->id,
                    'quantity' => 5,
                    'notes' => 'Traslado de reserva a farmacia para atender citas agendadas de la semana.',
                    'status' => 'completed',
                ]
            );
        }

        if ($kysse) {
            StockTransfer::firstOrCreate(
                ['company_id' => $company->id, 'product_id' => $kysse->id, 'reference' => 'TRF-INT-002'],
                [
                    'from_warehouse_id' => $deposit->id,
                    'to_warehouse_id' => $pharmacy->id,
                    'quantity' => 8,
                    'notes' => 'Reabastecimiento de insumos para cabina 2.',
                    'status' => 'completed',
                ]
            );
        }
    }

    // -------------------------------------------------------------- agenda

    /** @return Collection<int,Appointment> */
    private function seedAppointments(
        Company $company,
        Collection $patients,
        array $services,
        array $doctors,
    ): Collection {
        $val = $services['Valoración Médica Estética'];
        $botox = $services['Toxina Botulínica (Botox 3 zonas)'];
        $lip = $services['Perfilado de Labios con Ácido Hialurónico'];
        $rad = $services['Bioestimulador Radiesse (Hidroxiapatita)'];
        $hydra = $services['Hydrafacial & Higiene Facial Profunda'];

        $plan = [
            [0, $val, now()->subDays(24)->setTime(9, 0), 'attended', 'Valoración inicial rejuvenecimiento', 'Cabina Estética 1', 1],
            [2, $lip, now()->subDays(18)->setTime(10, 30), 'attended', 'Perfilado labial con ácido hialurónico', 'Cabina Estética 2', 1],
            [3, $rad, now()->subDays(12)->setTime(8, 0), 'attended', 'Sesión bioestimulación Radiesse', 'Cabina Médica 1', 0],
            [4, $botox, now()->subDays(9)->setTime(11, 0), 'attended', 'Aplicación Botox 3 zonas', 'Cabina Estética 1', 1],
            [1, $hydra, now()->subDays(6)->setTime(15, 30), 'attended', 'Limpieza e hidratación previa a evento', 'Cabina Estética 2', 0],
            // Hoy
            [0, $botox, now()->setTime(9, 30), 'confirmed', 'Control y retoque Botox 14 días', 'Cabina Estética 1', 1],
            [5, $val, now()->setTime(11, 30), 'scheduled', 'Valoración contorno mandibular', 'Cabina Médica 1', 0],
            // Próximos días
            [6, $val, now()->addDay()->setTime(9, 0), 'scheduled', 'Valoración capilar y fortalecimiento', 'Cabina Estética 1', 0],
            [7, $rad, now()->addDays(2)->setTime(10, 0), 'confirmed', 'Bioestimulación colágeno', 'Cabina Médica 1', 1],
        ];

        $out = collect();
        foreach ($plan as [$idx, $service, $start, $status, $reason, $room, $docIdx]) {
            $patient = $patients->get($idx % $patients->count());
            $minutes = $service->estimated_duration_minutes ?: 45;
            $out->push(Appointment::firstOrCreate(
                ['company_id' => $company->id, 'patient_id' => $patient->id, 'starts_at' => $start],
                [
                    'service_id' => $service->id,
                    'practitioner_id' => $doctors[$docIdx]->id,
                    'ends_at' => $start->copy()->addMinutes($minutes),
                    'duration_minutes' => $minutes,
                    'resource' => $room,
                    'reason' => $reason,
                    'status' => $status,
                ],
            ));
        }

        return $out;
    }

    // ------------------------------------------------------- historia clínica / ficha médica

    /** @return Collection<int,Consultation> */
    private function seedConsultations(
        Company $company,
        Collection $patients,
        Collection $appointments,
        array $doctors,
    ): Collection {
        $rows = [
            [0, 24, 'Valoración inicial rejuvenecimiento', 58.4, 36.6,
                'Paciente consulta por arrugas de expresión marcadas en frente y entrecejo al gesticular. Busca resultado natural.',
                'Fototipo III. Elasticidad cutánea conservada. Arrugas dinámicas Grado II en tercio superior facial. Sin lesiones dermatológicas.',
                'Arrugas dinámicas de expresión en frente, entrecejo y patas de gallo.',
                'Aplicación de Toxina Botulínica Botox® (50 unidades repartidas en 3 zonas). Control en 14 días.', 1],
            [2, 18, 'Perfilado labial con ácido hialurónico', 54.2, 36.5,
                'Refiere deseo de definir borde bermellón e hidratación profunda sin exceso de volumen.',
                'Labios delgados anatómicos, simétricos. Ligera deshidratación en labio superior.',
                'Pérdida sutil de definición del perfilado labial.',
                'Infiltración de Restylane Kysse 1ml con microcánula 25G. Masaje moldeador. Hielo local.', 1],
            [3, 12, 'Sesión bioestimulación Radiesse', 81.1, 36.7,
                'Consulta por flacidez en contorno mandibular y tercios medio e inferior facial.',
                'Laxitud dérmica moderada en línea mandibular. Pérdida de definición del ángulo mandibular.',
                'Flacidez cutánea moderada asociada a pérdida de colágeno.',
                'Bioestimulación vectorial con Radiesse 1.5ml hiperdiluido en vectores de sustentación.', 0],
        ];

        $out = collect();
        foreach ($rows as [$pIdx, $daysAgo, $reason, $w, $t, $s, $o, $a, $p, $docIdx]) {
            $patient = $patients->get($pIdx % $patients->count());
            $date = now()->subDays($daysAgo)->toDateString();
            $appt = $appointments->first(fn (Appointment $ap) => $ap->patient_id === $patient->id
                && $ap->starts_at->toDateString() === $date);

            $out->push(Consultation::firstOrCreate(
                ['company_id' => $company->id, 'patient_id' => $patient->id, 'date' => $date],
                [
                    'appointment_id' => $appt?->id,
                    'vet_id' => $doctors[$docIdx]->id,
                    'reason' => $reason,
                    'weight' => $w,
                    'temperature' => $t,
                    'subjective' => $s,
                    'objective' => $o,
                    'assessment' => $a,
                    'plan' => $p,
                ],
            ));
        }

        return $out;
    }

    /** @return array<string,Diagnosis> */
    private function seedDiagnoses(Company $company): array
    {
        return collect([
            ['ARR-DIN', 'Arrugas dinámicas de expresión'],
            ['PERD-VOL', 'Pérdida de volumen facial'],
            ['FLAC-MED', 'Flacidez cutánea moderada'],
            ['HIPER-MAN', 'Hiperpigmentación / manchas solares'],
            ['SECUEL-ACN', 'Secuelas de acné & textura irregular'],
            ['CELUL-G2', 'Celulitis y adiposidad localizada'],
        ])->mapWithKeys(fn ($d) => [
            $d[0] => Diagnosis::firstOrCreate(
                ['company_id' => $company->id, 'name' => $d[1]],
                ['code' => $d[0], 'status' => 'active'],
            ),
        ])->all();
    }

    private function attachDiagnoses(Collection $consultations, array $diagnoses): void
    {
        $byReason = [
            'Valoración inicial rejuvenecimiento' => ['ARR-DIN'],
            'Perfilado labial con ácido hialurónico' => ['PERD-VOL'],
            'Sesión bioestimulación Radiesse' => ['FLAC-MED'],
        ];
        foreach ($consultations as $consultation) {
            $codes = $byReason[$consultation->reason] ?? [];
            if ($codes && $consultation->diagnoses()->count() === 0) {
                $consultation->diagnoses()->sync(collect($codes)->map(fn ($c) => $diagnoses[$c]->id)->all());
            }
        }
    }

    // --------------------------------------------------- aplicaciones / dosis / procedimientos

    private function seedClinicalApplications(
        Company $company,
        Collection $patients,
        Collection $products,
        array $doctors,
        Warehouse $warehouse,
        Collection $consultations,
    ): void {
        $botox = $products->firstWhere('sku', 'BOT-100U');
        $kysse = $products->firstWhere('sku', 'HIA-LIP');
        $radiesse = $products->firstWhere('sku', 'BIO-RAD');

        $rows = [
            [0, 'vaccine', 'Aplicación Toxina Botulínica (50U)', $botox, 24, 150, 1],
            [2, 'vaccine', 'Ácido Hialurónico Restylane Kysse 1ml', $kysse, 18, 330, 1],
            [3, 'deworming', 'Bioestimulador Radiesse 1.5ml', $radiesse, 12, 350, 0],
        ];

        foreach ($rows as [$pIdx, $type, $name, $product, $daysAgo, $dueInDays, $docIdx]) {
            $patient = $patients->get($pIdx % $patients->count());
            $appliedAt = now()->subDays($daysAgo)->toDateString();

            $existing = ClinicalApplication::where([
                'company_id' => $company->id, 'patient_id' => $patient->id, 'name' => $name, 'applied_at' => $appliedAt,
            ])->first();
            if ($existing) {
                continue;
            }

            $stockMovementId = null;
            if ($product) {
                $movement = StockMovement::create([
                    'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $warehouse->id,
                    'type' => 'out', 'quantity' => -1, 'reason' => 'Aplicación médica estética',
                    'reference' => 'seed:clinical_application',
                ]);
                $stockMovementId = $movement->id;
            }

            $consultation = $consultations->firstWhere('patient_id', $patient->id);

            ClinicalApplication::create([
                'company_id' => $company->id,
                'type' => $type,
                'patient_id' => $patient->id,
                'product_id' => $product?->id,
                'consultation_id' => $consultation?->id,
                'vet_id' => $doctors[$docIdx]->id,
                'stock_movement_id' => $stockMovementId,
                'name' => $name,
                'applied_at' => $appliedAt,
                'lot' => 'L'.random_int(10000, 99999),
                'expires_at' => now()->addMonths(random_int(8, 20))->toDateString(),
                'next_due_at' => now()->addDays($dueInDays)->toDateString(),
            ]);
        }
    }

    private function seedPrescriptions(
        Company $company,
        Collection $consultations,
        Collection $products,
        array $doctors,
    ): void {
        $crem = $products->firstWhere('sku', 'CREM-HYAL');

        $plans = [
            ['Valoración inicial rejuvenecimiento', 'Recomendaciones post-botox: evitar acostarse por 4 horas y no frotar las zonas tratadas.', [
                [$crem, 'Crema Antiaging Mesoestetic', 'Aplicación tópica', 'Cada 12 horas', '30 días'],
            ]],
        ];

        foreach ($plans as [$reason, $notes, $items]) {
            $consultation = $consultations->firstWhere('reason', $reason);
            if (! $consultation) {
                continue;
            }
            $exists = Prescription::where(['company_id' => $company->id, 'consultation_id' => $consultation->id])->exists();
            if ($exists) {
                continue;
            }
            $prescription = Prescription::create([
                'company_id' => $company->id,
                'consultation_id' => $consultation->id,
                'patient_id' => $consultation->patient_id,
                'vet_id' => $consultation->vet_id ?? $doctors[0]->id,
                'notes' => $notes,
            ]);
            foreach ($items as [$product, $name, $dosage, $frequency, $duration]) {
                $prescription->items()->create([
                    'product_id' => $product?->id,
                    'medication_name' => $name,
                    'sku' => $product?->sku,
                    'dosage' => $dosage,
                    'frequency' => $frequency,
                    'duration' => $duration,
                ]);
            }
        }
    }

    private function seedProcedures(
        Company $company,
        Collection $patients,
        array $services,
        array $doctors,
    ): void {
        $rows = [
            [0, 'Aplicación Toxina Botulínica 3 zonas (Frente/Entrecejo/Patas de gallo)', $services['Toxina Botulínica (Botox 3 zonas)'], 24,
                'Técnica con microaguja 31G. 50 unidades distribuidas simétricamente. Sin hematomas.', 1],
            [2, 'Perfilado e hidratación labial con Restylane Kysse', $services['Perfilado de Labios con Ácido Hialurónico'], 18,
                'Técnica con cánula 25G. Definición de arco de cupido y relleno sutil de bermellón.', 1],
            [3, 'Bioestimulación vectorial de colágeno con Radiesse', $services['Bioestimulador Radiesse (Hidroxiapatita)'], 12,
                'Vectores de sustentación en ángulo mandibular y mejillas. Tolerancia perfecta.', 0],
        ];

        foreach ($rows as [$pIdx, $type, $service, $daysAgo, $notes, $docIdx]) {
            $patient = $patients->get($pIdx % $patients->count());
            Procedure::firstOrCreate(
                ['company_id' => $company->id, 'patient_id' => $patient->id, 'type' => $type],
                [
                    'service_id' => $service->id,
                    'vet_id' => $doctors[$docIdx]->id,
                    'performed_at' => now()->subDays($daysAgo)->toDateString(),
                    'notes' => $notes,
                ],
            );
        }
    }

    // ------------------------------------------------------------ portal / leads / ventas

    private function seedLeads(Company $company): void
    {
        $rows = [
            ['Andrea Salcedo', 'andrea.salcedo@gmail.com', '+57 300 555 0401', 'appointment', 'new',
                'Interés: Toxina botulínica en frente. Desea valoración médica el sábado en la mañana.'],
            ['Miguel Ángel Ruiz', 'miguel.ruiz@gmail.com', '+57 301 555 0402', 'appointment', 'new',
                'Interés: Armonización de mandíbula y perfilado. Solicita llamada de información.'],
            ['Carolina Méndez', 'carolina.mendez@hotmail.com', '+57 302 555 0403', 'appointment', 'contacted',
                'Interés: Hydrafacial & sueroterapia IV. Confirmada valoración.'],
        ];

        foreach ($rows as [$name, $email, $phone, $source, $status, $message]) {
            Lead::firstOrCreate(
                ['company_id' => $company->id, 'email' => $email, 'source' => $source],
                [
                    'name' => $name, 'phone' => $phone, 'message' => $message, 'status' => $status,
                    'ip_address' => '190.85.'.random_int(1, 254).'.'.random_int(1, 254),
                ],
            );
        }
    }

    /** @return Collection<int,Order> */
    private function seedProductSales(
        Company $company,
        Collection $clients,
        Collection $publicProducts,
        Warehouse $warehouse,
        User $reception,
    ): Collection {
        $crem = $publicProducts->firstWhere('sku', 'CREM-HYAL');
        $orders = collect();

        if ($crem) {
            $order1 = Order::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $clients[0]->id, 'warehouse_id' => $warehouse->id],
                ['owner_id' => $reception->id, 'status' => 'confirmed', 'total' => $crem->unit_price],
            );
            if ($order1->items()->count() === 0) {
                OrderItem::create([
                    'order_id' => $order1->id, 'product_id' => $crem->id, 'product_name' => $crem->name,
                    'sku' => $crem->sku, 'quantity' => 1, 'unit_price' => $crem->unit_price,
                ]);
            }
            $orders->push($order1);
        }

        $order2 = Order::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[2]->id, 'warehouse_id' => $warehouse->id],
            ['owner_id' => $reception->id, 'status' => 'pending', 'total' => 850000],
        );
        if ($order2->items()->count() === 0) {
            $kysse = $publicProducts->firstWhere('sku', 'HIA-LIP') ?? $publicProducts->first();
            if ($kysse) {
                OrderItem::create([
                    'order_id' => $order2->id, 'product_id' => $kysse->id, 'product_name' => $kysse->name,
                    'sku' => $kysse->sku, 'quantity' => 1, 'unit_price' => 850000,
                ]);
            }
        }
        $orders->push($order2);

        return $orders;
    }

    private function seedSurgeryQuotes(Company $company, Collection $clients, array $services): void
    {
        $plans = [
            ['client' => $clients[0], 'status' => 'sent', 'title' => 'Presupuesto Armonización Facial — Camila Herrera',
                'items' => [[$services['Armonización Facial con Rellenos'], 1], [$services['Valoración Médica Estética'], 1]]],
            ['client' => $clients[2], 'status' => 'accepted', 'title' => 'Presupuesto Bioestimulación — Marcela Ríos',
                'items' => [[$services['Bioestimulador Radiesse (Hidroxiapatita)'], 1]]],
        ];

        foreach ($plans as $plan) {
            $quote = Quote::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $plan['client']->id, 'title' => $plan['title']],
                ['status' => 'draft', 'valid_until' => Carbon::today()->addDays(20), 'total' => 0],
            );
            if ($quote->items()->count() > 0) {
                continue;
            }
            $total = 0;
            foreach ($plan['items'] as [$service, $qty]) {
                QuoteItem::create([
                    'quote_id' => $quote->id, 'product_id' => null, 'product_name' => $service->name,
                    'sku' => null, 'quantity' => $qty, 'unit_price' => $service->price,
                ]);
                $total += $qty * $service->price;
            }
            $quote->update(['total' => $total, 'status' => $plan['status']]);
        }
    }

    private function seedWellnessDeals(Company $company, Collection $clients, User $admin, User $sales): void
    {
        $stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'won', 'lost'];
        $titles = [
            'Plan de Rejuvenecimiento Anual VIP — Camila Herrera',
            'Convenio Ejecutivo Estético — Nexa BPO',
            'Paquete Novias & Gala — Marcela Ríos',
        ];
        foreach ($titles as $i => $title) {
            $client = $clients[$i % $clients->count()];
            Deal::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $client->id, 'title' => $title],
                [
                    'owner_id' => $i % 2 === 0 ? $admin->id : $sales->id,
                    'amount' => 1200000 + $i * 500000,
                    'stage' => $stages[$i % count($stages)],
                    'expected_close_date' => Carbon::today()->addDays(7 + $i * 6),
                ],
            );
        }
    }

    /** @return array{0: Collection<int,Invoice>, 1: Collection<int,AccountReceivable>} */
    private function seedInvoicesAndReceivables(
        Company $company,
        Collection $clients,
        Collection $orders,
        Warehouse $warehouse,
        User $admin,
    ): array {
        $invoices = collect();
        $receivables = collect();

        $inv1 = Invoice::firstOrCreate(
            ['company_id' => $company->id, 'number' => 'INV-2026-001'],
            [
                'client_id' => $clients[0]->id,
                'order_id' => $orders[0]->id ?? null,
                'warehouse_id' => $warehouse->id,
                'user_id' => $admin->id,
                'issue_date' => Carbon::today()->subDays(12),
                'due_date' => Carbon::today()->subDays(2),
                'status' => 'paid',
                'subtotal' => 160000,
                'discount' => 0,
                'tax' => 0,
                'total' => 160000,
                'notes' => 'Factura cancelada en recepción al momento de la entrega del producto.',
            ]
        );
        if ($inv1->items()->count() === 0) {
            InvoiceItem::create([
                'invoice_id' => $inv1->id, 'product_name' => 'Crema Antiaging Mesoestetic 50ml',
                'sku' => 'CREM-HYAL', 'quantity' => 1, 'unit_price' => 160000, 'line_total' => 160000,
            ]);
        }
        $invoices->push($inv1);

        $rec1 = AccountReceivable::firstOrCreate(
            ['company_id' => $company->id, 'invoice_id' => $inv1->id],
            [
                'client_id' => $clients[0]->id,
                'original_amount' => 160000,
                'paid_amount' => 160000,
                'balance' => 0,
                'due_date' => Carbon::today()->subDays(2),
                'status' => 'paid',
            ]
        );
        $receivables->push($rec1);

        $inv2 = Invoice::firstOrCreate(
            ['company_id' => $company->id, 'number' => 'INV-2026-002'],
            [
                'client_id' => $clients[2]->id,
                'order_id' => $orders[1]->id ?? null,
                'warehouse_id' => $warehouse->id,
                'user_id' => $admin->id,
                'issue_date' => Carbon::today()->subDays(6),
                'due_date' => Carbon::today()->addDays(9),
                'status' => 'partially_paid',
                'subtotal' => 850000,
                'discount' => 0,
                'tax' => 0,
                'total' => 850000,
                'notes' => 'Perfilado labial. Abono inicial registrado, saldo a la cita de revisión.',
            ]
        );
        if ($inv2->items()->count() === 0) {
            InvoiceItem::create([
                'invoice_id' => $inv2->id, 'product_name' => 'Perfilado de Labios con Ácido Hialurónico',
                'sku' => 'HIA-LIP', 'quantity' => 1, 'unit_price' => 850000, 'line_total' => 850000,
            ]);
        }
        $invoices->push($inv2);

        $rec2 = AccountReceivable::firstOrCreate(
            ['company_id' => $company->id, 'invoice_id' => $inv2->id],
            [
                'client_id' => $clients[2]->id,
                'original_amount' => 850000,
                'paid_amount' => 400000,
                'balance' => 450000,
                'due_date' => Carbon::today()->addDays(9),
                'status' => 'partial',
            ]
        );
        $receivables->push($rec2);

        $inv3 = Invoice::firstOrCreate(
            ['company_id' => $company->id, 'number' => 'INV-2026-003'],
            [
                'client_id' => $clients[1]->id,
                'warehouse_id' => $warehouse->id,
                'user_id' => $admin->id,
                'issue_date' => Carbon::today()->subDays(2),
                'due_date' => Carbon::today()->addDays(28),
                'status' => 'issued',
                'subtotal' => 1500000,
                'discount' => 0,
                'tax' => 0,
                'total' => 1500000,
                'notes' => 'Tratamiento bioestimulador de colágeno Radiesse.',
            ]
        );
        if ($inv3->items()->count() === 0) {
            InvoiceItem::create([
                'invoice_id' => $inv3->id, 'product_name' => 'Radiesse 1.5ml (Hidroxiapatita Cálcica)',
                'sku' => 'BIO-RAD', 'quantity' => 1, 'unit_price' => 1500000, 'line_total' => 1500000,
            ]);
        }
        $invoices->push($inv3);

        $rec3 = AccountReceivable::firstOrCreate(
            ['company_id' => $company->id, 'invoice_id' => $inv3->id],
            [
                'client_id' => $clients[1]->id,
                'original_amount' => 1500000,
                'paid_amount' => 0,
                'balance' => 1500000,
                'due_date' => Carbon::today()->addDays(28),
                'status' => 'pending',
            ]
        );
        $receivables->push($rec3);

        return [$invoices, $receivables];
    }

    /** @return Collection<int,AccountPayable> */
    private function seedPurchaseReceiptsAndPayables(
        Company $company,
        Collection $suppliers,
        Warehouse $warehouse,
        User $admin,
        Collection $products,
    ): Collection {
        $payables = collect();
        $po1 = PurchaseOrder::where('company_id', $company->id)->first();

        if ($po1) {
            $receipt1 = PurchaseReceipt::firstOrCreate(
                ['company_id' => $company->id, 'purchase_order_id' => $po1->id],
                [
                    'warehouse_id' => $warehouse->id,
                    'user_id' => $admin->id,
                    'received_at' => Carbon::today()->subDays(11),
                    'status' => 'confirmed',
                    'notes' => 'Recepción de biológicos e insumos médicos en condiciones térmicas certificadas.',
                ]
            );

            if ($receipt1->items()->count() === 0) {
                foreach ($po1->items as $item) {
                    PurchaseReceiptItem::create([
                        'purchase_receipt_id' => $receipt1->id,
                        'purchase_order_item_id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'sku' => $item->sku,
                        'quantity' => $item->quantity,
                        'unit_cost' => $item->unit_cost,
                        'line_total' => $item->quantity * $item->unit_cost,
                    ]);
                }
            }

            $ap1 = AccountPayable::firstOrCreate(
                ['company_id' => $company->id, 'purchase_order_id' => $po1->id],
                [
                    'supplier_id' => $po1->supplier_id,
                    'purchase_receipt_id' => $receipt1->id,
                    'original_amount' => $po1->total,
                    'paid_amount' => 20000000,
                    'balance' => max(0, $po1->total - 20000000),
                    'due_date' => Carbon::today()->addDays(15),
                    'status' => 'partial',
                ]
            );
            $payables->push($ap1);
        }

        // Orden de compra 2 (Galderma)
        $galderma = $suppliers->firstWhere('name', 'Galderma Medical Colombia SAS') ?? $suppliers->last();
        if ($galderma) {
            $po2 = PurchaseOrder::firstOrCreate(
                ['company_id' => $company->id, 'supplier_id' => $galderma->id, 'order_date' => Carbon::today()->subDays(4)],
                [
                    'warehouse_id' => $warehouse->id,
                    'status' => 'sent',
                    'expected_date' => Carbon::today()->addDays(5),
                    'total' => 15500000,
                ]
            );

            if ($po2->items()->count() === 0) {
                $sculptra = $products->firstWhere('sku', 'BIO-SCU');
                if ($sculptra) {
                    PurchaseOrderItem::create([
                        'purchase_order_id' => $po2->id,
                        'product_id' => $sculptra->id,
                        'product_name' => $sculptra->name,
                        'sku' => $sculptra->sku,
                        'quantity' => 10,
                        'unit_cost' => 890000,
                    ]);
                }
            }

            $ap2 = AccountPayable::firstOrCreate(
                ['company_id' => $company->id, 'purchase_order_id' => $po2->id],
                [
                    'supplier_id' => $galderma->id,
                    'purchase_receipt_id' => null,
                    'original_amount' => 15500000,
                    'paid_amount' => 0,
                    'balance' => 15500000,
                    'due_date' => Carbon::today()->addDays(26),
                    'status' => 'pending',
                ]
            );
            $payables->push($ap2);
        }

        return $payables;
    }

    private function seedCashSessionsMovementsAndPayments(
        Company $company,
        User $admin,
        User $reception,
        Collection $receivables,
        Collection $payables,
    ): void {
        $register = CashRegister::where('company_id', $company->id)->first();
        if (! $register) {
            return;
        }

        // Sesión 1: Cerrada ayer
        $session1 = CashSession::firstOrCreate(
            ['company_id' => $company->id, 'cash_register_id' => $register->id, 'opened_at' => now()->subDays(1)->setTime(8, 0)],
            [
                'opened_by' => $reception->id,
                'closed_by' => $reception->id,
                'closed_at' => now()->subDays(1)->setTime(18, 30),
                'opening_amount' => 300000,
                'expected_amount' => 460000,
                'closing_amount' => 460000,
                'difference' => 0,
                'status' => 'closed',
                'notes' => 'Cierre de caja jornada anterior sin novedades.',
            ]
        );

        if ($session1->wasRecentlyCreated) {
            CashMovement::create([
                'company_id' => $company->id,
                'cash_session_id' => $session1->id,
                'user_id' => $reception->id,
                'type' => 'in',
                'amount' => 300000,
                'method' => 'cash',
                'reference' => 'APERTURA-001',
                'notes' => 'Base inicial en efectivo',
                'source_type' => CashSession::class,
                'source_id' => $session1->id,
            ]);

            CashMovement::create([
                'company_id' => $company->id,
                'cash_session_id' => $session1->id,
                'user_id' => $reception->id,
                'type' => 'in',
                'amount' => 160000,
                'method' => 'cash',
                'reference' => 'INV-2026-001',
                'notes' => 'Cobro contado venta producto Camila Herrera',
                'source_type' => AccountReceivable::class,
                'source_id' => $receivables[0]->id ?? 1,
            ]);
        }

        // Sesión 2: Abierta hoy
        $session2 = CashSession::firstOrCreate(
            ['company_id' => $company->id, 'cash_register_id' => $register->id, 'opened_at' => now()->setTime(8, 30)],
            [
                'opened_by' => $reception->id,
                'opening_amount' => 300000,
                'expected_amount' => 700000,
                'status' => 'open',
                'notes' => 'Caja activa para turno del día.',
            ]
        );

        if ($session2->wasRecentlyCreated) {
            CashMovement::create([
                'company_id' => $company->id,
                'cash_session_id' => $session2->id,
                'user_id' => $reception->id,
                'type' => 'in',
                'amount' => 300000,
                'method' => 'cash',
                'reference' => 'APERTURA-002',
                'notes' => 'Base de efectivo inicial turno mañana',
                'source_type' => CashSession::class,
                'source_id' => $session2->id,
            ]);

            CashMovement::create([
                'company_id' => $company->id,
                'cash_session_id' => $session2->id,
                'user_id' => $reception->id,
                'type' => 'in',
                'amount' => 400000,
                'method' => 'transfer',
                'reference' => 'INV-2026-002',
                'notes' => 'Abono perfilado labial Marcela Ríos',
                'source_type' => AccountReceivable::class,
                'source_id' => $receivables[1]->id ?? 2,
            ]);
        }

        // Pagos (Payment)
        if ($receivables->count() > 0) {
            Payment::firstOrCreate(
                ['company_id' => $company->id, 'payable_type' => AccountReceivable::class, 'payable_id' => $receivables[0]->id],
                [
                    'user_id' => $reception->id,
                    'direction' => 'in',
                    'paid_at' => Carbon::today()->subDays(10),
                    'amount' => 160000,
                    'method' => 'cash',
                    'reference' => 'REC-001',
                    'notes' => 'Cobro completo de factura INV-2026-001',
                    'cash_session_id' => $session1->id,
                ]
            );

            if ($receivables->count() > 1) {
                Payment::firstOrCreate(
                    ['company_id' => $company->id, 'payable_type' => AccountReceivable::class, 'payable_id' => $receivables[1]->id],
                    [
                        'user_id' => $reception->id,
                        'direction' => 'in',
                        'paid_at' => Carbon::today(),
                        'amount' => 400000,
                        'method' => 'transfer',
                        'reference' => 'TRF-BANK-9011',
                        'notes' => 'Abono parcial de factura INV-2026-002',
                        'cash_session_id' => $session2->id,
                    ]
                );
            }
        }

        if ($payables->count() > 0) {
            Payment::firstOrCreate(
                ['company_id' => $company->id, 'payable_type' => AccountPayable::class, 'payable_id' => $payables[0]->id],
                [
                    'user_id' => $admin->id,
                    'direction' => 'out',
                    'paid_at' => Carbon::today()->subDays(5),
                    'amount' => 20000000,
                    'method' => 'transfer',
                    'reference' => 'TRF-ALLERGAN-8821',
                    'notes' => 'Abono a factura de compra Allergan Aesthetics',
                ]
            );
        }
    }

    private function seedClientNotesAndTasks(
        Company $company,
        Collection $clients,
        Collection $patients,
        User $admin,
        User $reception,
    ): void {
        collect([
            [0, 'Camila prefiere atención los sábados en la mañana con la Dra. Valenzuela.'],
            [2, 'Marcela es alérgica a la lidocaína en pomadas tópicas. Utilizar anestesia helada.'],
        ])->each(fn ($d) => ClientNote::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[$d[0]]->id, 'body' => $d[1]],
            ['user_id' => $admin->id],
        ));

        collect([
            ['task', 'Llamar a Camila Herrera para confirmar retoque de Botox', 0, 1, false],
            ['followup', 'Seguimiento post-procedimiento bioestimulación — Marcela Ríos', 2, -1, true],
        ])->each(fn ($d) => Activity::firstOrCreate(
            ['company_id' => $company->id, 'subject' => $d[1]],
            [
                'client_id' => $clients[$d[2]]->id,
                'type' => $d[0],
                'due_date' => Carbon::today()->addDays($d[3]),
                'completed' => $d[4],
            ],
        ));
    }

    private function seedAuditLog(
        Company $company,
        User $admin,
        Collection $clients,
        Collection $patients,
    ): void {
        $rows = [
            ['login', 'auth', User::class, $admin->id, 0],
            ['patient.created', 'pacientes', Patient::class, $patients[0]->id, 12],
            ['appointment.updated', 'citas', Appointment::class, null, 1],
            ['consultation.created', 'historia-clinica', Consultation::class, null, 6],
            ['clinical_application.created', 'vacunas', ClinicalApplication::class, null, 3],
            ['prescription.created', 'recetas', Prescription::class, null, 6],
            ['order.confirmed', 'pedidos', Order::class, null, 2],
            ['purchase_order.received', 'compras', PurchaseOrder::class, null, 11],
            ['settings.updated', 'configuracion', Company::class, $company->id, 20],
        ];

        foreach ($rows as [$action, $module, $entity, $entityId, $daysAgo]) {
            $log = AuditLog::firstOrCreate(
                ['company_id' => $company->id, 'action' => $action, 'entity' => $entity, 'entity_id' => $entityId],
                [
                    'user_id' => $admin->id,
                    'module' => $module,
                    'ip_address' => '190.85.'.random_int(1, 254).'.'.random_int(1, 254),
                    'new_values' => ['message' => 'Acción registrada por el dataset de demostración'],
                ],
            );

            if ($log->wasRecentlyCreated) {
                $at = Carbon::now()->subDays($daysAgo)->subHours(random_int(0, 8));
                $log->forceFill(['created_at' => $at, 'updated_at' => $at])->saveQuietly();
            }
        }
    }
}
