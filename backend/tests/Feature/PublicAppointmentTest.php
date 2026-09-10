<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Company;
use App\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * S9 — Portal público "Solicitá tu cita". Solo genera un Lead; recepción agenda.
 */
class PublicAppointmentTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => fake()->company()]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Ana Pérez',
            'email' => 'ana@example.com',
            'phone' => '3001234567',
            'pet_name' => 'Michi',
            'reason' => 'Vacunación',
            'preferred_date' => 'martes por la tarde',
            'consent' => true,
        ], $overrides);
    }

    public function test_creates_a_lead_and_no_appointment(): void
    {
        $this->postJson('/api/public/appointments', $this->payload())
            ->assertOk()
            ->assertJsonPath('message', fn ($m) => str_contains($m, 'confirmará disponibilidad'));

        $lead = Lead::where('email', 'ana@example.com')->firstOrFail();
        $this->assertSame('appointment', $lead->source);
        $this->assertSame($this->company->id, $lead->company_id);
        $this->assertStringContainsString('Michi', (string) $lead->message);

        $this->assertSame(0, Appointment::count());
    }

    public function test_two_real_requests_from_one_email_create_two_leads(): void
    {
        $this->postJson('/api/public/appointments', $this->payload())->assertOk();
        // Dentro de la ventana anti-doble-click: no duplica.
        $this->postJson('/api/public/appointments', $this->payload())->assertOk();
        $this->assertSame(1, Lead::where('email', 'ana@example.com')->count());

        // Semanas después vuelve a pedir cita: es una solicitud nueva.
        $this->travel(8)->minutes();
        $this->postJson('/api/public/appointments', $this->payload(['pet_name' => 'Otro']))->assertOk();
        $this->assertSame(2, Lead::where('email', 'ana@example.com')->count());
    }

    public function test_honeypot_silently_discards(): void
    {
        $this->postJson('/api/public/appointments', $this->payload(['company_website' => 'http://spam.example']))
            ->assertOk();

        $this->assertSame(0, Lead::count());
    }

    public function test_consent_is_required(): void
    {
        $this->postJson('/api/public/appointments', $this->payload(['consent' => false]))
            ->assertStatus(422)->assertJsonValidationErrors('consent');
    }

    public function test_is_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/public/appointments', $this->payload(['email' => "u{$i}@example.com"]))->assertOk();
        }
        $this->postJson('/api/public/appointments', $this->payload(['email' => 'u6@example.com']))->assertStatus(429);
    }

    public function test_with_no_company_configured_fails_hard(): void
    {
        Company::query()->delete();

        $this->postJson('/api/public/appointments', $this->payload())->assertStatus(500);
    }
}
