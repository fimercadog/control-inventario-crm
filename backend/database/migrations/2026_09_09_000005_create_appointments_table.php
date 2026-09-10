<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->restrictOnDelete();
            $table->foreignId('practitioner_id')->nullable()->constrained('users')->nullOnDelete();
            // dateTime (no timestamp): MariaDB solo admite un timestamp con
            // default implícito por tabla; dos rompen con "Invalid default value".
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->unsignedInteger('duration_minutes');
            $table->string('resource')->nullable(); // box / consultorio
            $table->string('reason')->nullable();
            $table->string('status')->default('scheduled'); // scheduled | confirmed | attended | no_show | cancelled
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'starts_at']);
            $table->index(['company_id', 'practitioner_id', 'starts_at']);
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
