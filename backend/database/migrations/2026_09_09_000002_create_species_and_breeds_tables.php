<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('species', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('status')->default('active'); // active | inactive
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        Schema::create('breeds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('species_id')->constrained('species')->restrictOnDelete();
            $table->string('name');
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['company_id', 'species_id', 'name']);
            $table->index(['company_id', 'species_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breeds');
        Schema::dropIfExists('species');
    }
};
