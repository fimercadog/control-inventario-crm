<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->constrained()->restrictOnDelete(); // propietario
            $table->foreignId('species_id')->constrained('species')->restrictOnDelete();
            $table->foreignId('breed_id')->nullable()->constrained('breeds')->nullOnDelete();
            $table->string('name');
            $table->string('sex')->default('unknown'); // male | female | unknown
            $table->date('birth_date')->nullable();
            $table->decimal('weight', 6, 2)->nullable(); // kg
            $table->string('microchip')->nullable();
            $table->boolean('sterilized')->default(false);
            $table->string('photo_url', 500)->nullable(); // lo fija el servidor
            $table->string('status')->default('active'); // active | inactive
            $table->softDeletes();
            $table->timestamps();

            $table->unique(['company_id', 'microchip']);
            $table->index(['company_id', 'client_id']);
            $table->index(['company_id', 'species_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
