<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->cascadeOnDelete();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('scheduled_at');
            $table->string('status')->default('pendiente');
            $table->text('notes')->nullable();
            $table->text('result')->nullable();
            $table->text('follow_up')->nullable();
            $table->timestamps();

            $table->index(['status']);
            $table->index(['scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
