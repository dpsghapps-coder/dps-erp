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
        // mat_supp_unique is dropped/recreated identically below in earlier versions
        // of this migration — skipped now since MySQL won't drop an index that's
        // still backing the material_id/supplier_id foreign keys, and the index
        // definition (material_id, supplier_id) never actually changes here.
        Schema::table('material_supplier_prices', function (Blueprint $table) {
            $table->dropColumn('collection');
            $table->timestamp('collection')->nullable()->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // mat_supp_unique backs the material_id FK, so it can't be dropped while
        // that FK exists — drop the FK first, swap the index, then reattach it.
        Schema::table('material_supplier_prices', function (Blueprint $table) {
            $table->dropForeign(['material_id']);
            $table->dropUnique('mat_supp_unique');
            $table->dropColumn('collection');
            $table->string('collection')->nullable();
            $table->unique(['material_id', 'supplier_id', 'collection'], 'mat_supp_unique');
            $table->foreign('material_id')->references('id')->on('inventory_products')->onDelete('cascade');
        });
    }
};
