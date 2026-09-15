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
 * S13 — Portal público "Agendar cita": disponibilidad real + cita
 * auto-confirmada (a diferencia de PublicAppointmentTest, que solo genera un
 * Lead). Horario fijo: 08:00-18:00, paso de 30 min, anticipación mínima 60 min
 * (ver config/scheduling.php).
 */
class PublicSchedulingTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Service $service;

    private Species $dog;

    private Breed $labrador;

    private Carbon $monday;

    protected function setUp(): void
    {
        parent::setUp();

        // "Hoy" siempre es un lunes 08:00 real (día hábil), sin depender de
        // cuándo se corre la suite.
        $this->monday = Carbon::now()->next(Carbon::MONDAY)->setTime(8, 0, 0);
        Carbon::setTestNow($this->monday);

        $this->company = Company::factory()->create(['name' => fake()->company()]);

        $this->service = Service::query()->create([
            'company_id' => $this->company->id,
            'name' => 'Consulta general',
            'estimated_duration_minutes' => 30,
            'price' => 50000,
            'status' => 'active',
        ]);

        $this->dog = Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);
        $this->labrador = Breed::create(['company_id' => $this->company->id, 'species_id' => $this->dog->id, 'name' => 'Labrador', 'status' => 'active']);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function vet(string $name = 'Dra. Vet'): User
    {
        Role::firstOrCreate(['name' => 'Veterinario/a', 'guard_name' => 'web']);
        $user = User::factory()->create(['company_id' => $this->company->id, 'name' => $name]);
        $user->assignRole('Veterinario/a');

        return $user;
    }

    private function bookingPayload(array $overrides = []): array
    {
        return array_merge([
            'service_id' => $this->service->id,
            'date' => $this->monday->toDateString(),
            'start_time' => '09:00',
            'species_id' => $this->dog->id,
            'breed_id' => $this->labrador->id,
            'pet_name' => 'Firulais',
            'name' => 'Ana Pérez',
            'email' => 'ana@example.com',
            'phone' => '3001234567',
            'consent' => true,
        ], $overrides);
    }

    public function test_lists_only_active_services_of_the_company(): void
    {
        Service::query()->create(['company_id' => $this->company->id, 'name' => 'Inactivo', 'status' => 'inactive']);
        Service::query()->create(['company_id' => Company::factory()->create(['name' => fake()->company()])->id, 'name' => 'Otra empresa', 'status' => 'active']);

        $res = $this->getJson('/api/public/appointments/services')->assertOk();

        $res->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $this->service->id);
    }

    public function test_lists_species_and_breeds(): void
    {
        $this->getJson('/api/public/appointments/species')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Perro']);

        $this->getJson("/api/public/appointments/species/{$this->dog->id}/breeds")
            ->assertOk()
            ->assertJsonFragment(['name' => 'Labrador']);
    }

    public function test_availability_without_any_practitioner_is_empty(): void
    {
        $res = $this->getJson('/api/public/appointments/availability?service_id='.$this->service->id.'&date='.$this->monday->toDateString())
            ->assertOk();

        $res->assertJsonPath('slots', []);
    }

    public function test_availability_respects_business_hours_and_minimum_notice(): void
    {
        $this->vet();

        $slots = $this->getJson('/api/public/appointments/availability?service_id='.$this->service->id.'&date='.$this->monday->toDateString())
            ->assertOk()->json('slots');

        // "Ahora" es 08:00 con 60 min de anticipación mínima -> el primer
        // hueco válido es 09:00, no 08:00.
        $this->assertNotContains('08:00', $slots);
        $this->assertContains('09:00', $slots);
        // El último hueco de 30 min tiene que terminar a las 18:00, no después.
        $this->assertContains('17:30', $slots);
        $this->assertNotContains('18:00', $slots);
    }

    public function test_availability_is_empty_on_a_closed_day(): void
    {
        $this->vet();
        $sunday = $this->monday->copy()->addDays(6)->toDateString();

        $res = $this->getJson('/api/public/appointments/availability?service_id='.$this->service->id.'&date='.$sunday)
            ->assertOk();

        $res->assertJsonPath('slots', []);
    }

    public function test_availability_excludes_a_slot_only_when_every_practitioner_is_busy(): void
    {
        $vetA = $this->vet('Dr. A');
        $vetB = $this->vet('Dr. B');

        Appointment::create([
            'company_id' => $this->company->id,
            'patient_id' => $this->existingPatient()->id,
            'service_id' => $this->service->id,
            'practitioner_id' => $vetA->id,
            'starts_at' => $this->monday->copy()->setTime(10, 0),
            'ends_at' => $this->monday->copy()->setTime(10, 30),
            'duration_minutes' => 30,
            'status' => 'confirmed',
        ]);

        // Solo el Dr. A está ocupado a las 10:00: el hueco sigue disponible
        // porque el Dr. B está libre.
        $slots = $this->getJson('/api/public/appointments/availability?service_id='.$this->service->id.'&date='.$this->monday->toDateString())
            ->assertOk()->json('slots');
        $this->assertContains('10:00', $slots);

        // Si también el Dr. B queda ocupado, el hueco desaparece.
        Appointment::create([
            'company_id' => $this->company->id,
            'patient_id' => $this->existingPatient()->id,
            'service_id' => $this->service->id,
            'practitioner_id' => $vetB->id,
            'starts_at' => $this->monday->copy()->setTime(10, 0),
            'ends_at' => $this->monday->copy()->setTime(10, 30),
            'duration_minutes' => 30,
            'status' => 'confirmed',
        ]);

        $slots = $this->getJson('/api/public/appointments/availability?service_id='.$this->service->id.'&date='.$this->monday->toDateString())
            ->assertOk()->json('slots');
        $this->assertNotContains('10:00', $slots);
    }

    private function existingPatient(): Patient
    {
        $client = Client::factory()->create(['company_id' => $this->company->id]);

        return Patient::query()->create([
            'company_id' => $this->company->id,
            'client_id' => $client->id,
            'species_id' => $this->dog->id,
            'name' => 'Relleno',
            'status' => 'active',
        ]);
    }

    public function test_book_creates_a_confirmed_appointment_with_new_client_and_patient(): void
    {
        $this->vet();

        $res = $this->postJson('/api/public/appointments/book', $this->bookingPayload())->assertCreated();

        $res->assertJsonPath('appointment.service', 'Consulta general');

        $appointment = Appointment::sole();
        $this->assertSame('confirmed', $appointment->status);
        $this->assertSame($this->monday->copy()->setTime(9, 0)->toDateTimeString(), $appointment->starts_at->toDateTimeString());

        $client = Client::where('email', 'ana@example.com')->firstOrFail();
        $this->assertSame('inactive', $client->status);
        $this->assertSame($client->id, $appointment->patient->client_id);
        $this->assertSame('Firulais', $appointment->patient->name);
        $this->assertSame($this->labrador->id, $appointment->patient->breed_id);
    }

    public function test_book_reuses_the_existing_client_and_patient_on_a_second_booking(): void
    {
        $this->vet();
        $this->vet('Dr. B');

        $this->postJson('/api/public/appointments/book', $this->bookingPayload())->assertCreated();
        $this->postJson('/api/public/appointments/book', $this->bookingPayload(['start_time' => '11:00']))->assertCreated();

        $this->assertSame(1, Client::where('email', 'ana@example.com')->count());
        $this->assertSame(1, Patient::where('name', 'Firulais')->count());
        $this->assertSame(2, Appointment::count());
    }

    public function test_book_rejects_a_slot_outside_business_hours(): void
    {
        $this->vet();

        $this->postJson('/api/public/appointments/book', $this->bookingPayload(['start_time' => '19:00']))
            ->assertStatus(422);

        $this->assertSame(0, Appointment::count());
    }

    public function test_book_rejects_a_slot_without_minimum_notice(): void
    {
        $this->vet();

        // "Ahora" son las 08:00: pedir las 08:15 no cumple la anticipación de 60 min.
        $this->postJson('/api/public/appointments/book', $this->bookingPayload(['start_time' => '08:15']))
            ->assertStatus(422);

        $this->assertSame(0, Appointment::count());
    }

    public function test_second_booking_of_the_same_slot_with_a_single_practitioner_is_rejected(): void
    {
        $this->vet();

        $this->postJson('/api/public/appointments/book', $this->bookingPayload())->assertCreated();

        $this->postJson('/api/public/appointments/book', $this->bookingPayload(['email' => 'otro@example.com']))
            ->assertStatus(409);

        $this->assertSame(1, Appointment::count());
    }

    public function test_book_consent_is_required(): void
    {
        $this->vet();

        $this->postJson('/api/public/appointments/book', $this->bookingPayload(['consent' => false]))
            ->assertStatus(422)->assertJsonValidationErrors('consent');
    }

    public function test_book_honeypot_silently_discards(): void
    {
        $this->vet();

        $this->postJson('/api/public/appointments/book', $this->bookingPayload(['company_website' => 'http://spam.example']))
            ->assertCreated();

        $this->assertSame(0, Appointment::count());
        $this->assertSame(0, Client::count());
    }

    public function test_book_is_throttled(): void
    {
        $this->vet();
        $this->vet('Dr. B');
        $this->vet('Dr. C');
        $this->vet('Dr. D');
        $this->vet('Dr. E');
        $this->vet('Dr. F');

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/public/appointments/book', $this->bookingPayload([
                'email' => "u{$i}@example.com",
                'start_time' => sprintf('%02d:00', 9 + $i),
            ]))->assertCreated();
        }

        $this->postJson('/api/public/appointments/book', $this->bookingPayload(['email' => 'u6@example.com', 'start_time' => '15:00']))
            ->assertStatus(429);
    }
}
