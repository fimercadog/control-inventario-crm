<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\ClinicalApplication;
use App\Models\Company;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Service;
use App\Models\Species;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * S10 — Reportes clínicos + métricas veterinarias del dashboard.
 */
class ClinicalReportTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Patient $patient;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => fake()->company()]);
        foreach (['clinical_reports.view', 'dashboard.view'] as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo(['clinical_reports.view', 'dashboard.view']);
        Sanctum::actingAs($user, ['*']);

        $client = Client::factory()->create(['company_id' => $this->company->id]);
        $species = Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);
        $this->patient = Patient::query()->create([
            'company_id' => $this->company->id, 'client_id' => $client->id, 'species_id' => $species->id,
            'name' => 'Luna', 'sex' => 'female', 'status' => 'active',
        ]);
    }

    public function test_clinical_report_counts_activity_in_the_range(): void
    {
        $service = Service::create([
            'company_id' => $this->company->id, 'name' => 'Consulta', 'price' => 50000, 'status' => 'active',
        ]);

        Consultation::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id,
            'date' => now()->toDateString(), 'reason' => 'Control',
        ]);
        ClinicalApplication::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id, 'type' => 'vaccine',
            'name' => 'Antirrábica', 'applied_at' => now()->toDateString(),
        ]);
        Appointment::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id, 'service_id' => $service->id,
            'starts_at' => now(), 'ends_at' => now()->addMinutes(30), 'duration_minutes' => 30, 'status' => 'attended',
        ]);
        // Fuera de rango: no debe contar.
        Consultation::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id,
            'date' => now()->subMonths(3)->toDateString(), 'reason' => 'Vieja',
        ]);

        $report = $this->getJson('/api/reports/clinical')->assertOk()->json();

        $this->assertSame(1, $report['patients_attended']);
        $this->assertSame(1, $report['consultations']);
        $this->assertSame(1, $report['vaccinations_applied']);
        $this->assertSame(1, $report['appointments_by_status']['attended']);
        $this->assertEquals(50000, $report['revenue_by_service']['Consulta']);
    }

    public function test_report_requires_the_permission(): void
    {
        Permission::firstOrCreate(['name' => 'patients.manage', 'guard_name' => 'web']);
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo('patients.manage');
        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/reports/clinical')->assertForbidden();
    }

    public function test_dashboard_includes_clinical_metrics(): void
    {
        Appointment::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id,
            'starts_at' => now()->setTime(10, 0), 'ends_at' => now()->setTime(10, 30),
            'duration_minutes' => 30, 'status' => 'scheduled',
        ]);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonStructure(['clinical' => ['appointments_today', 'active_patients', 'vaccinations_due', 'consultations_month']])
            ->assertJsonPath('clinical.appointments_today', 1)
            ->assertJsonPath('clinical.active_patients', 1);
    }
}
