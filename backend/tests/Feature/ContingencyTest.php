<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ContingencyTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create(['name' => 'Test SA']);

        Permission::firstOrCreate(['name' => 'settings.manage', 'guard_name' => 'web']);
    }

    private function login(array $permissions = []): User
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo($permissions);
        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    public function test_status_is_readable_by_any_authenticated_user(): void
    {
        $this->login([]);

        $this->getJson('/api/contingency/status')
            ->assertOk()
            ->assertJsonPath('active', false)
            ->assertJsonPath('modules', []);
    }

    public function test_activate_requires_settings_manage(): void
    {
        $this->login([]);

        $this->postJson('/api/contingency/activate', ['enabled_modules' => ['clients']])
            ->assertForbidden();
    }

    /**
     * El pivote a CRM + Inventario dejo el registro de modulos elegibles
     * vacio (ver ContingencyModuleRegistry) hasta que se diseñe un flujo de
     * escritura offline propio para esos dominios: cualquier modulo pedido
     * hoy es invalido por definicion.
     */
    public function test_activate_rejects_any_module_while_registry_is_empty(): void
    {
        $this->login(['settings.manage']);

        $this->postJson('/api/contingency/activate', ['enabled_modules' => ['clients']])
            ->assertStatus(422);
    }

    public function test_deactivate_without_active_session_returns_409(): void
    {
        $this->login(['settings.manage']);

        $this->postJson('/api/contingency/deactivate')->assertStatus(409);
    }
}
