<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\ClientNote;
use App\Models\Company;
use App\Models\Deal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ClientHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_history_aggregates_related_records(): void
    {
        $company = Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'clients.manage', 'guard_name' => 'web']);
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->givePermissionTo('clients.manage');
        Sanctum::actingAs($user, ['*']);

        $client = Client::factory()->create(['company_id' => $company->id]);
        Deal::factory()->count(2)->create(['company_id' => $company->id, 'client_id' => $client->id]);
        ClientNote::create(['company_id' => $company->id, 'client_id' => $client->id, 'body' => 'Nota', 'user_id' => $user->id]);

        $this->getJson("/api/clients/{$client->id}/history")
            ->assertOk()
            ->assertJsonPath('client.id', $client->id)
            ->assertJsonCount(2, 'deals')
            ->assertJsonCount(1, 'notes')
            ->assertJsonCount(0, 'orders');
    }

    public function test_history_of_another_companys_client_is_not_found(): void
    {
        $company = Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'clients.manage', 'guard_name' => 'web']);
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->givePermissionTo('clients.manage');
        Sanctum::actingAs($user, ['*']);

        $foreign = Client::factory()->create(['company_id' => Company::factory()->create(['name' => 'Otra'])->id]);

        $this->getJson("/api/clients/{$foreign->id}/history")->assertNotFound();
    }
}
