<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->decimal('discount', 12, 2)->default(0)->after('expected_date');
            $table->decimal('tax', 12, 2)->default(0)->after('discount');
            $table->decimal('subtotal', 12, 2)->default(0)->after('tax');
            $table->text('notes')->nullable()->after('total');
            $table->string('idempotency_key')->nullable()->after('notes');
            $table->unique(['company_id', 'idempotency_key'], 'purchase_orders_company_idempotency_unique');
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            if (! Schema::hasColumn('purchase_order_items', 'product_name')) {
                $table->string('product_name')->nullable()->after('product_id');
            }
            if (! Schema::hasColumn('purchase_order_items', 'sku')) {
                $table->string('sku')->nullable()->after('product_name');
            }
            if (! Schema::hasColumn('purchase_order_items', 'received_quantity')) {
                $table->unsignedInteger('received_quantity')->default(0)->after('quantity');
            }
            if (! Schema::hasColumn('purchase_order_items', 'discount')) {
                $table->decimal('discount', 12, 2)->default(0)->after('unit_cost');
            }
            if (! Schema::hasColumn('purchase_order_items', 'tax')) {
                $table->decimal('tax', 12, 2)->default(0)->after('discount');
            }
            if (! Schema::hasColumn('purchase_order_items', 'line_total')) {
                $table->decimal('line_total', 12, 2)->default(0)->after('tax');
            }
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('company_id')->constrained()->nullOnDelete();
            $table->string('idempotency_key')->nullable()->after('reference');
            $table->unique(['company_id', 'idempotency_key'], 'stock_movements_company_idempotency_unique');
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropUnique('stock_movements_company_idempotency_unique');
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn('idempotency_key');
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropColumn(['received_quantity', 'discount', 'tax', 'line_total']);
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropUnique('purchase_orders_company_idempotency_unique');
            $table->dropColumn(['discount', 'tax', 'subtotal', 'notes', 'idempotency_key']);
        });
    }
};
