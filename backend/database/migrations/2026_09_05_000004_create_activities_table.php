<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('deal_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type')->default('call'); // call | meeting | email | note
            $table->string('subject');
            $table->text('notes')->nullable();
            $table->date('due_date')->nullable();
            $table->boolean('completed')->default(false);
            $table->timestamps();

            $table->index(['company_id', 'completed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
