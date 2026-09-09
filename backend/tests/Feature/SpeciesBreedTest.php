<?php

namespace Tests\Feature;

use App\Models\Breed;
use App\Models\Company;
use App\Models\Species;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * S2 — catálogos de Especies y Razas.
 */
class SpeciesBreedTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => fake()->company()]);
        Permission::firstOrCreate(['name' => 'patients.manage', 'guard_name' => 'web']);

        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo('patients.manage');
        Sanctum::actingAs($user, ['*']);
    }

    public function test_requires_patients_manage_permission(): void
    {
        $user = User::factory()->create(['company_id' => $this->company->id]);
        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/species')->assertForbidden();
    }

    public function test_creates_species_and_breeds(): void
    {
        $speciesId = $this->postJson('/api/species', ['name' => 'Perro', 'status' => 'active'])
            ->assertCreated()->json('data.id');

        $this->postJson('/api/breeds', ['name' => 'Labrador', 'species_id' => $speciesId, 'status' => 'active'])
            ->assertCreated()
            ->assertJsonPath('data.species', 'Perro');

        $this->assertDatabaseHas('breeds', [
            'name' => 'Labrador', 'species_id' => $speciesId, 'company_id' => $this->company->id,
        ]);
    }

    public function test_breed_needs_a_species_from_the_same_company(): void
    {
        $otherCompany = Company::factory()->create(['name' => fake()->company()]);
        $foreignSpecies = Species::create(['company_id' => $otherCompany->id, 'name' => 'Gato', 'status' => 'active']);

        $this->postJson('/api/breeds', [
            'name' => 'Siamés', 'species_id' => $foreignSpecies->id, 'status' => 'active',
        ])->assertStatus(422)->assertJsonValidationErrors('species_id');
    }

    public function test_breeds_can_be_filtered_by_species(): void
    {
        $dog = Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);
        $cat = Species::create(['company_id' => $this->company->id, 'name' => 'Gato', 'status' => 'active']);
        Breed::create(['company_id' => $this->company->id, 'species_id' => $dog->id, 'name' => 'Poodle', 'status' => 'active']);
        Breed::create(['company_id' => $this->company->id, 'species_id' => $cat->id, 'name' => 'Persa', 'status' => 'active']);

        $data = $this->getJson("/api/breeds?species_id={$dog->id}")->assertOk()->json('data');

        $this->assertCount(1, $data);
        $this->assertSame('Poodle', $data[0]['name']);
    }

    public function test_species_name_is_unique_per_company(): void
    {
        Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);

        $this->postJson('/api/species', ['name' => 'Perro', 'status' => 'active'])
            ->assertStatus(422);
    }

    public function test_cannot_delete_a_species_that_has_breeds(): void
    {
        $species = Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);
        Breed::create(['company_id' => $this->company->id, 'species_id' => $species->id, 'name' => 'Beagle', 'status' => 'active']);

        $this->deleteJson("/api/species/{$species->id}")->assertStatus(422);
        $this->assertDatabaseHas('species', ['id' => $species->id]);
    }
}
