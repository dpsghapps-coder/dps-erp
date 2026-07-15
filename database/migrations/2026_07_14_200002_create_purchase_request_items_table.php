<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_request_id')->constrained()->onDelete('cascade');
            $table->string('item_name');
            $table->text('item_description')->nullable();
            $table->uuid('product_id')->nullable();
            $table->decimal('estimated_cost', 12, 2)->default(0);
            $table->decimal('qty_requested', 12, 2)->default(1);
            $table->string('uom')->default('Pieces');
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('inventory_products')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_request_items');
    }
};
