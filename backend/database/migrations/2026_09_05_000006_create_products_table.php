<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('sku');
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('unit')->default('unidad');
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('cost_price', 12, 2)->default(0);
            $table->unsignedInteger('reorder_level')->default(0);
            $table->string('status')->default('active'); // active | inactive
            $table->timestamps();

            $table->unique(['company_id', 'sku']);
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
