<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'dashboard.view', 'guard_name' => 'web']);
    }

    public function test_requires_dashboard_view_permission(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['*']);
        $this->getJson('/api/dashboard')->assertForbidden();
    }

    public function test_returns_the_expected_shape(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('dashboard.view');
        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'generated_at',
                'metrics' => ['total_clients', 'total_products', 'pending_quotes', 'open_deals', 'open_deals_value', 'deals_won_month', 'low_stock_products', 'pending_purchase_orders', 'orders_confirmed_month', 'revenue_month'],
                'deltas' => ['revenue' => ['current', 'previous', 'pct'], 'deals_won'],
                'deals_by_stage',
                'top_products',
                'trends' => ['revenue_monthly', 'deals_monthly'],
                'low_stock_alerts',
                'recent_activity',
            ])
            ->assertJsonCount(12, 'trends.revenue_monthly');
    }
}
