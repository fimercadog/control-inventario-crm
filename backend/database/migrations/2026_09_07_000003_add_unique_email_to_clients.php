<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Un cliente por correo dentro de cada empresa. Respalda el `firstOrCreate` por
 * email de la solicitud de cotizacion publica (evita filas duplicadas ante
 * envios casi simultaneos) y es la regla correcta para un CRM. El correo sigue
 * siendo opcional: varios clientes sin correo por empresa estan permitidos
 * (los NULL no chocan en un indice unico).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->unique(['company_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropUnique(['company_id', 'email']);
        });
    }
};
