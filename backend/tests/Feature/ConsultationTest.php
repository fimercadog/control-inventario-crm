<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Client;
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
 * S6 — Historia clínica / Consultas SOAP.
 */
class ConsultationTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Patient $patient;

    private User $vet;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => fake()->company()]);
        foreach (['medical_records.manage', 'appointments.manage'] as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        $this->vet = User::factory()->create(['company_id' => $this->company->id]);
        $this->vet->givePermissionTo(['medical_records.manage', 'appointments.manage']);
        Sanctum::actingAs($this->vet, ['*']);

        $client = Client::factory()->create(['company_id' => $this->company->id]);
        $species = Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);
        $this->patient = Patient::query()->create([
            'company_id' => $this->company->id, 'client_id' => $client->id, 'species_id' => $species->id,
            'name' => 'Luna', 'sex' => 'female', 'status' => 'active',
        ]);
    }

    public function test_registers_a_soap_consultation_and_defaults_vet_to_current_user(): void
    {
        $this->postJson('/api/consultations', [
            'patient_id' => $this->patient->id,
            'date' => now()->toDateString(),
            'reason' => 'Control',
            'subjective' => 'Come bien',
            'objective' => 'Todo normal',
            'assessment' => 'Sano',
            'plan' => 'Control en 6 meses',
        ])->assertCreated()
            ->assertJsonPath('data.reason', 'Control')
            ->assertJsonPath('data.vet_id', $this->vet->id);
    }

    public function test_creating_from_an_appointment_marks_it_attended(): void
    {
        $service = Service::create([
            'company_id' => $this->company->id, 'name' => 'Consulta', 'price' => 0, 'status' => 'active',
        ]);
        $appointment = Appointment::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id, 'service_id' => $service->id,
            'starts_at' => now(), 'ends_at' => now()->addMinutes(30), 'duration_minutes' => 30, 'status' => 'confirmed',
        ]);

        $this->postJson('/api/consultations', [
            'patient_id' => $this->patient->id,
            'appointment_id' => $appointment->id,
            'date' => now()->toDateString(),
            'reason' => 'Atención',
        ])->assertCreated();

        $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'attended']);
    }

    public function test_future_date_is_rejected(): void
    {
        $this->postJson('/api/consultations', [
            'patient_id' => $this->patient->id,
            'date' => now()->addWeek()->toDateString(),
            'reason' => 'X',
        ])->assertStatus(422)->assertJsonValidationErrors('date');
    }

    public function test_reception_cannot_touch_medical_records(): void
    {
        Permission::firstOrCreate(['name' => 'patients.manage', 'guard_name' => 'web']);
        $reception = User::factory()->create(['company_id' => $this->company->id]);
        $reception->givePermissionTo('patients.manage');
        Sanctum::actingAs($reception, ['*']);

        $this->getJson('/api/consultations')->assertForbidden();
    }

    public function test_destroy_soft_deletes_and_history_is_ordered_desc(): void
    {
        $old = Consultation::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id, 'vet_id' => $this->vet->id,
            'date' => now()->subMonth()->toDateString(), 'reason' => 'Vieja',
        ]);
        Consultation::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id, 'vet_id' => $this->vet->id,
            'date' => now()->toDateString(), 'reason' => 'Reciente',
        ]);

        $data = $this->getJson("/api/consultations?patient_id={$this->patient->id}")->assertOk()->json('data');
        $this->assertSame('Reciente', $data[0]['reason']);

        $this->deleteJson("/api/consultations/{$old->id}")->assertNoContent();
        $this->assertSoftDeleted('consultations', ['id' => $old->id]);
        $this->getJson("/api/consultations?patient_id={$this->patient->id}")->assertJsonCount(1, 'data');
    }
}
