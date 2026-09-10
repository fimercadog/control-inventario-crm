<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultation_id')->constrained()->restrictOnDelete();
            $table->foreignId('patient_id')->constrained()->restrictOnDelete();
            $table->foreignId('vet_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'patient_id']);
        });

        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('medication_name');
            $table->string('sku', 60)->nullable();
            $table->string('dosage')->nullable();
            $table->string('frequency')->nullable();
            $table->string('duration')->nullable();
            $table->timestamps();
        });

        Schema::create('procedures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('vet_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type');
            $table->date('performed_at');
            $table->text('notes')->nullable();
            $table->string('consent_document_url', 500)->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'patient_id']);
        });

        Schema::create('diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('code')->nullable();
            $table->string('name');
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        Schema::create('consultation_diagnosis', function (Blueprint $table) {
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();
            // restrict, no cascade: borrar un diagnóstico del catálogo no debe
            // borrarlo silenciosamente de las historias donde ya se usó. El
            // BaseCrudController convierte la violación de FK en un 422.
            $table->foreignId('diagnosis_id')->constrained()->restrictOnDelete();
            $table->primary(['consultation_id', 'diagnosis_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_diagnosis');
        Schema::dropIfExists('diagnoses');
        Schema::dropIfExists('procedures');
        Schema::dropIfExists('prescription_items');
        Schema::dropIfExists('prescriptions');
    }
};
