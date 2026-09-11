<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->foreignId('purchase_order_id')->nullable()->after('supplier_id')
                ->constrained('purchase_orders')->nullOnDelete();
            $table->foreignId('purchase_order_item_id')->nullable()->after('purchase_order_id')
                ->constrained('purchase_order_items', 'id', 'stocks_po_item_id_fk')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropForeign(['purchase_order_id']);
            $table->dropForeign('stocks_po_item_id_fk');
            $table->dropColumn(['purchase_order_id', 'purchase_order_item_id']);
        });
    }
};
