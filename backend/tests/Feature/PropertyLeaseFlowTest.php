<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\CashSession;
use App\Models\Client;
use App\Models\Company;
use App\Models\Property;
use App\Models\PropertyLease;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyLeaseFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Company $company;
    protected Client $tenant;
    protected Property $property;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create([
            'name' => 'Inmobiliaria Central Demo',
            'nit' => '900888777-1',
        ]);

        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
        ]);

        $this->tenant = Client::create([
            'company_id' => $this->company->id,
            'name' => 'Juan Arrendatario',
            'email' => 'juan.tenant@ejemplo.com',
            'phone' => '3001112233',
        ]);

        $this->property = Property::create([
            'company_id' => $this->company->id,
            'code' => 'PROP-101',
            'title' => 'Apartamento 502 Poblado',
            'property_type' => 'apartamento',
            'listing_type' => 'arriendo',
            'status' => 'disponible',
            'city' => 'Medellín',
            'address' => 'Calle 10 # 40-20',
            'price' => 2500000.00,
        ]);
    }

    public function test_can_create_property_lease_contract()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/property-leases', [
                'property_id' => $this->property->id,
                'client_id' => $this->tenant->id,
                'monthly_rent' => 2500000.00,
                'deposit_amount' => 2500000.00,
                'start_date' => '2026-10-01',
                'end_date' => '2027-09-30',
                'payment_day' => 5,
                'notes' => 'Contrato residencial de 12 meses',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'ACTIVO')
            ->assertJsonPath('data.monthly_rent', '2500000.00');

        $this->assertDatabaseHas('property_leases', [
            'company_id' => $this->company->id,
            'property_id' => $this->property->id,
            'client_id' => $this->tenant->id,
            'status' => 'ACTIVO',
        ]);

        // Verificar que el inmueble cambio su estado a 'arrendado'
        $this->assertDatabaseHas('properties', [
            'id' => $this->property->id,
            'status' => 'arrendado',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'property_lease_created',
        ]);
    }

    public function test_full_rent_collection_and_erp_financial_integration()
    {
        $lease = PropertyLease::create([
            'company_id' => $this->company->id,
            'property_id' => $this->property->id,
            'client_id' => $this->tenant->id,
            'contract_number' => 'CTR-202610-TEST',
            'monthly_rent' => 2500000.00,
            'deposit_amount' => 2500000.00,
            'start_date' => '2026-10-01',
            'end_date' => '2027-09-30',
            'status' => 'ACTIVO',
        ]);

        // Preparar caja en ERP
        $cashRegister = CashRegister::create(['company_id' => $this->company->id, 'name' => 'Caja Principal Inmobiliaria']);
        $cashSession = CashSession::create(['company_id' => $this->company->id, 'cash_register_id' => $cashRegister->id, 'opened_by' => $this->user->id, 'opening_amount' => 500000, 'opened_at' => now()]);

        // Ejecutar recaudo de canon
        $response = $this->actingAs($this->user)
            ->postJson("/api/property-leases/{$lease->id}/collect-rent", [
                'amount' => 2500000.00,
                'payment_method' => 'transfer',
                'notes' => 'Recaudo canon Octubre 2026',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.lease.contract_number', 'CTR-202610-TEST');

        // Verificaciones ERP:
        // 1. Factura Creada y Pagada
        $this->assertDatabaseHas('invoices', [
            'company_id' => $this->company->id,
            'client_id' => $this->tenant->id,
            'status' => 'paid',
            'total' => 2500000.00,
        ]);

        // 2. Cartera / Cuenta por Cobrar registrada y saldada
        $this->assertDatabaseHas('accounts_receivable', [
            'company_id' => $this->company->id,
            'client_id' => $this->tenant->id,
            'status' => 'paid',
            'balance' => 0,
        ]);

        // 3. Ingreso de Caja Registrado en ERP
        $this->assertDatabaseHas('cash_movements', [
            'company_id' => $this->company->id,
            'cash_session_id' => $cashSession->id,
            'type' => 'income',
            'amount' => 2500000.00,
            'source_type' => PropertyLease::class,
            'source_id' => $lease->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'property_lease_rent_collected',
        ]);
    }
}
