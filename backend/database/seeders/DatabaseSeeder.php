<?php

namespace Database\Seeders;

use App\Models\AccountPayable;
use App\Models\AccountReceivable;
use App\Models\Activity;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Brand;
use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\CashSession;
use App\Models\Breed;
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
use App\Models\Prescription;
use App\Models\Procedure;
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
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Dataset demo de la vertical veterinaria — "Clínica Veterinaria Los Andes".
 *
 * Todo el contenido es ficticio y coherente con una clínica de una sola sede:
 * propietarios y mascotas, agenda con citas pasadas/hoy/futuras, historia
 * clínica SOAP, vacunas y desparasitaciones (algunas descuentan stock),
 * diagnósticos, recetas, procedimientos, farmacia/vitrina con inventario,
 * ventas de producto a propietarios, presupuestos de cirugía y solicitudes de
 * cita del sitio público. Suficiente para que el dashboard y los reportes se
 * vean reales. `migrate:fresh --seed` es idempotente.
 */
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
            'address' => 'Calle 93 #14-20, Bogotá',
            'timezone' => 'America/Bogota',
            'locale' => 'es',
        ]);

        [$users, $vets] = $this->seedRolesAndUsers($company);
        $admin = $users['admin@vetlosandes.co'];
        $reception = $users['recepcion@vetlosandes.co'];

        $warehouses = $this->seedWarehouses($company);
        $mainWarehouse = $warehouses['Farmacia / Vitrina'];

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

        $appointments = $this->seedAppointments($company, $patients, $services, $vets);
        $consultations = $this->seedConsultations($company, $patients, $appointments, $vets);
        $diagnoses = $this->seedDiagnoses($company);
        $this->attachDiagnoses($consultations, $diagnoses);
        $this->seedClinicalApplications($company, $patients, $products, $vets, $mainWarehouse, $consultations);
        $this->seedPrescriptions($company, $consultations, $products, $vets);
        $this->seedProcedures($company, $patients, $services, $vets);

        $this->seedLeads($company);
        $this->seedProductSales($company, $clients, $publicProducts, $mainWarehouse, $reception);
        $this->seedSurgeryQuotes($company, $clients, $services);
        $this->seedWellnessDeals($company, $clients, $admin, $users['ventas@vetlosandes.co']);
        $this->seedClientNotesAndTasks($company, $clients, $patients, $admin, $reception);
        $this->seedFinancialData($company, $reception, $clients, $suppliers);
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
            'Veterinario/a' => array_merge(['dashboard.view', 'clients.manage', 'orders.manage', 'reports.view'], $clinical),
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
            ['superadmin@vetlosandes.co', 'Sofía Mercado', 'Super Admin'],
            ['admin@vetlosandes.co', 'Camila Rojas', 'Administrador de empresa'],
            ['veterinario@vetlosandes.co', 'Dr. Carlos Medina', 'Veterinario/a'],
            ['veterinaria@vetlosandes.co', 'Dra. Laura Peña', 'Veterinario/a'],
            ['recepcion@vetlosandes.co', 'Marcela Duarte', 'Recepción'],
            ['inventario@vetlosandes.co', 'Valentina Castro', 'Inventario'],
            ['ventas@vetlosandes.co', 'Sebastián Moreno', 'Ventas'],
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

        $vets = [$users['veterinario@vetlosandes.co'], $users['veterinaria@vetlosandes.co']];

        return [$users, $vets];
    }

    // -------------------------------------------------------------- inventario

    /** @return array<string,Warehouse> */
    private function seedWarehouses(Company $company): array
    {
        return collect([
            ['name' => 'Farmacia / Vitrina', 'location' => 'Recepción, planta baja'],
            ['name' => 'Depósito', 'location' => 'Bodega interna, segundo piso'],
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
        $categories = collect(['Biológicos', 'Antiparasitarios', 'Farmacia', 'Alimento médico', 'Accesorios', 'Insumos médicos'])
            ->mapWithKeys(fn ($name) => [$name => Category::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])]);
        $brands = collect(['Zoetis', 'MSD Salud Animal', 'Virbac', 'Elanco', 'Royal Canin', "Hill's", 'Genérico'])
            ->mapWithKeys(fn ($name) => [$name => Brand::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])]);
        $units = collect([
            ['name' => 'Unidad', 'abbreviation' => 'un'],
            ['name' => 'Frasco', 'abbreviation' => 'fco'],
            ['name' => 'Dosis', 'abbreviation' => 'dosis'],
            ['name' => 'Tableta', 'abbreviation' => 'tab'],
            ['name' => 'Bolsa', 'abbreviation' => 'bls'],
        ])->mapWithKeys(fn ($d) => [$d['name'] => Unit::firstOrCreate(['company_id' => $company->id, 'name' => $d['name']], $d + ['status' => 'active'])]);

        // [sku, nombre, categoría, marca, unidad, costo, precio, reorden, público, descripción]
        $rows = [
            ['VAC-DHPPI', 'Vacuna polivalente canina (DHPPi)', 'Biológicos', 'Zoetis', 'Dosis', 22000, 45000, 15, false, 'Vacuna múltiple para moquillo, hepatitis, parvovirus y parainfluenza. Refuerzo anual.'],
            ['VAC-RABIA', 'Vacuna antirrábica', 'Biológicos', 'MSD Salud Animal', 'Dosis', 12000, 30000, 20, false, 'Antirrábica para perros y gatos. Obligatoria, refuerzo anual.'],
            ['VAC-TRIPLE-F', 'Vacuna triple felina', 'Biológicos', 'MSD Salud Animal', 'Dosis', 24000, 48000, 10, false, 'Rinotraqueítis, calicivirus y panleucopenia felina.'],
            ['VAC-TOS', 'Vacuna tos de las perreras', 'Biológicos', 'Zoetis', 'Dosis', 20000, 42000, 8, false, 'Bordetella + parainfluenza. Recomendada antes de guardería o peluquería.'],
            ['ANTI-INT', 'Desparasitante interno (praziquantel + pirantel)', 'Antiparasitarios', 'Virbac', 'Tableta', 3500, 9000, 40, false, 'Amplio espectro contra parásitos intestinales. Dosis por peso.'],
            ['ANTI-EXT', 'Antipulgas y garrapatas masticable', 'Antiparasitarios', 'Elanco', 'Tableta', 28000, 55000, 25, false, 'Protección mensual contra pulgas y garrapatas. Vía oral.'],
            ['ANTI-PIPE', 'Pipeta antiparasitaria externa', 'Antiparasitarios', 'Virbac', 'Unidad', 18000, 38000, 20, false, 'Aplicación tópica mensual. Presentaciones por rango de peso.'],
            ['FARM-AMOXI', 'Amoxicilina 250 mg', 'Farmacia', 'Genérico', 'Tableta', 900, 2500, 60, false, 'Antibiótico betalactámico. Solo bajo prescripción veterinaria.'],
            ['FARM-MELOX', 'Meloxicam 1,5 mg/ml suspensión', 'Farmacia', 'Genérico', 'Frasco', 22000, 45000, 10, false, 'Antiinflamatorio no esteroideo para dolor osteomuscular.'],
            ['FARM-SUERO', 'Suero fisiológico 500 ml', 'Farmacia', 'Genérico', 'Frasco', 4500, 9000, 30, false, 'Solución salina 0,9% para fluidoterapia y lavados.'],
            ['FARM-GABA', 'Gabapentina 100 mg', 'Farmacia', 'Genérico', 'Tableta', 1200, 3200, 40, false, 'Analgésico neuropático y ansiolítico previo a consulta.'],
            ['ALIM-GASTRO', 'Alimento gastrointestinal 2 kg', 'Alimento médico', 'Royal Canin', 'Bolsa', 78000, 128000, 8, true, 'Dieta veterinaria para trastornos digestivos en perros. Alta digestibilidad.'],
            ['ALIM-RENAL', 'Alimento renal 2 kg', 'Alimento médico', "Hill's", 'Bolsa', 92000, 148000, 6, true, 'Dieta terapéutica para insuficiencia renal crónica en gatos.'],
            ['ALIM-RECOV', 'Alimento de recuperación lata', 'Alimento médico', 'Royal Canin', 'Unidad', 9000, 16000, 24, true, 'Alta energía para pacientes convalecientes o inapetentes.'],
            ['ACC-COLLAR', 'Collar isabelino talla M', 'Accesorios', 'Genérico', 'Unidad', 8000, 18000, 15, true, 'Cono protector post-cirugía o para evitar lamido de heridas.'],
            ['ACC-SHAMP', 'Shampoo hipoalergénico 250 ml', 'Accesorios', 'Virbac', 'Frasco', 19000, 36000, 20, true, 'Piel sensible y dermatitis leve. Uso frecuente.'],
            ['ACC-DENTAL', 'Kit de cepillado dental', 'Accesorios', 'Genérico', 'Unidad', 12000, 24000, 18, true, 'Cepillo de doble cabeza y pasta enzimática sabor pollo.'],
            ['INS-JERINGA', 'Jeringa 3 ml con aguja', 'Insumos médicos', 'Genérico', 'Unidad', 400, 0, 200, false, 'Insumo de uso interno. No se vende al público.'],
            ['INS-GUANTE', 'Guantes de examen (caja x100)', 'Insumos médicos', 'Genérico', 'Unidad', 22000, 0, 20, false, 'Nitrilo sin polvo. Uso interno de consulta y cirugía.'],
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
            ['name' => 'Distribuciones Veterinarias del Norte', 'contact_name' => 'Jorge Niño', 'email' => 'pedidos@distrivetnorte.example'],
            ['name' => 'Provet Colombia SAS', 'contact_name' => 'Marcela Durán', 'email' => 'ventas@provet.example'],
            ['name' => 'Insumos del Campo Mayorista', 'contact_name' => 'Ricardo Peña', 'email' => 'mayoristas@insumosdelcampo.example'],
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
        return collect(['Particular', 'Convenio empresarial', 'Criadero', 'Fundación / Rescate'])
            ->mapWithKeys(fn ($name) => [$name => Segment::firstOrCreate(['company_id' => $company->id, 'name' => $name], ['status' => 'active'])])
            ->all();
    }

    // ---------------------------------------------------------- clínica: base

    /** @return array<string,Species> */
    private function seedSpeciesAndBreeds(Company $company): array
    {
        $map = [
            'Perro' => ['Labrador Retriever', 'Golden Retriever', 'Criollo / Mestizo', 'Poodle', 'Bulldog Francés', 'Schnauzer', 'Pastor Alemán', 'Beagle'],
            'Gato' => ['Siamés', 'Persa', 'Criollo / Mestizo', 'Angora', 'Maine Coon'],
            'Ave' => ['Periquito', 'Canario', 'Agapornis'],
            'Conejo' => ['Mini Lop', 'Cabeza de León'],
            'Exótico' => ['Hurón', 'Tortuga morrocoy'],
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
            ['Consulta general', 'consulta', 30, 55000],
            ['Consulta especializada', 'consulta', 45, 95000],
            ['Consulta a domicilio', 'consulta', 60, 130000],
            ['Vacunación', 'vacunacion', 15, 40000],
            ['Desparasitación', 'vacunacion', 15, 28000],
            ['Cirugía de tejidos blandos', 'cirugia', 120, 420000],
            ['Esterilización', 'cirugia', 90, 280000],
            ['Profilaxis dental', 'cirugia', 75, 240000],
            ['Curación / manejo de heridas', 'curacion', 20, 35000],
            ['Hospitalización (día)', 'hospitalizacion', null, 140000],
            ['Peluquería / baño médico', 'peluqueria', 60, 45000],
            ['Eutanasia humanitaria', 'otro', 45, 180000],
        ])->mapWithKeys(fn ($d) => [
            $d[0] => Service::firstOrCreate(
                ['company_id' => $company->id, 'name' => $d[0]],
                ['type' => $d[1], 'estimated_duration_minutes' => $d[2], 'price' => $d[3], 'status' => 'active'],
            ),
        ])->all();
    }

    // ------------------------------------------------------- propietarios/pets

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
            ['Fundación Huellitas', 'Fundación Huellitas de Amor', 'contacto@huellitas.example', '+57 601 555 0210', 'Cra 30 #12-45, Bogotá', 'Fundación / Rescate'],
            ['Criadero Los Cerezos', 'Criadero Los Cerezos', 'info@loscerezos.example', '+57 320 555 0211', 'Vereda El Salitre, Chía', 'Criadero'],
            ['Bienestar - Nexa BPO', 'Nexa BPO', 'bienestar@nexabpo.example', '+57 601 555 0212', 'Av 68 #40-11, Bogotá', 'Convenio empresarial'],
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
            [9, 'Paola Méndez', 'Coordinadora de adopciones', 'adopciones@huellitas.example', '+57 320 555 0310'],
            [10, 'Hernán Cortés', 'Responsable de camada', 'camadas@loscerezos.example', '+57 321 555 0311'],
            [11, 'Ana María Lima', 'Líder de bienestar', 'ana.lima@nexabpo.example', '+57 322 555 0312'],
        ])->each(fn ($d) => Contact::firstOrCreate(
            ['company_id' => $company->id, 'name' => $d[1], 'client_id' => $clients[$d[0]]->id],
            ['role' => $d[2], 'email' => $d[3], 'phone' => $d[4], 'status' => 'active'],
        ));
    }

    /** @return Collection<int,Patient> */
    private function seedPatients(Company $company, Collection $clients, array $species): Collection
    {
        $defaultSpeciesId = Species::query()->where('company_id', $company->id)->value('id');
        $defaultBreedId = Breed::query()->where('company_id', $company->id)->value('id');

        // [ownerIdx, nombres, apellidos, docType, docNum, sexo, nacimiento, eps, ciudad, teléfono, contacto_emergencia, tel_emergencia, resumen_clínico]
        $rows = [
            [0, 'Carlos', 'Mendoza', 'CC', '1018420101', 'male', '1985-03-14', 'EPS Sanitas', 'Bogotá', '+57 310 555 0101', 'Elena Mendoza', '+57 310 555 9901', 'Hipertensión arterial en tratamiento con enalapril.'],
            [0, 'María Elena', 'Gómez', 'CC', '1018420102', 'female', '1990-07-02', 'Sura EPS', 'Bogotá', '+57 311 555 0102', 'Roberto Gómez', '+57 311 555 9902', 'Paciente asmática, uso eventual de salbutamol.'],
            [1, 'Juan Pablo', 'Rodríguez', 'CC', '1018420103', 'male', '1982-11-20', 'Compensar EPS', 'Bogotá', '+57 312 555 0103', 'Patricia Rodríguez', '+57 312 555 9903', 'Antecedente de lumbalgia crónica.'],
            [1, 'Sofía', 'López', 'CC', '1018420104', 'female', '1995-02-10', 'Salud Total', 'Bogotá', '+57 313 555 0104', 'Jorge López', '+57 313 555 9904', 'Alergia a la penicilina.'],
            [2, 'Carmen', 'Ramírez', 'CC', '1018420105', 'female', '1978-01-05', 'Coosalud', 'Bogotá', '+57 314 555 0105', 'Esteban Ramírez', '+57 314 555 9905', 'Diabetes Mellitus tipo 2 controlada.'],
            [3, 'Fernando', 'Álvarez', 'CC', '1018420106', 'male', '1988-05-30', 'EPS Sanitas', 'Bogotá', '+57 315 555 0106', 'Gloria Álvarez', '+57 315 555 9906', 'Sin antecedentes de importancia.'],
            [3, 'Mateo', 'Gutiérrez', 'TI', '1098200107', 'male', '2012-01-18', 'Sura EPS', 'Bogotá', '+57 316 555 0107', 'Laura Gutiérrez', '+57 316 555 9907', 'Controles pediátricos de crecimiento al día.'],
            [4, 'Camila', 'Torres', 'CC', '1018420108', 'female', '1993-09-12', 'Compensar EPS', 'Bogotá', '+57 317 555 0108', 'Andrés Torres', '+57 317 555 9908', 'Gastropatía crónica leve.'],
            [5, 'Alejandro', 'Morales', 'CC', '1018420109', 'male', '1980-12-01', 'Nueva EPS', 'Bogotá', '+57 318 555 0109', 'Marta Morales', '+57 318 555 9909', 'Evaluación post-quirúrgica de rodilla.'],
            [6, 'Lucía', 'Vargas', 'CC', '1018420110', 'female', '1998-06-25', 'FAMISANAR', 'Bogotá', '+57 319 555 0110', 'Felipe Vargas', '+57 319 555 9910', 'Sin antecedentes de trascendencia.'],
            [7, 'Diego', 'Fernández', 'CC', '1018420111', 'male', '1986-08-08', 'EPS Sanitas', 'Bogotá', '+57 320 555 0111', 'Sandra Fernández', '+57 320 555 9911', 'Chequeos ejecutivos periódicos.'],
        ];

        return collect($rows)->map(function ($d) use ($company, $clients, $defaultSpeciesId, $defaultBreedId) {
            $fullName = trim($d[1] . ' ' . $d[2]);
            return Patient::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $clients[$d[0]]->id, 'name' => $fullName],
                [
                    'first_name' => $d[1],
                    'last_name' => $d[2],
                    'document_type' => $d[3],
                    'document_number' => $d[4],
                    'sex' => $d[5],
                    'birth_date' => $d[6],
                    'health_coverage_provider' => $d[7],
                    'city' => $d[8],
                    'phone' => $d[9],
                    'emergency_contact_name' => $d[10],
                    'emergency_contact_phone' => $d[11],
                    'medical_history_summary' => $d[12],
                    'species_id' => $defaultSpeciesId,
                    'breed_id' => $defaultBreedId,
                    'status' => 'active',
                ],
            );
        });
    }

    // ------------------------------------------------------------------ stock

    private function seedStock(
        Company $company,
        Collection $products,
        Collection $suppliers,
        Warehouse $mainWarehouse,
        array $warehouses,
    ): void {
        // Orden de compra recibida -> entradas de stock reales en la Farmacia.
        $po = PurchaseOrder::firstOrCreate(
            ['company_id' => $company->id, 'supplier_id' => $suppliers[0]->id, 'warehouse_id' => $mainWarehouse->id],
            ['status' => 'draft', 'order_date' => Carbon::today()->subDays(18), 'expected_date' => Carbon::today()->subDays(11), 'total' => 0],
        );
        if ($po->items()->count() === 0) {
            $lines = [
                [$products->firstWhere('sku', 'VAC-DHPPI'), 40],
                [$products->firstWhere('sku', 'VAC-RABIA'), 50],
                [$products->firstWhere('sku', 'ANTI-EXT'), 30],
                [$products->firstWhere('sku', 'FARM-AMOXI'), 120],
                [$products->firstWhere('sku', 'ALIM-GASTRO'), 12],
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

        // Existencia de arranque para el resto del catálogo.
        foreach ($products as $product) {
            if (StockMovement::where('product_id', $product->id)->doesntExist()) {
                StockMovement::create([
                    'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $mainWarehouse->id,
                    'type' => 'in', 'quantity' => max(6, $product->reorder_level * 3), 'reason' => 'Inventario inicial',
                ]);
            }
        }

        // Un par de productos por debajo del punto de reorden -> alerta de stock.
        foreach (['VAC-TOS', 'FARM-MELOX'] as $sku) {
            $product = $products->firstWhere('sku', $sku);
            if ($product && StockMovement::where('product_id', $product->id)->where('reason', 'Salida por consumo interno')->doesntExist()) {
                $onHand = (int) StockMovement::where('product_id', $product->id)->sum('quantity');
                $out = max(1, $onHand - (int) floor($product->reorder_level / 2));
                StockMovement::create([
                    'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $mainWarehouse->id,
                    'type' => 'out', 'quantity' => -$out, 'reason' => 'Salida por consumo interno',
                ]);
            }
        }

        // Segunda orden de compra en borrador (pendiente de recibir).
        PurchaseOrder::firstOrCreate(
            ['company_id' => $company->id, 'supplier_id' => $suppliers[1]->id, 'warehouse_id' => $mainWarehouse->id],
            ['status' => 'draft', 'order_date' => Carbon::today(), 'expected_date' => Carbon::today()->addDays(7), 'total' => 0],
        );

        // Traslado de la Farmacia al Depósito (histórico).
        if (StockTransfer::where('company_id', $company->id)->doesntExist()) {
            $product = $products->firstWhere('sku', 'FARM-SUERO');
            $transfer = StockTransfer::create([
                'company_id' => $company->id, 'product_id' => $product->id,
                'from_warehouse_id' => $mainWarehouse->id, 'to_warehouse_id' => $warehouses['Depósito']->id,
                'quantity' => 10, 'reference' => 'TR-0001', 'notes' => 'Reserva de fluidoterapia para hospitalización.',
                'status' => 'completed',
            ]);
            foreach ([[$mainWarehouse->id, -10], [$warehouses['Depósito']->id, 10]] as [$wid, $qty]) {
                StockMovement::create([
                    'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $wid,
                    'type' => 'adjustment', 'quantity' => $qty, 'reason' => 'Transferencia entre bodegas',
                    'reference' => 'transfer:'.$transfer->id,
                ]);
            }
        }
    }

    // -------------------------------------------------------------- agenda

    /** @return Collection<int,Appointment> */
    private function seedAppointments(
        Company $company,
        Collection $patients,
        array $services,
        array $vets,
    ): Collection {
        $general = $services['Consulta general'];
        $vac = $services['Vacunación'];
        $espec = $services['Consulta especializada'];
        $dental = $services['Profilaxis dental'];
        $ester = $services['Esterilización'];

        // [patientIdx, service, start, status, motivo, consultorio, vetIdx]
        $plan = [
            // Pasadas
            [0, $general, now()->subDays(24)->setTime(9, 0), 'attended', 'Control anual', 'Consultorio 1', 0],
            [4, $general, now()->subDays(18)->setTime(10, 30), 'attended', 'Chequeo por vómitos', 'Consultorio 2', 1],
            [7, $dental, now()->subDays(12)->setTime(8, 0), 'attended', 'Profilaxis dental', 'Quirófano', 0],
            [2, $vac, now()->subDays(9)->setTime(11, 0), 'attended', 'Refuerzo triple felina', 'Consultorio 1', 1],
            [9, $general, now()->subDays(6)->setTime(15, 30), 'attended', 'Cojera pata posterior', 'Consultorio 2', 0],
            [11, $general, now()->subDays(5)->setTime(16, 0), 'no_show', 'Control post-operatorio', 'Consultorio 1', 1],
            [3, $vac, now()->subDays(3)->setTime(9, 30), 'attended', 'Primera dosis polivalente', 'Consultorio 1', 0],
            [10, $general, now()->subDays(2)->setTime(14, 0), 'cancelled', 'Dermatitis', 'Consultorio 2', 1],
            // Hoy
            [1, $general, now()->setTime(8, 30), 'attended', 'Revisión de herida', 'Consultorio 1', 0],
            [5, $vac, now()->setTime(9, 30), 'confirmed', 'Refuerzo antirrábica', 'Consultorio 1', 0],
            [8, $espec, now()->setTime(10, 30), 'confirmed', 'Chequeo de ave — plumaje', 'Consultorio 2', 1],
            [13, $general, now()->setTime(11, 30), 'scheduled', 'Valoración para adopción', 'Consultorio 1', 0],
            [6, $general, now()->setTime(15, 0), 'scheduled', 'Estornudos y secreción', 'Consultorio 2', 1],
            // Próximos días
            [12, $general, now()->addDay()->setTime(9, 0), 'scheduled', 'Primera consulta conejo', 'Consultorio 1', 1],
            [15, $vac, now()->addDay()->setTime(10, 0), 'scheduled', 'Segunda dosis polivalente', 'Consultorio 1', 0],
            [7, $ester, now()->addDays(2)->setTime(7, 30), 'confirmed', 'Esterilización programada', 'Quirófano', 0],
            [0, $general, now()->addDays(3)->setTime(16, 0), 'scheduled', 'Control de peso', 'Consultorio 2', 1],
            [14, $general, now()->addDays(4)->setTime(11, 0), 'scheduled', 'Chequeo general', 'Consultorio 1', 0],
        ];

        $out = collect();
        foreach ($plan as [$idx, $service, $start, $status, $reason, $room, $vetIdx]) {
            $patient = $patients->get($idx % $patients->count());
            $minutes = $service->estimated_duration_minutes ?: 30;
            $out->push(Appointment::firstOrCreate(
                ['company_id' => $company->id, 'patient_id' => $patient->id, 'starts_at' => $start],
                [
                    'service_id' => $service->id,
                    'practitioner_id' => $vets[$vetIdx]->id,
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

    // ------------------------------------------------------- historia clínica

    /** @return Collection<int,Consultation> */
    private function seedConsultations(
        Company $company,
        Collection $patients,
        Collection $appointments,
        array $vets,
    ): Collection {
        // [patientIdx, díasAtrás, motivo, peso, temp, S, O, A, P, vetIdx]
        $rows = [
            [0, 24, 'Control anual', 28.4, 38.6,
                'Propietaria refiere apetito y actividad normales. Sin cambios en casa.',
                'Mucosas rosadas, TLLC < 2s. Auscultación cardiopulmonar sin hallazgos. CC 3/5.',
                'Paciente geriátrico joven, sano. Peso adecuado.',
                'Continuar dieta actual. Refuerzo de vacunas al día. Próximo control en 12 meses.', 0],
            [4, 18, 'Vómitos de 24 horas', 15.6, 39.1,
                'Vómito x3 en 24h, última comida no retenida. Bebe agua. Decaída.',
                'Abdomen doloroso a la palpación craneal. Deshidratación estimada 5%.',
                'Gastroenteritis aguda, probable indiscreción alimentaria.',
                'Fluidoterapia SC. Dieta blanda 48h. Antiemético. Metronidazol 7 días. Control en 48h.', 1],
            [7, 12, 'Profilaxis dental — halitosis y sarro', 8.9, 38.4,
                'Mal aliento marcado hace 2 meses. Come normal.',
                'Cálculo dental grado 3 en premolares/molares. Gingivitis moderada. Sin movilidad dentaria.',
                'Enfermedad periodontal grado 2.',
                'Profilaxis bajo anestesia realizada. Extracción de 108. Amoxicilina 7 días. Cepillado en casa.', 0],
            [9, 6, 'Cojera de pata posterior derecha', 34.7, 38.7,
                'Cojea desde ayer tras jugar en el parque. Apoya poco.',
                'Dolor a la extensión de rodilla derecha. Prueba de cajón negativa. Sin crepitación.',
                'Sospecha de esguince de ligamento colateral. Descartar lesión meniscal.',
                'Reposo estricto 10 días. Meloxicam 5 días. Rx si no mejora. Control en 1 semana.', 0],
            [1, 0, 'Revisión de herida en miembro anterior', 33.1, 38.5,
                'Herida por mordida hace 5 días, en curación en casa.',
                'Herida de 2 cm en cara lateral del antebrazo, bordes limpios, tejido de granulación sano. Sin exudado.',
                'Herida en cicatrización por segunda intención, evolución favorable.',
                'Continuar curación diaria con solución salina. Retirar puntos en 3 días. Mantener collar isabelino.', 0],
            [11, 3, 'Primera dosis de vacuna polivalente', 13.4, 38.3,
                'Cachorro adoptado hace 2 semanas, sin antecedentes de vacunación.',
                'Actitud alerta. Mucosas rosadas. Sin parásitos externos visibles. CC 3/5.',
                'Paciente sano apto para plan vacunal.',
                'Polivalente hoy. Desparasitación interna. Segunda dosis en 21 días. Antirrábica al completar esquema.', 0],
        ];

        $out = collect();
        foreach ($rows as [$pIdx, $daysAgo, $reason, $w, $t, $s, $o, $a, $p, $vetIdx]) {
            $patient = $patients->get($pIdx % $patients->count());
            $date = now()->subDays($daysAgo)->toDateString();
            $appt = $appointments->first(fn (Appointment $ap) => $ap->patient_id === $patient->id
                && $ap->starts_at->toDateString() === $date);

            $out->push(Consultation::firstOrCreate(
                ['company_id' => $company->id, 'patient_id' => $patient->id, 'date' => $date],
                [
                    'appointment_id' => $appt?->id,
                    'vet_id' => $vets[$vetIdx]->id,
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
            ['GEA', 'Gastroenteritis aguda'],
            ['PERIO2', 'Enfermedad periodontal grado 2'],
            ['DERM-AT', 'Dermatitis atópica'],
            ['OTIT-EXT', 'Otitis externa'],
            ['IRA', 'Infección respiratoria alta'],
            ['ESGUINCE', 'Esguince de rodilla'],
            ['ERC', 'Enfermedad renal crónica'],
            ['OBES', 'Sobrepeso / obesidad'],
            ['PARASIT', 'Parasitismo intestinal'],
            ['CONJ', 'Conjuntivitis'],
        ])->mapWithKeys(fn ($d) => [
            $d[0] => Diagnosis::firstOrCreate(
                ['company_id' => $company->id, 'name' => $d[1]],
                ['code' => $d[0], 'status' => 'active'],
            ),
        ])->all();
    }

    private function attachDiagnoses(Collection $consultations, array $diagnoses): void
    {
        // Empareja por el motivo de cada consulta ya sembrada.
        $byReason = [
            'Vómitos de 24 horas' => ['GEA', 'PARASIT'],
            'Profilaxis dental — halitosis y sarro' => ['PERIO2'],
            'Cojera de pata posterior derecha' => ['ESGUINCE'],
        ];
        foreach ($consultations as $consultation) {
            $codes = $byReason[$consultation->reason] ?? [];
            if ($codes && $consultation->diagnoses()->count() === 0) {
                $consultation->diagnoses()->sync(collect($codes)->map(fn ($c) => $diagnoses[$c]->id)->all());
            }
        }
    }

    // --------------------------------------------------- vacunas / recetas / procedimientos

    private function seedClinicalApplications(
        Company $company,
        Collection $patients,
        Collection $products,
        array $vets,
        Warehouse $warehouse,
        Collection $consultations,
    ): void {
        $dhppi = $products->firstWhere('sku', 'VAC-DHPPI');
        $rabia = $products->firstWhere('sku', 'VAC-RABIA');
        $tripleF = $products->firstWhere('sku', 'VAC-TRIPLE-F');
        $antiInt = $products->firstWhere('sku', 'ANTI-INT');
        $antiExt = $products->firstWhere('sku', 'ANTI-EXT');

        // [patientIdx, tipo, nombre, producto|null, díasAtrás, próximaDosis(díasDesdeHoy), vetIdx]
        $rows = [
            [0, 'vaccine', 'Vacuna polivalente (DHPPi)', $dhppi, 330, 35, 0],
            [0, 'vaccine', 'Vacuna antirrábica', $rabia, 330, 35, 0],
            [0, 'deworming', 'Desparasitación interna', $antiInt, 95, -5, 1],   // vencida
            [1, 'vaccine', 'Vacuna antirrábica', $rabia, 300, 65, 0],
            [2, 'vaccine', 'Vacuna triple felina', $tripleF, 9, 356, 1],
            [3, 'vaccine', 'Vacuna polivalente (DHPPi) — 1ra dosis', $dhppi, 3, 18, 0],
            [4, 'deworming', 'Antipulgas y garrapatas', $antiExt, 40, -10, 1],  // vencida
            [5, 'vaccine', 'Vacuna antirrábica', $rabia, 350, 12, 0],           // por vencer pronto
            [7, 'vaccine', 'Vacuna polivalente (DHPPi)', $dhppi, 200, 165, 0],
            [9, 'deworming', 'Desparasitación interna', $antiInt, 20, 70, 0],
            [11, 'vaccine', 'Vacuna polivalente (DHPPi) — 1ra dosis', $dhppi, 3, 18, 0],
            [13, 'deworming', 'Desparasitación interna', null, 15, 75, 1],       // sin producto (lote manual)
            [15, 'vaccine', 'Vacuna polivalente (DHPPi) — 1ra dosis', $dhppi, 30, -3, 0], // vencida
        ];

        foreach ($rows as [$pIdx, $type, $name, $product, $daysAgo, $dueInDays, $vetIdx]) {
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
                    'type' => 'out', 'quantity' => -1, 'reason' => 'Aplicación clínica',
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
                'vet_id' => $vets[$vetIdx]->id,
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
        array $vets,
    ): void {
        $amoxi = $products->firstWhere('sku', 'FARM-AMOXI');
        $melox = $products->firstWhere('sku', 'FARM-MELOX');
        $gaba = $products->firstWhere('sku', 'FARM-GABA');

        // [motivoDeConsulta, notas, items[[producto|null, nombre, dosis, frecuencia, duración]]]
        $plans = [
            ['Vómitos de 24 horas', 'Administrar con el estómago vacío. Suspender si hay reacción cutánea.', [
                [$amoxi, 'Amoxicilina 250 mg', '1/2 tableta', 'Cada 12 horas', '7 días'],
                [null, 'Metronidazol 250 mg', '1/4 tableta', 'Cada 12 horas', '5 días'],
            ]],
            ['Profilaxis dental — halitosis y sarro', 'Control de dolor post-profilaxis.', [
                [$amoxi, 'Amoxicilina 250 mg', '1 tableta', 'Cada 12 horas', '7 días'],
                [$melox, 'Meloxicam 1,5 mg/ml', '0,9 ml', 'Cada 24 horas', '3 días'],
            ]],
            ['Cojera de pata posterior derecha', 'Reposo estricto. No administrar con el estómago vacío.', [
                [$melox, 'Meloxicam 1,5 mg/ml', '1,7 ml', 'Cada 24 horas', '5 días'],
                [$gaba, 'Gabapentina 100 mg', '1 tableta', 'Cada 8 horas', '7 días'],
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
                'vet_id' => $consultation->vet_id ?? $vets[0]->id,
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
        array $vets,
    ): void {
        // [patientIdx, tipo, servicio, díasAtrás, notas, vetIdx]
        $rows = [
            [7, 'Profilaxis dental con extracción de 108', $services['Profilaxis dental'], 12,
                'Anestesia con propofol/isoflurano. Sangrado controlado. Alta el mismo día. Recomendado cepillado diario.', 0],
            [4, 'Sutura de herida en miembro anterior', $services['Curación / manejo de heridas'], 6,
                'Herida por mordida. 3 puntos con nylon 3-0. Antibiótico y collar isabelino. Retiro de puntos en 10 días.', 1],
            [8, 'Ovariohisterectomía (esterilización)', $services['Esterilización'], 40,
                'Cirugía sin complicaciones. Recuperación anestésica normal. Control post-operatorio a los 3 y 10 días.', 0],
            [0, 'Limpieza de oídos bajo sedación', $services['Consulta especializada'], 60,
                'Otitis externa bilateral. Citología: cocos y levaduras. Tratamiento tópico 14 días.', 1],
        ];

        foreach ($rows as [$pIdx, $type, $service, $daysAgo, $notes, $vetIdx]) {
            $patient = $patients->get($pIdx % $patients->count());
            Procedure::firstOrCreate(
                ['company_id' => $company->id, 'patient_id' => $patient->id, 'type' => $type],
                [
                    'service_id' => $service->id,
                    'vet_id' => $vets[$vetIdx]->id,
                    'performed_at' => now()->subDays($daysAgo)->toDateString(),
                    'notes' => $notes,
                ],
            );
        }
    }

    // ------------------------------------------------------------ portal / ventas

    private function seedLeads(Company $company): void
    {
        $rows = [
            ['Andrea Salcedo', 'andrea.salcedo@gmail.com', '+57 300 555 0401', 'appointment', 'new',
                'Mascota: Rocky (labrador). Motivo: vacunación. Fecha preferida: sábado en la mañana.'],
            ['Miguel Ángel Ruiz', 'miguel.ruiz@gmail.com', '+57 301 555 0402', 'appointment', 'new',
                'Mascota: Pelusa (gata). Motivo: control por estornudos. Fecha preferida: entre semana en la tarde.'],
            ['Carolina Méndez', 'carolina.mendez@hotmail.com', '+57 302 555 0403', 'appointment', 'contacted',
                'Mascota: Thor (bulldog). Motivo: revisión de piel. Fecha preferida: lunes.'],
            ['Julián Pardo', 'julian.pardo@gmail.com', '+57 303 555 0404', 'appointment', 'new',
                'Mascota: Nala. Motivo: primera consulta cachorro.'],
            ['Verónica Lozano', 'veronica.lozano@nexabpo.example', '+57 304 555 0405', 'contact', 'new',
                'Consulta por convenio de bienestar animal para colaboradores.'],
            ['Tomás Salazar', 'tomas.salazar@gmail.com', '+57 305 555 0406', 'contact', 'discarded',
                'Preguntó por horarios; no volvió a responder.'],
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

    private function seedProductSales(
        Company $company,
        Collection $clients,
        Collection $publicProducts,
        Warehouse $warehouse,
        User $reception,
    ): void {
        $gastro = $publicProducts->firstWhere('sku', 'ALIM-GASTRO');
        $recov = $publicProducts->firstWhere('sku', 'ALIM-RECOV');
        $collar = $publicProducts->firstWhere('sku', 'ACC-COLLAR');
        $shampoo = $publicProducts->firstWhere('sku', 'ACC-SHAMP');

        $plans = [
            ['client' => $clients[1], 'confirmed' => true, 'items' => [[$gastro, 1], [$recov, 6]]],
            ['client' => $clients[3], 'confirmed' => true, 'items' => [[$collar, 1], [$shampoo, 1]]],
            ['client' => $clients[6], 'confirmed' => false, 'items' => [[$shampoo, 2]]],
        ];

        foreach ($plans as $i => $plan) {
            $order = Order::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $plan['client']->id, 'warehouse_id' => $warehouse->id],
                ['owner_id' => $reception->id, 'status' => 'draft', 'total' => 0],
            );
            if ($order->items()->count() > 0) {
                continue;
            }
            $total = 0;
            foreach ($plan['items'] as [$product, $qty]) {
                OrderItem::create([
                    'order_id' => $order->id, 'product_id' => $product->id, 'product_name' => $product->name,
                    'sku' => $product->sku, 'quantity' => $qty, 'unit_price' => $product->unit_price,
                ]);
                $total += $qty * $product->unit_price;
            }
            $order->update(['total' => $total]);
            if ($plan['confirmed']) {
                foreach ($plan['items'] as [$product, $qty]) {
                    StockMovement::create([
                        'company_id' => $company->id, 'product_id' => $product->id, 'warehouse_id' => $warehouse->id,
                        'type' => 'out', 'quantity' => -$qty, 'reason' => 'Venta de mostrador', 'reference' => 'order:'.$order->id,
                    ]);
                }
                $order->update(['status' => 'confirmed']);
            }
        }
    }

    private function seedSurgeryQuotes(Company $company, Collection $clients, array $services): void
    {
        // Presupuestos de procedimiento entregados a propietarios.
        $plans = [
            ['client' => $clients[3], 'status' => 'sent', 'title' => 'Presupuesto esterilización — Toby',
                'items' => [[$services['Esterilización'], 1], [$services['Consulta general'], 1]]],
            ['client' => $clients[7], 'status' => 'accepted', 'title' => 'Presupuesto profilaxis dental — Bruno',
                'items' => [[$services['Profilaxis dental'], 1], [$services['Hospitalización (día)'], 1]]],
            ['client' => $clients[9], 'status' => 'draft', 'title' => 'Presupuesto cirugía de tejidos blandos — Estrella',
                'items' => [[$services['Cirugía de tejidos blandos'], 1], [$services['Hospitalización (día)'], 2]]],
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
            'Plan de salud anual — familia Herrera',
            'Convenio de bienestar animal — Nexa BPO',
            'Plan preventivo camada — Criadero Los Cerezos',
            'Paquete adopción responsable — Fundación Huellitas',
            'Plan sénior — Nina (Schnauzer)',
        ];
        foreach ($titles as $i => $title) {
            $client = $clients[[0, 11, 10, 9, 4][$i]];
            Deal::firstOrCreate(
                ['company_id' => $company->id, 'client_id' => $client->id, 'title' => $title],
                [
                    'owner_id' => $i % 2 === 0 ? $admin->id : $sales->id,
                    'amount' => 350000 + $i * 220000,
                    'stage' => $stages[$i % count($stages)],
                    'expected_close_date' => Carbon::today()->addDays(7 + $i * 6),
                ],
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
            [0, 'Luna: propietaria muy puntual con los refuerzos. Prefiere cita a primera hora.'],
            [4, 'Diana pidió recordatorio por WhatsApp para la desparasitación de Pipo.'],
            [9, 'Fundación Huellitas: facturación mensual consolidada. Contacto de adopciones para valoraciones.'],
            [10, 'Criadero Los Cerezos: coordinar plan vacunal de camada completa (6 cachorros).'],
        ])->each(fn ($d) => ClientNote::firstOrCreate(
            ['company_id' => $company->id, 'client_id' => $clients[$d[0]]->id, 'body' => $d[1]],
            ['user_id' => $admin->id],
        ));

        collect([
            ['task', 'Llamar a Marcela Ríos para agendar control de Kiara', 2, 1, false],
            ['task', 'Confirmar ayuno para la esterilización de Nina', null, 1, false],
            ['followup', 'Recordatorio de refuerzo antirrábico — Max', 0, 3, false],
            ['followup', 'Seguimiento post-operatorio — Bruno (profilaxis dental)', 7, -1, true],
            ['task', 'Cotizar plan preventivo para camada — Criadero Los Cerezos', 10, 4, false],
        ])->each(fn ($d) => Activity::firstOrCreate(
            ['company_id' => $company->id, 'subject' => $d[1]],
            [
                'client_id' => $d[2] === null ? null : $clients[$d[2]]->id,
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

    private function seedFinancialData(
        Company $company,
        User $reception,
        Collection $clients,
        Collection $suppliers,
    ): void {
        $cashRegister = CashRegister::where('company_id', $company->id)->first();
        if ($cashRegister && CashSession::where('company_id', $company->id)->doesntExist()) {
            $session = CashSession::create([
                'company_id' => $company->id,
                'cash_register_id' => $cashRegister->id,
                'opened_by' => $reception->id,
                'opening_amount' => 200000,
                'closing_amount' => 580000,
                'status' => 'closed',
                'opened_at' => now()->subDay()->setHour(8)->setMinute(0),
                'closed_at' => now()->subDay()->setHour(18)->setMinute(0),
            ]);

            CashMovement::create([
                'company_id' => $company->id,
                'cash_session_id' => $session->id,
                'user_id' => $reception->id,
                'type' => 'income',
                'amount' => 380000,
                'method' => 'cash',
                'notes' => 'Recaudo consultas CareNote AI',
                'source_type' => 'App\\Models\\Client',
                'source_id' => $clients->first()?->id ?? 1,
            ]);

            CashSession::create([
                'company_id' => $company->id,
                'cash_register_id' => $cashRegister->id,
                'opened_by' => $reception->id,
                'opening_amount' => 200000,
                'status' => 'open',
                'opened_at' => now()->setHour(8)->setMinute(0),
            ]);
        }

        if (Invoice::where('company_id', $company->id)->doesntExist() && $clients->isNotEmpty()) {
            $client = $clients->first();
            $invNumber = 1001;

            foreach ([
                ['status' => 'paid', 'total' => 280000, 'paid' => 280000, 'items' => [['Consulta médica + Transcripción CareNote AI', 280000]]],
                ['status' => 'posted', 'total' => 450000, 'paid' => 0, 'items' => [['Sesión de evaluación clínica especializada', 450000]]],
                ['status' => 'posted', 'total' => 190000, 'paid' => 90000, 'items' => [['Control de seguimiento + Prescripción AI', 190000]]],
                ['status' => 'draft', 'total' => 150000, 'paid' => 0, 'items' => [['Procedimiento ambulatorio asistido', 150000]]],
                ['status' => 'cancelled', 'total' => 90000, 'paid' => 0, 'items' => [['Teleconsulta asistida por voz', 90000]]],
            ] as $invData) {
                $num = 'FAC-' . $invNumber++;
                $invoice = Invoice::create([
                    'company_id' => $company->id,
                    'client_id' => $client->id,
                    'number' => $num,
                    'status' => $invData['status'],
                    'issue_date' => now()->subDays(rand(1, 15))->toDateString(),
                    'due_date' => now()->addDays(rand(5, 30))->toDateString(),
                    'subtotal' => $invData['total'],
                    'tax' => 0,
                    'total' => $invData['total'],
                ]);

                foreach ($invData['items'] as [$itemDesc, $itemPrice]) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'product_name' => $itemDesc,
                        'quantity' => 1,
                        'unit_price' => $itemPrice,
                        'discount' => 0,
                        'tax' => 0,
                        'line_total' => $itemPrice,
                    ]);
                }

                if (in_array($invData['status'], ['posted', 'paid']) && ($invData['total'] - $invData['paid']) > 0) {
                    AccountReceivable::create([
                        'company_id' => $company->id,
                        'client_id' => $client->id,
                        'invoice_id' => $invoice->id,
                        'original_amount' => $invData['total'],
                        'paid_amount' => $invData['paid'],
                        'balance' => $invData['total'] - $invData['paid'],
                        'status' => ($invData['paid'] > 0) ? 'partial' : 'pending',
                        'due_date' => $invoice->due_date,
                    ]);
                }
            }
        }

        if (AccountPayable::where('company_id', $company->id)->doesntExist() && $suppliers->isNotEmpty()) {
            $supplier = $suppliers->first();
            foreach ([
                ['amount' => 1200000, 'balance' => 1200000, 'status' => 'pending'],
                ['amount' => 650000, 'balance' => 300000, 'status' => 'partial'],
                ['amount' => 250000, 'balance' => 0, 'status' => 'paid'],
            ] as $apData) {
                AccountPayable::create([
                    'company_id' => $company->id,
                    'supplier_id' => $supplier->id,
                    'original_amount' => $apData['amount'],
                    'paid_amount' => $apData['amount'] - $apData['balance'],
                    'balance' => $apData['balance'],
                    'status' => $apData['status'],
                    'due_date' => now()->addDays(rand(10, 30))->toDateString(),
                ]);
            }
        }
    }
}
