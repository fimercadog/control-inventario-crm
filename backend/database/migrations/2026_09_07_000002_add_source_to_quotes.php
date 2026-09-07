<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Origen de la cotizacion: `internal` (la arma un vendedor) o `catalog` (llega
 * como solicitud desde el catalogo publico). Sirve para que el panel distinga
 * y filtre las solicitudes web sin mezclar tablas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('source')->default('internal')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
