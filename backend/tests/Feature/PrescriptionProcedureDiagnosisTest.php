<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Company;
use App\Models\Consultation;
use App\Models\Diagnosis;
use App\Models\Patient;
use App\Models\Product;
use App\Models\Species;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

/**
 * S8 — Prescripciones, Procedimientos, Diagnósticos.
 */
class PrescriptionProcedureDiagnosisTest extends TestCase
{
    use RefreshDatabase;

    private Company $company;

    private Patient $patient;

    private Consultation $consultation;

    protected function setUp(): void
    {
        parent::setUp();
        $this->company = Company::factory()->create(['name' => fake()->company()]);
        foreach (['prescriptions.manage', 'procedures.manage', 'medical_records.manage'] as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }

        $user = User::factory()->create(['company_id' => $this->company->id]);
        $user->givePermissionTo(['prescriptions.manage', 'procedures.manage', 'medical_records.manage']);
        Sanctum::actingAs($user, ['*']);

        $client = Client::factory()->create(['company_id' => $this->company->id]);
        $species = Species::create(['company_id' => $this->company->id, 'name' => 'Perro', 'status' => 'active']);
        $this->patient = Patient::query()->create([
            'company_id' => $this->company->id, 'client_id' => $client->id, 'species_id' => $species->id,
            'name' => 'Luna', 'sex' => 'female', 'status' => 'active',
        ]);
        $this->consultation = Consultation::query()->create([
            'company_id' => $this->company->id, 'patient_id' => $this->patient->id,
            'date' => now()->toDateString(), 'reason' => 'Control',
        ]);
    }

    public function test_creates_a_prescription_with_items_and_snapshots_the_product_sku(): void
    {
        $product = Product::create([
            'company_id' => $this->company->id, 'sku' => 'MED-001', 'name' => 'Amoxicilina 250mg',
            'unit_price' => 0, 'cost_price' => 0, 'reorder_level' => 0, 'status' => 'active',
        ]);

        $this->postJson('/api/prescriptions', [
            'consultation_id' => $this->consultation->id,
            'notes' => 'Con comida',
            'items' => [
                ['product_id' => $product->id, 'medication_name' => 'Amoxicilina', 'dosage' => '5 ml', 'frequency' => 'cada 12h', 'duration' => '7 días'],
                ['medication_name' => 'Probiótico', 'frequency' => '1/día'],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.patient_id', $this->patient->id)
            ->assertJsonPath('data.items.0.sku', 'MED-001')
            ->assertJsonCount(2, 'data.items');
    }

    public function test_prescription_needs_at_least_one_item(): void
    {
        $this->postJson('/api/prescriptions', ['consultation_id' => $this->consultation->id, 'items' => []])
            ->assertStatus(422)->assertJsonValidationErrors('items');
    }

    public function test_prescription_pdf_downloads(): void
    {
        $id = $this->postJson('/api/prescriptions', [
            'consultation_id' => $this->consultation->id,
            'items' => [['medication_name' => 'X']],
        ])->json('data.id');

        $this->get("/api/prescriptions/{$id}/pdf")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }

    public function test_creates_a_procedure(): void
    {
        $this->postJson('/api/procedures', [
            'patient_id' => $this->patient->id,
            'type' => 'Cirugía de esterilización',
            'performed_at' => now()->subDay()->toDateString(),
            'notes' => 'Sin complicaciones',
        ])->assertCreated()->assertJsonPath('data.type', 'Cirugía de esterilización');
    }

    public function test_attaches_diagnoses_to_a_consultation(): void
    {
        $d1 = Diagnosis::create(['company_id' => $this->company->id, 'name' => 'Gastroenteritis', 'status' => 'active']);
        $d2 = Diagnosis::create(['company_id' => $this->company->id, 'name' => 'Otitis', 'status' => 'active']);

        $this->putJson("/api/consultations/{$this->consultation->id}", [
            'diagnosis_ids' => [$d1->id, $d2->id],
        ])->assertOk()->assertJsonCount(2, 'data.diagnoses');

        $this->assertDatabaseHas('consultation_diagnosis', [
            'consultation_id' => $this->consultation->id, 'diagnosis_id' => $d1->id,
        ]);
    }

    public function test_diagnosis_of_another_company_cannot_be_attached(): void
    {
        $foreign = Diagnosis::create([
            'company_id' => Company::factory()->create(['name' => fake()->company()])->id,
            'name' => 'Ajeno', 'status' => 'active',
        ]);

        $this->putJson("/api/consultations/{$this->consultation->id}", ['diagnosis_ids' => [$foreign->id]])
            ->assertStatus(422)->assertJsonValidationErrors('diagnosis_ids.0');
    }
}
