<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Client;
use App\Models\Company;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CrudValidationTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        foreach (['clients.manage', 'products.manage'] as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo(['clients.manage', 'products.manage']);
        Sanctum::actingAs($user, ['*']);
    }

    public function test_rejects_garbage_client_payload(): void
    {
        $this->postJson('/api/clients', [
            'name' => '',
            'email' => 'no-es-un-correo',
            'status' => 'nope',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'status']);
    }

    public function test_accepts_a_valid_client(): void
    {
        $this->postJson('/api/clients', [
            'name' => 'Ana Maria Perez',
            'company_name' => 'Constructora Alfa',
            'email' => 'ana@constructoraalfa.co',
            'status' => 'active',
        ])->assertCreated();
    }

    public function test_rejects_a_duplicate_client_email_in_the_same_company(): void
    {
        Client::factory()->create(['company_id' => $this->company->id, 'email' => 'repetido@empresa.co']);

        $this->postJson('/api/clients', [
            'name' => 'Otro', 'email' => 'repetido@empresa.co', 'status' => 'active',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_partial_update_still_works_for_status_toggle(): void
    {
        $client = Client::factory()->create(['company_id' => $this->company->id, 'status' => 'active']);

        $this->putJson("/api/clients/{$client->id}", ['status' => 'inactive'])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');
    }

    /**
     * En update, las reglas del FormRequest que dependen de $this->user() /
     * $this->route() (scoping por empresa, unique-ignore) deben seguir vivas.
     */
    public function test_update_rules_keep_request_context(): void
    {
        $a = Client::factory()->create(['company_id' => $this->company->id, 'email' => 'uno@empresa.co']);
        $b = Client::factory()->create(['company_id' => $this->company->id, 'email' => 'dos@empresa.co']);

        // Guardar el mismo correo del propio registro: no debe chocar consigo mismo.
        $this->putJson("/api/clients/{$a->id}", ['name' => 'Uno', 'email' => 'uno@empresa.co', 'status' => 'active'])
            ->assertOk();

        // Tomar el correo de otro cliente: 422 con mensaje de unicidad (no "formato").
        $this->putJson("/api/clients/{$b->id}", ['name' => 'Dos', 'email' => 'uno@empresa.co', 'status' => 'active'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Ya hay un cliente con ese correo en la empresa.');

        // Producto: editar mandando un category_id valido de la empresa (regresion:
        // antes el scoping por empresa en update comparaba contra company_id NULL).
        $category = Category::create(['company_id' => $this->company->id, 'name' => 'Herr', 'status' => 'active']);
        $product = Product::factory()->create(['company_id' => $this->company->id]);
        $this->putJson("/api/products/{$product->id}", [
            'name' => 'Editado', 'category_id' => $category->id,
            'unit_price' => 10, 'cost_price' => 5, 'reorder_level' => 1, 'status' => 'active',
        ])->assertOk()->assertJsonPath('data.category_id', $category->id);
    }

    public function test_product_module_is_also_validated(): void
    {
        $this->postJson('/api/products', ['sku' => '', 'name' => '', 'status' => 'nope'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['sku', 'name', 'unit_price', 'cost_price', 'reorder_level', 'status']);
    }
}
