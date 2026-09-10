<?php

namespace Tests\Feature;

use App\Models\Breed;
use App\Models\Client;
use App\Models\Company;
use App\Models\Patient;
use App\Models\Species;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * S3 — Pacientes / Mascotas. `client_id` = propietario (RESTRICT), soft-delete.
 */
class PatientTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Client $owner;

    private Species $dog;

    private Breed $labrador;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => fake()->company()]);
        Permission::firstOrCreate(['name' => 'patients.manage', 'guard_name' => 'web']);

        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo('patients.manage');
        Sanctum::actingAs($user, ['*']);

        $this->owner = Client::factory()->create(['company_id' => $this->company->id]);
        $this->dog = Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);
        $this->labrador = Breed::create([
            'company_id' => $this->company->id, 'species_id' => $this->dog->id, 'name' => 'Labrador', 'status' => 'active',
        ]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'company_id' => $this->company->id,
            'client_id' => $this->owner->id,
            'species_id' => $this->dog->id,
            'breed_id' => $this->labrador->id,
            'name' => 'Luna',
            'sex' => 'female',
            'birth_date' => '2021-03-14',
            'weight' => 28.4,
            'sterilized' => true,
            'status' => 'active',
        ], $overrides);
    }

    public function test_creates_a_patient_linked_to_its_owner(): void
    {
        $this->postJson('/api/patients', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.client', $this->owner->name)
            ->assertJsonPath('data.species', 'Perro')
            ->assertJsonPath('data.breed', 'Labrador');

        $this->assertDatabaseHas('patients', [
            'name' => 'Luna', 'client_id' => $this->owner->id, 'company_id' => $this->company->id,
        ]);
    }

    public function test_owner_must_belong_to_the_same_company(): void
    {
        $foreignOwner = Client::factory()->create([
            'company_id' => Company::factory()->create(['name' => fake()->company()])->id,
        ]);

        $this->postJson('/api/patients', $this->payload(['client_id' => $foreignOwner->id]))
            ->assertStatus(422)->assertJsonValidationErrors('client_id');
    }

    public function test_breed_must_belong_to_the_species(): void
    {
        $cat = Species::create(['company_id' => $this->company->id, 'name' => 'Gato', 'status' => 'active']);
        $persa = Breed::create(['company_id' => $this->company->id, 'species_id' => $cat->id, 'name' => 'Persa', 'status' => 'active']);

        $this->postJson('/api/patients', $this->payload(['breed_id' => $persa->id]))
            ->assertStatus(422)->assertJsonValidationErrors('breed_id');
    }

    public function test_future_birth_date_is_rejected(): void
    {
        $this->postJson('/api/patients', $this->payload(['birth_date' => now()->addYear()->toDateString()]))
            ->assertStatus(422)->assertJsonValidationErrors('birth_date');
    }

    public function test_microchip_is_unique_per_company(): void
    {
        Patient::query()->create($this->payload(['microchip' => '900000000000001', 'name' => 'Rocky']));

        $this->postJson('/api/patients', $this->payload(['microchip' => '900000000000001']))
            ->assertStatus(422)->assertJsonValidationErrors('microchip');
    }

    public function test_destroy_soft_deletes_and_restore_brings_it_back(): void
    {
        $id = $this->postJson('/api/patients', $this->payload())->json('data.id');

        $this->deleteJson("/api/patients/{$id}")->assertNoContent();

        $this->assertSoftDeleted('patients', ['id' => $id]);
        $this->getJson('/api/patients')->assertOk()->assertJsonCount(0, 'data');
        $this->assertDatabaseHas('audit_logs', ['entity' => Patient::class, 'action' => 'deleted']);

        $this->postJson("/api/patients/{$id}/restore")->assertOk()->assertJsonPath('data.id', $id);
        $this->getJson('/api/patients')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_cannot_see_a_patient_of_another_company(): void
    {
        $foreign = Patient::query()->create([
            'company_id' => Company::factory()->create(['name' => fake()->company()])->id,
            'client_id' => Client::factory()->create(['company_id' => $this->company->id])->id,
            'species_id' => $this->dog->id,
            'name' => 'Ajeno', 'sex' => 'unknown', 'status' => 'active',
        ]);

        $this->getJson("/api/patients/{$foreign->id}")->assertNotFound();
    }

    public function test_client_history_lists_the_owner_pets(): void
    {
        Permission::firstOrCreate(['name' => 'clients.manage', 'guard_name' => 'web']);
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo(['clients.manage', 'patients.manage']);
        Sanctum::actingAs($user, ['*']);

        Patient::query()->create($this->payload(['name' => 'Luna']));

        $this->getJson("/api/clients/{$this->owner->id}/history")
            ->assertOk()
            ->assertJsonPath('patients.0.name', 'Luna');
    }

    public function test_client_history_hides_pets_from_users_without_patients_permission(): void
    {
        // Ventas: gestiona clientes pero NO tiene patients.manage. La historia
        // agregada del cliente no debe filtrarle los datos clínicos de mascotas.
        Permission::firstOrCreate(['name' => 'clients.manage', 'guard_name' => 'web']);
        $sales = User::factory()->create(['company_id' => $this->company->id]);
        $sales->givePermissionTo('clients.manage');
        Sanctum::actingAs($sales, ['*']);

        Patient::query()->create($this->payload(['name' => 'Luna']));

        $this->getJson("/api/clients/{$this->owner->id}/history")
            ->assertOk()
            ->assertJsonPath('patients', []);
    }
}
