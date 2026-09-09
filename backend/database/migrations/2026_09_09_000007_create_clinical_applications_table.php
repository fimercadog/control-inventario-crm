<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Acto clínico de vacunación / desparasitación. Distinto del producto de
 * inventario: si `product_id` está seteado, la aplicación descuenta stock y
 * guarda `stock_movement_id`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinical_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // vaccine | deworming
            $table->foreignId('patient_id')->constrained()->restrictOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('consultation_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vet_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('stock_movement_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->date('applied_at');
            $table->string('lot')->nullable();
            $table->date('expires_at')->nullable();
            $table->date('next_due_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'type', 'next_due_at']);
            $table->index(['company_id', 'patient_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinical_applications');
    }
};
