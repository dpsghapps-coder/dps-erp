<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('material_prices', function (Blueprint $table) {
            $table->decimal('units_purchased', 12, 2)->default(1)->after('material_id');
            $table->decimal('qty_per_unit', 12, 2)->nullable()->after('units_purchased');
            $table->decimal('qty', 12, 2)->default(0)->after('qty_per_unit');
            $table->decimal('material_cost', 12, 2)->default(0)->after('qty');
            $table->decimal('total_cost', 12, 2)->default(0)->after('material_cost');
        });
    }

    public function down(): void
    {
        Schema::table('material_prices', function (Blueprint $table) {
            $table->dropColumn(['units_purchased', 'qty_per_unit', 'qty', 'material_cost', 'total_cost']);
        });
    }
};
