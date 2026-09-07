<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Deal;
use App\Models\Order;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CommercialReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_commercial_report_computes_funnel_win_rate_and_owner_rows(): void
    {
        $company = Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'reports.view', 'guard_name' => 'web']);
        $seller = User::factory()->create(['company_id' => $company->id, 'name' => 'Vendedor Uno']);
        $seller->givePermissionTo('reports.view');
        Sanctum::actingAs($seller, ['*']);

        $client = Client::factory()->create(['company_id' => $company->id]);
        Deal::factory()->create(['company_id' => $company->id, 'client_id' => $client->id, 'owner_id' => $seller->id, 'stage' => 'won', 'amount' => 1000]);
        Deal::factory()->create(['company_id' => $company->id, 'client_id' => $client->id, 'owner_id' => $seller->id, 'stage' => 'won', 'amount' => 500]);
        Deal::factory()->create(['company_id' => $company->id, 'client_id' => $client->id, 'owner_id' => $seller->id, 'stage' => 'lost']);
        Deal::factory()->create(['company_id' => $company->id, 'client_id' => $client->id, 'owner_id' => $seller->id, 'stage' => 'prospecting']);

        $res = $this->getJson('/api/reports/commercial')->assertOk();

        $res->assertJsonPath('win_rate', 66.7); // 2 won / (2 won + 1 lost)
        $res->assertJsonPath('by_owner.0.owner', 'Vendedor Uno');
        $res->assertJsonPath('by_owner.0.won_deals', 2);
        $res->assertJsonPath('by_owner.0.won_value', 1500);
    }

    public function test_new_deal_is_owned_by_the_creator_by_default(): void
    {
        $company = Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'deals.manage', 'guard_name' => 'web']);
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->givePermissionTo('deals.manage');
        Sanctum::actingAs($user, ['*']);
        $client = Client::factory()->create(['company_id' => $company->id]);

        $this->postJson('/api/deals', [
            'client_id' => $client->id, 'title' => 'Nuevo', 'amount' => 100, 'stage' => 'prospecting',
        ])->assertCreated()->assertJsonPath('data.owner', $user->name);
    }

    public function test_general_report_revenue_month_includes_orders_updated_today(): void
    {
        $company = Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'reports.view', 'guard_name' => 'web']);
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->givePermissionTo('reports.view');
        Sanctum::actingAs($user, ['*']);

        // Confirmed order touched right now — must land inside "this month".
        $client = Client::factory()->create(['company_id' => $company->id]);
        $warehouse = Warehouse::factory()->create(['company_id' => $company->id]);
        Order::factory()->create([
            'company_id' => $company->id,
            'client_id' => $client->id,
            'warehouse_id' => $warehouse->id,
            'status' => 'confirmed',
            'total' => 1500,
        ]);

        $this->getJson('/api/reports')->assertOk()
            ->assertJsonPath('sales.orders_month', 1)
            ->assertJsonPath('sales.revenue_month', 1500);
    }

    public function test_report_requires_permission(): void
    {
        $company = Company::factory()->create(['name' => 'Test SA']);
        $user = User::factory()->create(['company_id' => $company->id]);
        Sanctum::actingAs($user, ['*']);
        $this->getJson('/api/reports/commercial')->assertForbidden();
    }
}
