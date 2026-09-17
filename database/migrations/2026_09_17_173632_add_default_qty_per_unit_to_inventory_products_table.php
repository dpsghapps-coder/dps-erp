<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            // Only meaningful for non-discrete UOMs (e.g. Meters): the
            // typical amount contained in one unit purchased (e.g. a roll
            // is usually 50 meters), used to pre-fill -- not lock -- Qty
            // per Unit on the Add Purchase form.
            $table->decimal('default_qty_per_unit', 12, 2)->nullable()->after('pack_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            $table->dropColumn('default_qty_per_unit');
        });
    }
};
