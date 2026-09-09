<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CrmContactsNotesTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private User $user;

    private Client $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'clients.manage', 'guard_name' => 'web']);
        $this->user = User::factory()->create(['company_id' => $this->company->id, 'name' => 'Ana Vendedora']);
        $this->user->givePermissionTo('clients.manage');
        Sanctum::actingAs($this->user, ['*']);
        $this->client = Client::factory()->create(['company_id' => $this->company->id, 'name' => 'Constructora Alfa']);
    }

    public function test_creates_a_contact_linked_to_a_client(): void
    {
        $this->postJson('/api/contacts', [
            'name' => 'Laura Gutierrez', 'role' => 'Compras', 'client_id' => $this->client->id,
            'email' => 'laura@alfa.co', 'status' => 'active',
        ])->assertCreated();

        $this->getJson('/api/contacts')
            ->assertOk()
            ->assertJsonPath('data.0.client', 'Constructora Alfa');
    }

    public function test_contact_with_foreign_client_is_rejected(): void
    {
        $otherCompany = Company::factory()->create(['name' => 'Otra SA']);
        $other = Client::factory()->create(['company_id' => $otherCompany->id]);
        $this->postJson('/api/contacts', ['name' => 'X', 'status' => 'active', 'client_id' => $other->id])
            ->assertStatus(422)->assertJsonValidationErrors(['client_id']);
    }

    public function test_client_note_records_the_author_and_is_create_only(): void
    {
        $this->postJson('/api/client-notes', ['client_id' => $this->client->id, 'body' => 'Pidio cotizacion.'])
            ->assertCreated()
            ->assertJsonPath('data.author', 'Ana Vendedora');

        $this->getJson('/api/client-notes')->assertOk()->assertJsonPath('data.0.body', 'Pidio cotizacion.');
    }
}
