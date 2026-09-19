<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('property_type');
            $table->string('listing_type');
            $table->string('status')->default('borrador');

            $table->foreignId('owner_id')->nullable()->constrained('owners')->nullOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('city');
            $table->string('zone')->nullable();
            $table->string('address')->nullable();

            $table->decimal('price', 14, 2);
            $table->decimal('admin_fee', 12, 2)->nullable();
            $table->unsignedTinyInteger('stratum')->nullable();
            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->unsignedSmallInteger('bathrooms')->nullable();
            $table->unsignedSmallInteger('parking_spots')->nullable();
            $table->decimal('built_area', 10, 2)->nullable();
            $table->decimal('private_area', 10, 2)->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();

            $table->json('features')->nullable();
            $table->text('notes')->nullable();
            $table->date('published_at')->nullable();

            $table->timestamps();

            $table->index(['status']);
            $table->index(['listing_type']);
            $table->index(['property_type']);
            $table->index(['city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
