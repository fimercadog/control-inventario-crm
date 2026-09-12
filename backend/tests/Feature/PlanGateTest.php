<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * FASE 8 del brief low-ticket: un modulo oculto en el frontend tiene que
 * seguir bloqueado en la API aunque el usuario tenga el permiso Spatie del
 * recurso — el plan es un segundo gate, independiente de los permisos.
 */
class PlanGateTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create(['name' => 'Test SA']);

        foreach (['deals.manage', 'suppliers.manage', 'clients.manage', 'products.manage', 'orders.manage'] as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
    }

    private function loginWith(array $permissions): User
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo($permissions);
        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    public function test_pro_module_is_blocked_on_low_ticket_plan_even_with_permission(): void
    {
        config(['plan.tier' => 'low_ticket']);
        $this->loginWith(['deals.manage']);

        $this->getJson('/api/deals')->assertForbidden();
    }

    public function test_core_low_ticket_modules_stay_open_on_low_ticket_plan(): void
    {
        config(['plan.tier' => 'low_ticket']);
        $this->loginWith(['clients.manage', 'products.manage', 'orders.manage']);

        $this->getJson('/api/clients')->assertOk();
        $this->getJson('/api/products')->assertOk();
        $this->getJson('/api/orders')->assertOk();
    }

    public function test_export_of_a_pro_resource_is_blocked_on_low_ticket_plan(): void
    {
        config(['plan.tier' => 'low_ticket']);
        $this->loginWith(['suppliers.manage']);

        $this->get('/api/exports/suppliers.csv')->assertForbidden();
    }

    public function test_full_plan_tier_reopens_the_pro_module(): void
    {
        config(['plan.tier' => 'premium']);
        $this->loginWith(['deals.manage']);

        $this->getJson('/api/deals')->assertOk();
    }
}
