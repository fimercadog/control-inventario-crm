<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catalogo publico: un producto se muestra en el sitio de marketing solo si
 * `is_public` esta activo (y sigue `status = active`). `description` e
 * `image_url` son el contenido de la ficha publica; el resto del inventario
 * queda fuera del sitio por defecto.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->string('image_url', 500)->nullable()->after('description');
            $table->boolean('is_public')->default(false)->index()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['description', 'image_url', 'is_public']);
        });
    }
};
