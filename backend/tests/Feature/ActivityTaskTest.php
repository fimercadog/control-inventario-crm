<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ActivityTaskTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => 'Test SA']);
        Permission::firstOrCreate(['name' => 'activities.manage', 'guard_name' => 'web']);
        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo('activities.manage');
        Sanctum::actingAs($user, ['*']);
    }

    public function test_accepts_task_and_followup_types(): void
    {
        $this->postJson('/api/activities', ['type' => 'task', 'subject' => 'Enviar cotizacion'])->assertCreated();
        $this->postJson('/api/activities', ['type' => 'followup', 'subject' => 'Volver a llamar'])->assertCreated();
        $this->postJson('/api/activities', ['type' => 'nope', 'subject' => 'X'])
            ->assertStatus(422)->assertJsonValidationErrors(['type']);
    }

    public function test_due_date_is_serialized_as_a_plain_date(): void
    {
        Activity::create([
            'company_id' => $this->company->id, 'type' => 'task', 'subject' => 'Con fecha',
            'due_date' => '2026-09-16', 'completed' => false,
        ]);

        $this->getJson('/api/activities?completed=0')->assertOk()
            ->assertJsonPath('data.0.due_date', '2026-09-16');
    }

    public function test_pending_filter_and_completion_toggle(): void
    {
        $activity = Activity::create([
            'company_id' => $this->company->id, 'type' => 'task', 'subject' => 'Pendiente', 'completed' => false,
        ]);

        $this->getJson('/api/activities?completed=0')->assertOk()->assertJsonCount(1, 'data');

        $this->putJson("/api/activities/{$activity->id}", ['completed' => true])
            ->assertOk()
            ->assertJsonPath('data.completed', true);

        $this->getJson('/api/activities?completed=0')->assertOk()->assertJsonCount(0, 'data');
    }
}
