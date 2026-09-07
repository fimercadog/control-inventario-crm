<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * AUD-01: ninguna respuesta de error de la API debe exponer stack traces,
 * rutas del disco, el usuario del SO ni clases internas del framework —
 * ni siquiera con APP_DEBUG=true.
 */
class DebugInfoLeakTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // El peor caso: depuracion encendida. La red de seguridad debe saltar igual.
        config(['app.debug' => true]);
    }

    private function assertNoDebugLeak(TestResponse $response): void
    {
        $json = $response->json();
        $this->assertArrayNotHasKey('trace', $json);
        $this->assertArrayNotHasKey('exception', $json);
        $this->assertArrayNotHasKey('file', $json);
        $this->assertArrayNotHasKey('line', $json);

        $body = $response->getContent();
        $this->assertStringNotContainsString('Illuminate\\', $body);
        $this->assertStringNotContainsString('vendor', $body);
        $this->assertStringNotContainsString(get_current_user(), $body);
    }

    public function test_unhandled_exception_returns_generic_500(): void
    {
        Route::middleware('api')->get('/api/_leak_probe', function () {
            throw new \RuntimeException(
                'Detalle interno: '.base_path('app/Secreto.php').' usuario '.get_current_user()
            );
        });

        $response = $this->getJson('/api/_leak_probe');

        $response->assertStatus(500)->assertExactJson(['message' => 'Error interno del servidor.']);
        $this->assertNoDebugLeak($response);
    }

    /** El saneo no debe aplastar un 5xx deliberado (503 mantenimiento) a un 500 pelado. */
    public function test_deliberate_503_keeps_its_status_and_retry_after(): void
    {
        Route::middleware('api')->get('/api/_down_probe', fn () => abort(503, 'En mantenimiento', ['Retry-After' => 120]));

        $response = $this->getJson('/api/_down_probe');

        $response->assertStatus(503)->assertHeader('Retry-After', 120);
        $this->assertSame('Error interno del servidor.', $response->json('message'));
        $this->assertNoDebugLeak($response);
    }

    public function test_forbidden_response_carries_no_trace(): void
    {
        Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'clients.manage', 'guard_name' => 'web']);
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $response = $this->getJson('/api/clients'); // sin el permiso

        $response->assertForbidden();
        $this->assertNoDebugLeak($response);
    }

    public function test_route_model_binding_miss_returns_generic_404(): void
    {
        Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'deals.manage', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->givePermissionTo('deals.manage');
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/deals/999999');

        $response->assertStatus(404);
        $this->assertNoDebugLeak($response);
    }
}
