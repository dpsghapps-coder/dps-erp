<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            $table->renameColumn('product_sku', 'material_id');
            $table->renameColumn('item_name', 'description');
            $table->dropColumn('collection');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            $table->string('collection')->nullable()->after('item_category');
            $table->renameColumn('description', 'item_name');
            $table->renameColumn('material_id', 'product_sku');
        });
    }
};
