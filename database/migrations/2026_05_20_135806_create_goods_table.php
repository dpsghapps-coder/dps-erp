<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('material_id');
            $table->unsignedBigInteger('supplier_id')->nullable();
            $table->string('item_name');
            $table->text('item_description')->nullable();
            $table->string('item_category')->nullable();
            $table->string('uom')->default('Pieces');
            $table->integer('qty_available')->default(0);
            $table->integer('restock_threshold')->default(0);
            $table->string('item_status')->default('Active');
            $table->datetime('date_deactivated')->nullable();
            $table->json('attributes')->nullable();
            $table->string('picture')->nullable();
            $table->timestamps();

            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goods');
    }
};
