<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * El header Origin de un dominio stateful hace que Sanctum arranque la
     * sesion por cookie (si no, `postJson` no lleva sesion y el login/logout
     * revientan con "Session store not set on request").
     */
    private array $frontendHeaders = ['Origin' => 'http://localhost:3000'];

    private function makeUser(): User
    {
        Company::factory()->create(['name' => 'Test SA']);

        return User::factory()->create([
            'email' => 'user@andescomercial.co',
            'password' => Hash::make('secret-pass-123'),
            'status' => 'active',
        ]);
    }

    private function login(): void
    {
        $this->withHeaders($this->frontendHeaders)
            ->postJson('/api/auth/login', ['email' => 'user@andescomercial.co', 'password' => 'secret-pass-123'])
            ->assertOk();
    }

    public function test_forgot_password_response_does_not_reveal_whether_email_exists(): void
    {
        Notification::fake();
        User::factory()->create(['email' => 'real@andespeople.co', 'status' => 'active']);

        $known = $this->postJson('/api/auth/forgot-password', ['email' => 'real@andespeople.co']);
        $unknown = $this->postJson('/api/auth/forgot-password', ['email' => 'nope@nowhere.co']);

        $known->assertOk();
        $unknown->assertOk();
        $this->assertSame($known->json('message'), $unknown->json('message'));
    }

    public function test_login_is_rate_limited_after_repeated_failures(): void
    {
        $payload = ['email' => 'real@andespeople.co', 'password' => 'wrong'];

        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/auth/login', $payload);
        }

        $this->postJson('/api/auth/login', $payload)->assertStatus(429);
    }

    public function test_security_headers_are_present(): void
    {
        $this->getJson('/api/auth/me')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
    }

    public function test_unknown_api_route_returns_generic_404(): void
    {
        $this->getJson('/api/ruta-que-no-existe')
            ->assertStatus(404)
            ->assertExactJson(['message' => 'Recurso no encontrado.']);
    }

    /** AUD-10: al autenticarse la sesion se regenera (anti fijacion de sesion). */
    public function test_login_regenerates_the_session_id(): void
    {
        $this->makeUser();
        $this->withSession(['probe' => 'pre-login']);
        $before = $this->app['session']->getId();

        $this->login();

        $this->assertNotSame($before, $this->app['session']->getId());
    }

    /** AUD-10: logout invalida la sesion (cambia el id y limpia los datos). */
    public function test_logout_invalidates_the_session(): void
    {
        $this->makeUser();
        $this->login();
        $idWhileLoggedIn = $this->app['session']->getId();

        $this->withHeaders($this->frontendHeaders)->postJson('/api/auth/logout')->assertNoContent();

        $this->assertNotSame($idWhileLoggedIn, $this->app['session']->getId());
    }

    /**
     * AUD-10: una sesion ya invalidada por logout no puede reutilizarse. Se
     * olvidan los guards en memoria para modelar una peticion nueva (en un
     * servidor real cada request es un proceso limpio sin auth memoizada).
     */
    public function test_an_invalidated_session_cannot_be_reused(): void
    {
        $this->makeUser();
        $this->login();
        $capturedSessionId = $this->app['session']->getId();
        $cookieName = config('session.cookie');

        // Control positivo: con esa misma cookie, sin logout, la sesion sirve.
        $this->app['auth']->forgetGuards();
        $this->withHeaders($this->frontendHeaders)
            ->withUnencryptedCookie($cookieName, $capturedSessionId)
            ->getJson('/api/auth/me')
            ->assertOk();

        $this->withHeaders($this->frontendHeaders)->postJson('/api/auth/logout')->assertNoContent();

        // Tras el logout, replayear la cookie vieja ya no autentica.
        $this->app['auth']->forgetGuards();
        $this->withHeaders($this->frontendHeaders)
            ->withUnencryptedCookie($cookieName, $capturedSessionId)
            ->getJson('/api/auth/me')
            ->assertUnauthorized();
    }
}
