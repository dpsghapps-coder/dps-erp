<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->string('product_type')->nullable()->after('product_id');
        });

        DB::table('purchase_order_items')->whereNull('product_type')->update([
            'product_type' => \App\Models\InventoryProduct::class,
        ]);
    }

    public function down(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropColumn('product_type');
        });
    }
};
