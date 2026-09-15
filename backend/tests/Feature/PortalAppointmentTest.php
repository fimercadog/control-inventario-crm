<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Breed;
use App\Models\Client;
use App\Models\Company;
use App\Models\Patient;
use App\Models\Service;
use App\Models\Species;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * S14 — CRUD del dueño sobre sus propias citas (portal, guard `client`).
 */
class PortalAppointmentTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Client $owner;

    private Patient $patient;

    private Service $service;

    private User $vet;

    private Carbon $monday;

    protected function setUp(): void
    {
        parent::setUp();

        $this->monday = Carbon::now()->next(Carbon::MONDAY)->setTime(8, 0, 0);
        Carbon::setTestNow($this->monday);

        $this->company = Company::factory()->create(['name' => fake()->company()]);
        $this->owner = Client::factory()->create(['company_id' => $this->company->id, 'email' => 'dueno@example.com']);

        $dog = Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);
        Breed::create(['company_id' => $this->company->id, 'species_id' => $dog->id, 'name' => 'Labrador', 'status' => 'active']);
        $this->patient = Patient::query()->create([
            'company_id' => $this->company->id,
            'client_id' => $this->owner->id,
            'species_id' => $dog->id,
            'name' => 'Firulais',
            'status' => 'active',
        ]);

        $this->service = Service::query()->create([
            'company_id' => $this->company->id,
            'name' => 'Consulta general',
            'estimated_duration_minutes' => 30,
            'price' => 50000,
            'status' => 'active',
        ]);

        Role::firstOrCreate(['name' => 'Veterinario/a', 'guard_name' => 'web']);
        $this->vet = User::factory()->create(['company_id' => $this->company->id, 'name' => 'Dra. Vet']);
        $this->vet->assignRole('Veterinario/a');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function appointmentAt(Patient $patient, Carbon $start, string $status = 'confirmed'): Appointment
    {
        return Appointment::create([
            'company_id' => $this->company->id,
            'patient_id' => $patient->id,
            'service_id' => $this->service->id,
            'practitioner_id' => $this->vet->id,
            'starts_at' => $start,
            'ends_at' => $start->copy()->addMinutes(30),
            'duration_minutes' => 30,
            'status' => $status,
        ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/portal/appointments')->assertUnauthorized();
    }

    public function test_index_lists_only_the_owners_own_appointments(): void
    {
        $mine = $this->appointmentAt($this->patient, $this->monday->copy()->setTime(10, 0));

        $otherOwner = Client::factory()->create(['company_id' => $this->company->id]);
        $otherPatient = Patient::query()->create([
            'company_id' => $this->company->id, 'client_id' => $otherOwner->id,
            'species_id' => $this->patient->species_id, 'name' => 'Otro', 'status' => 'active',
        ]);
        $this->appointmentAt($otherPatient, $this->monday->copy()->setTime(11, 0));

        $res = $this->actingAs($this->owner, 'client')->getJson('/api/portal/appointments')->assertOk();

        $res->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $mine->id);
    }

    public function test_reschedule_moves_the_appointment_to_a_free_slot(): void
    {
        $appointment = $this->appointmentAt($this->patient, $this->monday->copy()->setTime(10, 0));

        $this->actingAs($this->owner, 'client')
            ->patchJson("/api/portal/appointments/{$appointment->id}/reschedule", [
                'date' => $this->monday->toDateString(),
                'start_time' => '14:00',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $appointment->refresh();
        $this->assertSame($this->monday->copy()->setTime(14, 0)->toDateTimeString(), $appointment->starts_at->toDateTimeString());

        // Regresión: `$request->user()` en una ruta `auth:client` resuelve al
        // Client, no a un User -- AuditService no debe escribir ese id en
        // `audit_logs.user_id` (FK a `users`, revienta con el Client real).
        $this->assertDatabaseHas('audit_logs', [
            'entity' => Appointment::class,
            'entity_id' => $appointment->id,
            'action' => 'updated',
            'user_id' => null,
        ]);
    }

    public function test_reschedule_rejects_a_slot_outside_business_hours(): void
    {
        $appointment = $this->appointmentAt($this->patient, $this->monday->copy()->setTime(10, 0));

        $this->actingAs($this->owner, 'client')
            ->patchJson("/api/portal/appointments/{$appointment->id}/reschedule", [
                'date' => $this->monday->toDateString(),
                'start_time' => '19:00',
            ])
            ->assertStatus(422);

        $this->assertSame(10, $appointment->fresh()->starts_at->hour);
    }

    public function test_reschedule_to_the_same_slot_another_owner_already_holds_is_rejected(): void
    {
        // Un solo veterinario en la empresa: si ya está ocupado a las 15:00,
        // no hay a quién asignarle la cita reagendada -> 409.
        $otherOwner = Client::factory()->create(['company_id' => $this->company->id]);
        $otherPatient = Patient::query()->create([
            'company_id' => $this->company->id, 'client_id' => $otherOwner->id,
            'species_id' => $this->patient->species_id, 'name' => 'Otro', 'status' => 'active',
        ]);
        $this->appointmentAt($otherPatient, $this->monday->copy()->setTime(15, 0));

        $mine = $this->appointmentAt($this->patient, $this->monday->copy()->setTime(10, 0));

        $this->actingAs($this->owner, 'client')
            ->patchJson("/api/portal/appointments/{$mine->id}/reschedule", [
                'date' => $this->monday->toDateString(),
                'start_time' => '15:00',
            ])
            ->assertStatus(409);
    }

    public function test_reschedule_a_cancelled_appointment_is_rejected(): void
    {
        $appointment = $this->appointmentAt($this->patient, $this->monday->copy()->setTime(10, 0), status: 'cancelled');

        $this->actingAs($this->owner, 'client')
            ->patchJson("/api/portal/appointments/{$appointment->id}/reschedule", [
                'date' => $this->monday->toDateString(),
                'start_time' => '14:00',
            ])
            ->assertStatus(422);
    }

    public function test_reschedule_of_someone_elses_appointment_is_not_found(): void
    {
        $otherOwner = Client::factory()->create(['company_id' => $this->company->id]);
        $otherPatient = Patient::query()->create([
            'company_id' => $this->company->id, 'client_id' => $otherOwner->id,
            'species_id' => $this->patient->species_id, 'name' => 'Otro', 'status' => 'active',
        ]);
        $theirs = $this->appointmentAt($otherPatient, $this->monday->copy()->setTime(10, 0));

        $this->actingAs($this->owner, 'client')
            ->patchJson("/api/portal/appointments/{$theirs->id}/reschedule", [
                'date' => $this->monday->toDateString(),
                'start_time' => '14:00',
            ])
            ->assertNotFound();
    }

    public function test_cancel_moves_status_to_cancelled(): void
    {
        $appointment = $this->appointmentAt($this->patient, $this->monday->copy()->setTime(10, 0));

        $this->actingAs($this->owner, 'client')
            ->postJson("/api/portal/appointments/{$appointment->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertSame('cancelled', $appointment->fresh()->status);
        $this->assertDatabaseHas('audit_logs', [
            'entity' => Appointment::class,
            'entity_id' => $appointment->id,
            'action' => 'updated',
            'user_id' => null,
        ]);
    }

    public function test_cancel_of_someone_elses_appointment_is_not_found(): void
    {
        $otherOwner = Client::factory()->create(['company_id' => $this->company->id]);
        $otherPatient = Patient::query()->create([
            'company_id' => $this->company->id, 'client_id' => $otherOwner->id,
            'species_id' => $this->patient->species_id, 'name' => 'Otro', 'status' => 'active',
        ]);
        $theirs = $this->appointmentAt($otherPatient, $this->monday->copy()->setTime(10, 0));

        $this->actingAs($this->owner, 'client')
            ->postJson("/api/portal/appointments/{$theirs->id}/cancel")
            ->assertNotFound();

        $this->assertSame('confirmed', $theirs->fresh()->status);
    }

    public function test_cancel_an_already_cancelled_appointment_is_rejected(): void
    {
        $appointment = $this->appointmentAt($this->patient, $this->monday->copy()->setTime(10, 0), status: 'cancelled');

        $this->actingAs($this->owner, 'client')
            ->postJson("/api/portal/appointments/{$appointment->id}/cancel")
            ->assertStatus(422);
    }
}
