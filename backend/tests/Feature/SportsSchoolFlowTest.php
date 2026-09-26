<?php

namespace Tests\Feature;

use App\Models\AccountReceivable;
use App\Models\Attendance;
use App\Models\Client;
use App\Models\Company;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Student;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SportsSchoolFlowTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private User $adminUser;

    private Client $acudiente;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::create(['name' => 'Escuela de Fútbol Cantera Real', 'status' => 'active']);

        Permission::firstOrCreate(['name' => 'clients.manage', 'guard_name' => 'web']);

        $this->adminUser = User::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Director Deportivo',
            'email' => 'director@canterareal.test',
        ]);
        $this->adminUser->givePermissionTo('clients.manage');

        Sanctum::actingAs($this->adminUser, ['*']);

        $this->acudiente = Client::create([
            'company_id' => $this->company->id,
            'name' => 'María Fernanda Gómez',
            'email' => 'maria@parent.test',
            'phone' => '573001234567',
        ]);
    }

    public function test_team_crud_lifecycle(): void
    {
        // 1. Create Team
        $res = $this->postJson('/api/teams', [
            'name' => 'Sub-10 Torneo Cantera',
            'category_code' => 'SUB-10',
            'min_age' => 8,
            'max_age' => 10,
            'coach_name' => 'Profe Carlos Mendoza',
            'training_schedule' => 'Lunes y Miércoles 16:00 - 18:00',
            'monthly_fee' => 180000,
        ]);
        $res->assertStatus(201);
        $teamId = $res->json('data.id');

        // 2. Index
        $indexRes = $this->getJson('/api/teams');
        $indexRes->assertStatus(200);
        $this->assertCount(1, $indexRes->json('data'));

        // 3. Update
        $updateRes = $this->putJson("/api/teams/{$teamId}", [
            'name' => 'Sub-10 Selección Cantera Real',
            'monthly_fee' => 195000,
        ]);
        $updateRes->assertStatus(200);
        $this->assertEquals(195000, Team::find($teamId)->monthly_fee);
    }

    public function test_student_registration_linked_to_acudiente(): void
    {
        $team = Team::create([
            'company_id' => $this->company->id,
            'name' => 'Sub-12 Competición',
            'category_code' => 'SUB-12',
            'monthly_fee' => 200000,
        ]);

        $res = $this->postJson('/api/students', [
            'client_id' => $this->acudiente->id,
            'team_id' => $team->id,
            'first_name' => 'Santiago',
            'last_name' => 'Gómez',
            'birth_date' => '2014-06-12',
            'identification_number' => '1098765432',
            'position' => 'Mediocampista',
            'shirt_number' => 10,
            'shirt_size' => '12',
            'rh_factor' => 'O+',
            'eps_health' => 'EPS Sura',
        ]);

        $res->assertStatus(201);
        $studentId = $res->json('data.id');

        $student = Student::find($studentId);
        $this->assertNotNull($student);
        $this->assertEquals('Santiago Gómez', $student->full_name);
        $this->assertEquals($this->acudiente->id, $student->client_id);
    }

    public function test_enrollment_creates_invoice_and_account_receivable(): void
    {
        $team = Team::create([
            'company_id' => $this->company->id,
            'name' => 'Sub-15 Elite',
            'category_code' => 'SUB-15',
            'monthly_fee' => 220000,
        ]);

        $student = Student::create([
            'company_id' => $this->company->id,
            'client_id' => $this->acudiente->id,
            'team_id' => $team->id,
            'first_name' => 'Mateo',
            'last_name' => 'Fernández',
        ]);

        $res = $this->postJson('/api/enrollments', [
            'student_id' => $student->id,
            'team_id' => $team->id,
            'monthly_fee' => 220000,
            'enrollment_fee' => 50000,
            'billing_day' => 5,
            'start_date' => '2026-09-01',
        ]);

        $res->assertStatus(201);
        $enrollmentId = $res->json('data.id');

        $enrollment = Enrollment::find($enrollmentId);
        $this->assertNotNull($enrollment);
        $this->assertEquals('active', $enrollment->status);

        // Verify Invoice generated in ERP Core
        $invoice = Invoice::where('client_id', $this->acudiente->id)->first();
        $this->assertNotNull($invoice);
        $this->assertEquals(270000, $invoice->total);

        // Verify Account Receivable generated in ERP Core Cartera
        $ar = AccountReceivable::where('client_id', $this->acudiente->id)->first();
        $this->assertNotNull($ar);
        $this->assertEquals(270000, $ar->original_amount);
        $this->assertEquals(270000, $ar->balance);
        $this->assertEquals('pending', $ar->status);
    }

    public function test_attendance_bulk_recording(): void
    {
        $team = Team::create([
            'company_id' => $this->company->id,
            'name' => 'Sub-8 Semillero',
            'category_code' => 'SUB-8',
            'monthly_fee' => 150000,
        ]);

        $st1 = Student::create([
            'company_id' => $this->company->id,
            'client_id' => $this->acudiente->id,
            'team_id' => $team->id,
            'first_name' => 'Lucas',
            'last_name' => 'Gómez',
        ]);

        $st2 = Student::create([
            'company_id' => $this->company->id,
            'client_id' => $this->acudiente->id,
            'team_id' => $team->id,
            'first_name' => 'Mateo',
            'last_name' => 'Ríos',
        ]);

        $res = $this->postJson('/api/attendances', [
            'team_id' => $team->id,
            'date' => '2026-09-25',
            'attendances' => [
                ['student_id' => $st1->id, 'status' => 'present', 'notes' => 'Excelente actitud'],
                ['student_id' => $st2->id, 'status' => 'excused', 'notes' => 'Cita médica'],
            ],
        ]);

        $res->assertStatus(200);
        $this->assertEquals(2, Attendance::where('team_id', $team->id)->count());
    }
}
