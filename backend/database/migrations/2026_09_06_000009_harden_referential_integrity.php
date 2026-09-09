<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Endurece la integridad referencial:
 *  1. Tablas historicas / de bitacora -> RESTRICT en vez de CASCADE, para que
 *     borrar un cliente / producto / bodega / proveedor no destruya ventas,
 *     compras ni movimientos de inventario.
 *  2. `activities.deal_id` -> SET NULL: una actividad puede sobrevivir al deal.
 *  3. Snapshot de producto (`product_name`, `sku`) en las lineas de pedidos,
 *     cotizaciones y ordenes de compra: un documento historico debe mostrar lo
 *     que se vendio aunque el producto cambie o se elimine despues.
 *  4. Indices en los FK que no los tenian (SQLite no los crea solo).
 */
return new class extends Migration
{
    /** [tabla, columna, tabla_padre] que pasan de CASCADE a RESTRICT. */
    private array $restrict = [
        ['orders', 'client_id', 'clients'],
        ['orders', 'warehouse_id', 'warehouses'],
        ['order_items', 'product_id', 'products'],
        ['stock_movements', 'product_id', 'products'],
        ['stock_movements', 'warehouse_id', 'warehouses'],
        ['stock_transfers', 'product_id', 'products'],
        ['stock_transfers', 'from_warehouse_id', 'warehouses'],
        ['stock_transfers', 'to_warehouse_id', 'warehouses'],
        ['quotes', 'client_id', 'clients'],
        ['purchase_orders', 'supplier_id', 'suppliers'],
        ['purchase_orders', 'warehouse_id', 'warehouses'],
        ['purchase_order_items', 'product_id', 'products'],
    ];

    public function up(): void
    {
        foreach ($this->restrict as [$table, $column, $parent]) {
            Schema::table($table, function (Blueprint $t) use ($column, $parent) {
                $t->dropForeign([$column]);
                $t->foreign($column)->references('id')->on($parent)->restrictOnDelete();
            });
        }

        Schema::table('activities', function (Blueprint $t) {
            $t->dropForeign(['deal_id']);
            $t->foreign('deal_id')->references('id')->on('deals')->nullOnDelete();
        });

        foreach (['order_items', 'quote_items', 'purchase_order_items'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->string('product_name')->nullable()->after('product_id');
                $t->string('sku', 60)->nullable()->after('product_name');
            });
            DB::statement("
                UPDATE {$table}
                SET product_name = (SELECT name FROM products WHERE products.id = {$table}.product_id),
                    sku = (SELECT sku FROM products WHERE products.id = {$table}.product_id)
                WHERE product_id IS NOT NULL
            ");
        }

        $this->addIndexes([
            ['order_items', 'order_id'],
            ['order_items', 'product_id'],
            ['quote_items', 'quote_id'],
            ['quote_items', 'product_id'],
            ['purchase_order_items', 'purchase_order_id'],
            ['purchase_order_items', 'product_id'],
            ['orders', 'client_id'],
            ['quotes', 'client_id'],
            ['deals', 'client_id'],
            ['deals', 'owner_id'],
            ['orders', 'owner_id'],
            ['activities', 'client_id'],
            ['activities', 'deal_id'],
            ['clients', 'segment_id'],
            ['products', 'category_id'],
            ['products', 'brand_id'],
            ['products', 'unit_id'],
        ]);
    }

    public function down(): void
    {
        foreach ($this->restrict as [$table, $column, $parent]) {
            Schema::table($table, function (Blueprint $t) use ($column, $parent) {
                $t->dropForeign([$column]);
                $t->foreign($column)->references('id')->on($parent)->cascadeOnDelete();
            });
        }

        Schema::table('activities', function (Blueprint $t) {
            $t->dropForeign(['deal_id']);
            $t->foreign('deal_id')->references('id')->on('deals')->cascadeOnDelete();
        });

        foreach (['order_items', 'quote_items', 'purchase_order_items'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropColumn(['product_name', 'sku']));
        }
    }

    private function addIndexes(array $pairs): void
    {
        foreach ($pairs as [$table, $column]) {
            try {
                Schema::table($table, fn (Blueprint $t) => $t->index($column, "{$table}_{$column}_index"));
            } catch (Throwable) {
                // El indice ya existe (p. ej. lo creo un composite previo).
            }
        }
    }
};
