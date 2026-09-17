<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            // Reference price entered when the material is created/edited --
            // separate from the per-supplier prices collected over time via
            // MaterialPrice, and from the per-purchase price on Stock.
            $table->decimal('price_per_unit', 12, 4)->nullable()->after('default_qty_per_unit');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            $table->dropColumn('price_per_unit');
        });
    }
};
