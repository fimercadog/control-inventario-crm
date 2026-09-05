<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('stage')->default('prospecting'); // prospecting | qualification | proposal | negotiation | won | lost
            $table->date('expected_close_date')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'stage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
