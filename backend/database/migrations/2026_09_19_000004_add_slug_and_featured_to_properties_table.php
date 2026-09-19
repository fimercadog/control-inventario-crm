<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('code');
            $table->boolean('is_featured')->default(false)->after('status');

            $table->index(['is_featured']);
        });

        // Backfill slugs for rows that predate this column, using the same
        // composition the Property model uses for new records.
        DB::table('properties')->whereNull('slug')->orderBy('id')->each(function (object $property): void {
            $location = $property->zone ?: $property->city;
            $slug = Str::slug("{$property->property_type} en {$property->listing_type} {$location} {$property->city}").'-'.Str::slug($property->code);

            DB::table('properties')->where('id', $property->id)->update(['slug' => $slug]);
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropIndex(['is_featured']);
            $table->dropColumn(['slug', 'is_featured']);
        });
    }
};
