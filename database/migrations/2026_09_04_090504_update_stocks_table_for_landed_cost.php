<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->decimal('qty_purchased', 12, 2)->default(0)->change();
            $table->decimal('units_purchased', 12, 2)->default(1)->after('product_id');
            $table->decimal('qty_per_unit', 12, 2)->nullable()->after('units_purchased');
            $table->decimal('material_cost', 12, 2)->default(0)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn(['units_purchased', 'qty_per_unit', 'material_cost']);
            $table->integer('qty_purchased')->default(0)->change();
        });
    }
};
