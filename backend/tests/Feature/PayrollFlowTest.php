<?php

namespace Tests\Feature;

use App\Models\AccountPayable;
use App\Models\AuditLog;
use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\CashSession;
use App\Models\Company;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\User;
use App\Services\PayrollCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PayrollFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Company $company;
    protected Employee $employeeMin;
    protected Employee $employeeHigh;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::create(['name' => 'employees.manage']);

        $this->company = Company::create([
            'name' => 'Empresa RRHH Demo',
            'nit' => '900555444-1',
        ]);

        $this->user = User::factory()->create([
            'company_id' => $this->company->id,
        ]);
        $this->user->givePermissionTo('employees.manage');

        // Empleado con Salario Mínimo (Recibe Auxilio de Transporte)
        $this->employeeMin = Employee::create([
            'company_id' => $this->company->id,
            'employee_code' => 'EMP-001',
            'first_name' => 'Carlos',
            'last_name' => 'Perez',
            'identification_type' => 'CC',
            'identification_number' => '10101010',
            'hire_date' => '2025-01-01',
            'employment_status' => 'activo',
            'salary' => 1423500.00, // 1 SMLV
        ]);

        // Empleado con Salario Alto (> 2 SMLV, NO recibe Auxilio de Transporte)
        $this->employeeHigh = Employee::create([
            'company_id' => $this->company->id,
            'employee_code' => 'EMP-002',
            'first_name' => 'Laura',
            'last_name' => 'Mendoza',
            'identification_type' => 'CC',
            'identification_number' => '20202020',
            'hire_date' => '2025-01-01',
            'employment_status' => 'activo',
            'salary' => 4500000.00, // > 2 SMLV
        ]);
    }

    public function test_can_create_payroll_period()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/payrolls', [
                'period_start' => '2026-09-01',
                'period_end' => '2026-09-30',
                'payroll_type' => 'mensual',
                'notes' => 'Nómina ordinaria Septiembre 2026',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'BORRADOR')
            ->assertJsonPath('data.payroll_type', 'mensual');

        $this->assertDatabaseHas('payrolls', [
            'company_id' => $this->company->id,
            'status' => 'BORRADOR',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payroll_period_created',
        ]);
    }

    public function test_payroll_calculation_service_colombian_rules()
    {
        $payroll = Payroll::create([
            'company_id' => $this->company->id,
            'payroll_code' => 'NOM-202609-01',
            'period_start' => '2026-09-01',
            'period_end' => '2026-09-30',
            'status' => 'BORRADOR',
        ]);

        $service = new PayrollCalculationService();
        $updated = $service->calculate($payroll);

        $this->assertEquals('CALCULADA', $updated->status);
        $this->assertCount(2, $updated->details);

        // Verificación Empleado Salario Mínimo:
        // Devengado: 1.423.500 (Sueldo) + 162.000 (Aux Trans) = 1.585.500
        // IBC = 1.423.500
        // Salud 4% = 56.940
        // Pensión 4% = 56.940
        // Total Deducciones = 113.880
        // Neto a Pagar = 1.471.620
        $detailMin = $updated->details->firstWhere('employee_id', $this->employeeMin->id);
        $this->assertEquals(162000.00, $detailMin->transport_subsidy);
        $this->assertEquals(1585500.00, $detailMin->total_accrued);
        $this->assertEquals(56940.00, $detailMin->health_deduction);
        $this->assertEquals(56940.00, $detailMin->pension_deduction);
        $this->assertEquals(1471620.00, $detailMin->net_payable);

        // Verificación Empleado Salario Alto:
        // Devengado: 4.500.000 (Sueldo) + 0 (Aux Trans) = 4.500.000
        // IBC = 4.500.000
        // Salud 4% = 180.000
        // Pensión 4% = 180.000
        // Total Deducciones = 360.000
        // Neto a Pagar = 4.140.000
        $detailHigh = $updated->details->firstWhere('employee_id', $this->employeeHigh->id);
        $this->assertEquals(0, $detailHigh->transport_subsidy);
        $this->assertEquals(4500000.00, $detailHigh->total_accrued);
        $this->assertEquals(180000.00, $detailHigh->health_deduction);
        $this->assertEquals(180000.00, $detailHigh->pension_deduction);
        $this->assertEquals(4140000.00, $detailHigh->net_payable);
    }

    public function test_full_payroll_lifecycle_and_erp_financial_integration()
    {
        $this->withoutExceptionHandling();
        // 1. Crear Período
        $payroll = Payroll::create([
            'company_id' => $this->company->id,
            'payroll_code' => 'NOM-202609-E2E',
            'period_start' => '2026-09-01',
            'period_end' => '2026-09-30',
            'status' => 'BORRADOR',
        ]);

        // 2. Calcular Nómina
        $responseCalc = $this->actingAs($this->user)
            ->postJson("/api/payrolls/{$payroll->id}/calculate");

        $responseCalc->assertStatus(200)
            ->assertJsonPath('data.status', 'CALCULADA');

        // 3. Aprobar Nómina y Generar Cuentas por Pagar (CXP)
        $responseApprove = $this->actingAs($this->user)
            ->postJson("/api/payrolls/{$payroll->id}/approve");

        $responseApprove->assertStatus(200)
            ->assertJsonPath('data.status', 'APROBADA');

        $this->assertDatabaseHas('accounts_payable', [
            'company_id' => $this->company->id,
            'status' => 'pending',
        ]);

        // Intentar recalcular nómina aprobada debe fallar con 422
        $responseBlocked = $this->actingAs($this->user)
            ->postJson("/api/payrolls/{$payroll->id}/calculate");

        $responseBlocked->assertStatus(422);

        // 4. Registrar Pago de Nómina y Verificar Egreso de Caja ERP
        $cashRegister = CashRegister::create(['company_id' => $this->company->id, 'name' => 'Caja Principal']);
        $cashSession = CashSession::create(['company_id' => $this->company->id, 'cash_register_id' => $cashRegister->id, 'opened_by' => $this->user->id, 'opening_amount' => 10000000, 'opened_at' => now()]);

        $responsePay = $this->actingAs($this->user)
            ->postJson("/api/payrolls/{$payroll->id}/pay");

        $responsePay->assertStatus(200)
            ->assertJsonPath('data.status', 'PAGADA');

        $this->assertDatabaseHas('cash_movements', [
            'cash_session_id' => $cashSession->id,
            'type' => 'expense',
        ]);

        $this->assertDatabaseHas('accounts_payable', [
            'company_id' => $this->company->id,
            'status' => 'paid',
            'balance' => 0,
        ]);

        // 5. Cerrar Nómina
        $responseClose = $this->actingAs($this->user)
            ->postJson("/api/payrolls/{$payroll->id}/close");

        $responseClose->assertStatus(200)
            ->assertJsonPath('data.status', 'CERRADA');

        $this->assertDatabaseHas('audit_logs', ['action' => 'payroll_closed']);
    }

    public function test_unauthorized_user_is_forbidden()
    {
        $otherUser = User::factory()->create(['company_id' => $this->company->id]);
        // Sin permiso employees.manage

        $response = $this->actingAs($otherUser)
            ->getJson('/api/payrolls');

        $response->assertStatus(403);
    }
}
