<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\User;
use App\Services\LogSanitizer;
use App\Services\SupportPayloadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class TechnicalLoggingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware(['api', \App\Http\Middleware\RequestIdMiddleware::class])->group(function () {
            Route::get('/api/test-403', function () {
                abort(403, 'Acceso restringido de prueba.');
            });

            Route::get('/api/test-500', function () {
                throw new \RuntimeException('Error simulado en backend');
            });
        });
    }

    public function test_generates_and_returns_x_request_id_header(): void
    {
        $response = $this->getJson('/api/up');

        $response->assertHeader('X-Request-ID');
        $requestId = $response->headers->get('X-Request-ID');

        $this->assertNotEmpty($requestId);
        $this->assertMatchesRegularExpression('/^[a-zA-Z0-9\-_]{8,64}$/', $requestId);
    }

    public function test_reuses_existing_valid_x_request_id_from_client(): void
    {
        $customId = 'req-custom-client-uuid-12345678';

        $response = $this->withHeaders(['X-Request-ID' => $customId])
            ->getJson('/api/up');

        $response->assertHeader('X-Request-ID', $customId);
    }

    public function test_replaces_invalid_x_request_id_with_new_uuid(): void
    {
        $invalidId = '<script>alert(1)</script>';

        $response = $this->withHeaders(['X-Request-ID' => $invalidId])
            ->getJson('/api/up');

        $requestId = $response->headers->get('X-Request-ID');

        $this->assertNotEquals($invalidId, $requestId);
        $this->assertMatchesRegularExpression('/^[a-zA-Z0-9\-_]{8,64}$/', $requestId);
    }

    public function test_logs_failed_login_with_masked_email_and_no_passwords(): void
    {
        Log::spy();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'medico@esteticaelite.co',
            'password' => 'wrong-password-123',
        ]);

        $response->assertStatus(422);

        Log::shouldHaveReceived('warning')
            ->once()
            ->with('Fallo de inicio de sesión', \Mockery::on(function ($context) {
                return isset($context['request_id'])
                    && $context['email_masked'] === 'm***@esteticaelite.co'
                    && ! str_contains(json_encode($context), 'wrong-password-123');
            }));
    }

    public function test_logs_403_forbidden_event_with_request_id(): void
    {
        Log::spy();

        $response = $this->getJson('/api/test-403');

        $response->assertStatus(403);

        Log::shouldHaveReceived('warning')
            ->once()
            ->with('Acceso denegado (403)', \Mockery::on(function ($context) {
                return isset($context['request_id']) && $context['path'] === 'api/test-403';
            }));
    }

    public function test_logs_500_internal_error_with_request_id_and_sanitized_trace(): void
    {
        Log::spy();

        $response = $this->getJson('/api/test-500');

        $response->assertStatus(500);

        Log::shouldHaveReceived('error')
            ->once()
            ->with('Error interno no controlado (500)', \Mockery::on(function ($context) {
                return isset($context['request_id'])
                    && $context['exception_class'] === 'RuntimeException'
                    && $context['exception_message'] === 'Error simulado en backend'
                    && isset($context['trace_summary']);
            }));
    }

    public function test_log_sanitizer_recursively_redacts_nested_sensitive_keys(): void
    {
        $sanitizer = new LogSanitizer;

        $rawInput = [
            'user' => [
                'name' => 'Sofía Mercado',
                'password' => 'secret123',
                'credentials' => [
                    'auth_token' => 'bearer-xyz',
                    'credit_card' => '4111-2222-3333-4444',
                ],
            ],
            'public_info' => 'OK',
        ];

        $sanitized = $sanitizer->sanitize($rawInput);

        $this->assertEquals('Sofía Mercado', $sanitized['user']['name']);
        $this->assertEquals('[REDACTED]', $sanitized['user']['password']);
        $this->assertEquals('[REDACTED]', $sanitized['user']['credentials']['auth_token']);
        $this->assertEquals('[REDACTED]', $sanitized['user']['credentials']['credit_card']);
        $this->assertEquals('OK', $sanitized['public_info']);
    }

    public function test_support_payload_service_builds_decoupled_ticket_structure(): void
    {
        $company = Company::firstOrCreate(['name' => 'Clínica Élite'], ['nit' => '900.123.456-7']);
        $user = User::create([
            'company_id' => $company->id,
            'name' => 'Admin Test',
            'email' => 'admin@esteticaelite.co',
            'password' => '$2y$12$abcdefg',
        ]);

        $service = new SupportPayloadService;
        $request = \Illuminate\Http\Request::create('/api/app/dashboard', 'GET');
        $request->headers->set('X-Request-ID', 'req-support-test-999');
        $request->setUserResolver(fn () => $user);

        $payload = $service->buildPayload($request, 'Problema al cargar reporte', ['section' => 'finance']);

        $this->assertEquals('req-support-test-999', $payload['request_id']);
        $this->assertEquals('a***@esteticaelite.co', $payload['user']['email']);
        $this->assertEquals($company->id, $payload['company']['id']);
        $this->assertEquals('Problema al cargar reporte', $payload['feedback_message']);
        $this->assertEquals('finance', $payload['meta']['section']);
    }

    public function test_business_audit_log_continues_functioning(): void
    {
        $company = Company::firstOrCreate(['name' => 'Clínica Élite Audit'], ['nit' => '900.123.456-8']);
        $user = User::create([
            'company_id' => $company->id,
            'name' => 'Audit User',
            'email' => 'audit@esteticaelite.co',
            'password' => '$2y$12$abcdefg',
        ]);

        $auditLog = AuditLog::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'action' => 'update',
            'module' => 'company',
            'entity' => Company::class,
            'entity_id' => $company->id,
            'old_values' => ['name' => 'Old Name'],
            'new_values' => ['name' => 'New Name'],
            'ip_address' => '127.0.0.1',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'id' => $auditLog->id,
            'action' => 'update',
            'module' => 'company',
        ]);
    }
}
