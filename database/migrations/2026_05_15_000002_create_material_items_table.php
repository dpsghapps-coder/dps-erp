<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('inventory_product_id');
            $table->string('mat_item_id');
            $table->text('mat_item_desc')->nullable();
            $table->timestamps();

            $table->foreign('inventory_product_id')->references('id')->on('inventory_products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_items');
    }
};
