<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['deals', 'orders'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->foreignId('owner_id')->nullable()->after('company_id')->constrained('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach (['deals', 'orders'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropConstrainedForeignId('owner_id');
            });
        }
    }
};
