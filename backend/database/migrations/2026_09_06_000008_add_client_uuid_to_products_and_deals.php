<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['products', 'deals'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                // Clave de idempotencia generada por el cliente al encolar una
                // transaccion de contingencia. Un reintento de sync no duplica.
                $t->uuid('client_uuid')->nullable()->unique()->after('id');
            });
        }
    }

    public function down(): void
    {
        foreach (['products', 'deals'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropUnique([$table.'_client_uuid_unique']);
                $t->dropColumn('client_uuid');
            });
        }
    }
};
