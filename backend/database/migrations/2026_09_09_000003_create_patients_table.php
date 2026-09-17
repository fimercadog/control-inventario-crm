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
            $table->foreignId('client_id')->nullable()->constrained()->restrictOnDelete(); // titular / contacto responsable
            $table->string('document_type', 20)->nullable();
            $table->string('document_number', 40)->nullable();
            $table->string('first_name', 80)->nullable();
            $table->string('last_name', 80)->nullable();
            $table->foreignId('species_id')->nullable()->constrained('species')->nullOnDelete();
            $table->foreignId('breed_id')->nullable()->constrained('breeds')->nullOnDelete();
            $table->string('name');
            $table->string('sex')->default('unknown'); // male | female | unknown
            $table->date('birth_date')->nullable();
            $table->string('blood_type', 10)->nullable();
            $table->string('eps', 120)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 120)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('emergency_contact_name', 120)->nullable();
            $table->string('emergency_contact_phone', 30)->nullable();
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
