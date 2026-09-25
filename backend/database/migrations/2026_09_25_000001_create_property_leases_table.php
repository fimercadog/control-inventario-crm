<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('property_leases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
            $table->string('contract_number')->unique();
            $table->decimal('monthly_rent', 12, 2);
            $table->decimal('deposit_amount', 12, 2)->default(0);
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedTinyInteger('payment_day')->default(5);
            $table->string('status')->default('ACTIVO'); // ACTIVO | PENDIENTE | FINALIZADO | CANCELADO
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index(['property_id', 'client_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_leases');
    }
};
