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
        Schema::create('material_supplier_prices', function (Blueprint $table) {
            $table->id();
            $table->uuid('material_id');
            $table->unsignedBigInteger('supplier_id');
            $table->decimal('price', 12, 2)->default(0);
            $table->timestamp('collection')->nullable();
            $table->date('date_created')->nullable();
            $table->timestamps();

            $table->foreign('material_id')->references('id')->on('inventory_products')->onDelete('cascade');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
            $table->unique(['material_id', 'supplier_id'], 'mat_supp_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_supplier_prices');
    }
};
