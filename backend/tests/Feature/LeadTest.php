<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_submit_a_lead_with_consent(): void
    {
        Company::factory()->create(['name' => 'Test SA']);

        $this->postJson('/api/public/leads', [
            'name' => 'Ana Prueba',
            'email' => 'ana@empresa.co',
            'source' => 'demo',
            'consent' => true,
        ])->assertCreated();

        $this->assertDatabaseHas('leads', ['email' => 'ana@empresa.co', 'source' => 'demo', 'status' => 'new']);
    }

    public function test_lead_without_consent_is_rejected(): void
    {
        $this->postJson('/api/public/leads', [
            'name' => 'Ana Prueba',
            'email' => 'ana@empresa.co',
            'source' => 'demo',
        ])->assertStatus(422)->assertJsonValidationErrors('consent');
    }

    public function test_manual_lead_create_requires_permission(): void
    {
        Sanctum::actingAs(User::factory()->create(), ['*']);

        $this->postJson('/api/leads', ['name' => 'X', 'email' => 'x@y.co', 'status' => 'new'])->assertForbidden();
    }

    public function test_user_with_permission_creates_a_manual_lead(): void
    {
        Permission::firstOrCreate(['name' => 'leads.view', 'guard_name' => 'web']);
        $company = Company::factory()->create(['name' => 'Test SA']);
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->givePermissionTo('leads.view');
        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/leads', [
            'name' => 'Cliente Telefonico',
            'company_name' => 'Ferreteria X',
            'email' => 'tel@ferreteriax.co',
            'phone' => '3001234567',
            'status' => 'new',
        ])->assertCreated()->assertJsonPath('data.source', 'manual');

        $this->assertDatabaseHas('leads', [
            'company_id' => $company->id,
            'email' => 'tel@ferreteriax.co',
            'source' => 'manual',
            'status' => 'new',
        ]);
    }

    public function test_lead_list_requires_permission(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/leads')->assertForbidden();
    }

    public function test_user_with_permission_lists_and_updates_status(): void
    {
        Permission::firstOrCreate(['name' => 'leads.view', 'guard_name' => 'web']);
        $company = Company::factory()->create(['name' => 'Test SA']);
        $user = User::factory()->create(['company_id' => $company->id]);
        $user->givePermissionTo('leads.view');
        Sanctum::actingAs($user, ['*']);

        $lead = Lead::create(['company_id' => $company->id, 'name' => 'X', 'email' => 'x@y.co', 'source' => 'contact', 'status' => 'new', 'ip_address' => '203.0.113.5']);

        $this->getJson('/api/leads')->assertOk()
            ->assertJsonPath('data.0.id', $lead->id)
            ->assertJsonPath('meta.total', 1)          // envelope que espera la tabla del panel
            ->assertJsonMissingPath('data.0.ip_address'); // PII Ley 1581: no se expone al panel
        $this->putJson("/api/leads/{$lead->id}", ['name' => 'X', 'email' => 'x@y.co', 'status' => 'contacted'])->assertOk();
        $this->assertSame('contacted', $lead->refresh()->status);
    }
}
