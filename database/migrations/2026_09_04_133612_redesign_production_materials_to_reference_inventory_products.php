<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('production_materials', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropColumn('product_id');
            $table->uuid('material_id')->after('production_job_id');
            $table->foreign('material_id')->references('id')->on('inventory_products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('production_materials', function (Blueprint $table) {
            $table->dropForeign(['material_id']);
            $table->dropColumn('material_id');
            $table->foreignId('product_id')->after('production_job_id')->constrained()->onDelete('cascade');
        });
    }
};
