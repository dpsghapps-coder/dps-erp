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
        Schema::table('material_supplier_prices', function (Blueprint $table) {
            $table->dropUnique('mat_supp_unique');
            $table->dropColumn('collection');
            $table->timestamp('collection')->nullable()->after('price');
            $table->unique(['material_id', 'supplier_id'], 'mat_supp_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('material_supplier_prices', function (Blueprint $table) {
            $table->dropUnique('mat_supp_unique');
            $table->dropColumn('collection');
            $table->string('collection')->nullable();
            $table->unique(['material_id', 'supplier_id', 'collection'], 'mat_supp_unique');
        });
    }
};
