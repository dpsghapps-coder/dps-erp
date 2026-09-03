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
        Schema::create('material_prices', function (Blueprint $table) {
            $table->id();
            $table->uuid('material_id');
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 12, 2);
            $table->foreignId('collected_by')->nullable()->nullOnDelete()->constrained('users');
            $table->date('collection_date');
            $table->foreignId('added_by')->nullable()->nullOnDelete()->constrained('users');
            $table->timestamps();

            $table->unique(['material_id', 'supplier_id', 'collection_date']);
            $table->foreign('material_id')->references('id')->on('inventory_products')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_prices');
    }
};
