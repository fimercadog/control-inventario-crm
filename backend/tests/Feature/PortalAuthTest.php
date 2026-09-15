<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Notifications\ClientMagicLinkNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * S14 — Portal del dueño: login sin password, por enlace mágico firmado
 * (guard `client`, separado del panel de staff en `auth:sanctum`).
 */
class PortalAuthTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Client $client;

    /** Origin de un dominio stateful: sin esto, `session()` revienta con
     *  "Session store not set on request" (EnsureFrontendRequestsAreStateful
     *  no arranca sesión para un request que no parece venir del frontend). */
    private array $frontendHeaders = ['Origin' => 'http://localhost:3000'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => fake()->company()]);
        $this->client = Client::factory()->create(['company_id' => $this->company->id, 'email' => 'dueno@example.com']);
    }

    public function test_request_link_notifies_the_matching_client(): void
    {
        Notification::fake();

        $this->postJson('/api/portal/login', ['email' => 'dueno@example.com'])
            ->assertOk()
            ->assertJsonPath('message', fn ($m) => str_contains($m, 'está registrado'));

        Notification::assertSentTo($this->client, ClientMagicLinkNotification::class);
    }

    public function test_request_link_gives_the_same_response_for_an_unknown_email(): void
    {
        Notification::fake();

        $this->postJson('/api/portal/login', ['email' => 'no-existe@example.com'])
            ->assertOk()
            ->assertJsonPath('message', fn ($m) => str_contains($m, 'está registrado'));

        Notification::assertNothingSent();
    }

    public function test_request_link_honeypot_silently_discards(): void
    {
        Notification::fake();

        $this->postJson('/api/portal/login', ['email' => 'dueno@example.com', 'company_website' => 'http://spam.example'])
            ->assertOk();

        Notification::assertNothingSent();
    }

    public function test_request_link_is_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/portal/login', ['email' => "u{$i}@example.com"])->assertOk();
        }

        $this->postJson('/api/portal/login', ['email' => 'u6@example.com'])->assertStatus(429);
    }

    public function test_consuming_a_valid_link_logs_in(): void
    {
        $url = URL::temporarySignedRoute('portal.consume', now()->addMinutes(15), ['client' => $this->client->id]);

        $this->withHeaders($this->frontendHeaders)->getJson($url)->assertOk();

        $this->assertAuthenticatedAs($this->client, 'client');
    }

    public function test_consume_rejects_a_tampered_link(): void
    {
        $url = URL::temporarySignedRoute('portal.consume', now()->addMinutes(15), ['client' => $this->client->id]);

        $this->withHeaders($this->frontendHeaders)->getJson($url.'&tampered=1')->assertForbidden();
        $this->assertGuest('client');
    }

    public function test_consume_rejects_an_expired_link(): void
    {
        $url = URL::temporarySignedRoute('portal.consume', now()->addMinutes(15), ['client' => $this->client->id]);

        $this->travel(16)->minutes();

        $this->withHeaders($this->frontendHeaders)->getJson($url)->assertForbidden();
        $this->assertGuest('client');
    }

    public function test_consume_rejects_a_client_from_another_company(): void
    {
        $otherCompany = Company::factory()->create(['name' => fake()->company()]);
        $otherClient = Client::factory()->create(['company_id' => $otherCompany->id]);

        // Sin usuario autenticado, companyId() resuelve a la primera empresa
        // (single-tenant): pedir el enlace del cliente de la SEGUNDA empresa
        // tiene que ser rechazado por el chequeo de pertenencia.
        $url = URL::temporarySignedRoute('portal.consume', now()->addMinutes(15), ['client' => $otherClient->id]);

        $this->withHeaders($this->frontendHeaders)->getJson($url)->assertForbidden();
        $this->assertGuest('client');
    }

    public function test_me_requires_the_client_guard(): void
    {
        $this->getJson('/api/portal/me')->assertUnauthorized();
    }

    public function test_me_returns_the_logged_in_client(): void
    {
        $this->actingAs($this->client, 'client')
            ->getJson('/api/portal/me')
            ->assertOk()
            ->assertJsonPath('client.email', 'dueno@example.com');
    }

    public function test_logout_clears_the_session(): void
    {
        $this->withHeaders($this->frontendHeaders)
            ->actingAs($this->client, 'client')
            ->postJson('/api/portal/logout')
            ->assertNoContent();

        $this->getJson('/api/portal/me')->assertUnauthorized();
    }
}
