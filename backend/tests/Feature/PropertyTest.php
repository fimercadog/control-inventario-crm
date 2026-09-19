<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Owner;
use App\Models\Property;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PropertyTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::create(['name' => 'Inmobiliaria Test S.A.S.']);

        Permission::firstOrCreate(['name' => 'properties.manage', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'owners.manage', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'visits.manage', 'guard_name' => 'web']);

        $this->user = User::create([
            'company_id' => $this->company->id,
            'name' => 'Agente Inmobiliario',
            'email' => 'agente@inmobiliaria.test',
            'password' => bcrypt('password'),
        ]);

        $this->user->givePermissionTo(['properties.manage', 'owners.manage', 'visits.manage']);
    }

    public function test_can_list_properties(): void
    {
        Property::create([
            'company_id' => $this->company->id,
            'code' => 'INM-101',
            'slug' => 'apto-test',
            'title' => 'Apartamento Test',
            'property_type' => 'apartment',
            'listing_type' => 'sale',
            'status' => 'published',
            'city' => 'Bogotá',
            'price' => 500000000,
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/properties');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.code', 'INM-101')
            ->assertJsonPath('data.0.title', 'Apartamento Test');
    }

    public function test_can_create_owner(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/owners', [
            'name' => 'Propietario Juan',
            'document' => '12345678',
            'phone' => '+57 300 111 2233',
            'email' => 'juan@propietarios.test',
            'status' => 'activo',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Propietario Juan');

        $this->assertDatabaseHas('owners', [
            'company_id' => $this->company->id,
            'name' => 'Propietario Juan',
        ]);
    }

    public function test_public_properties_endpoint(): void
    {
        Property::create([
            'company_id' => $this->company->id,
            'code' => 'INM-PUB-1',
            'slug' => 'apto-publico-test',
            'title' => 'Apartamento Público',
            'property_type' => 'apartment',
            'listing_type' => 'sale',
            'status' => 'published',
            'city' => 'Bogotá',
            'price' => 350000000,
        ]);

        $response = $this->getJson('/api/public/properties');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.code', 'INM-PUB-1');
    }
}
