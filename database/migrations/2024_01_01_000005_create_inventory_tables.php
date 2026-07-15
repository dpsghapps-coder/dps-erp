<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Inventory Products table
        if (! Schema::hasTable('inventory_products')) {
            Schema::create('inventory_products', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('product_sku')->unique();
                $table->unsignedBigInteger('supplier_id')->nullable();
                $table->string('item_name');
                $table->text('item_description')->nullable();
                $table->string('item_category')->nullable();
                $table->string('uom')->default('Pieces');
                $table->decimal('unit_price', 12, 2)->default(0);
                $table->integer('qty_available')->default(0);
                $table->string('item_status', 20)->default('Active');
                $table->timestamp('date_deactivated')->nullable();
                $table->timestamps();

                $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
            });
        }

        // Stock table
        if (! Schema::hasTable('stocks')) {
            Schema::create('stocks', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('product_id');
                $table->integer('qty_purchased')->default(0);
                $table->date('date_purchased')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->foreign('product_id')->references('id')->on('inventory_products')->onDelete('cascade');
            });
        }

        // Requisitions table
        if (! Schema::hasTable('requisitions')) {
            Schema::create('requisitions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('product_id');
                $table->integer('qty_requested')->default(0);
                $table->timestamp('date_requested')->useCurrent();
                $table->string('status', 20)->default('pending');
                $table->string('requested_by')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->foreign('product_id')->references('id')->on('inventory_products')->onDelete('cascade');
            });
        }

        // Settings table for UOM and Categories
        if (! Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value')->nullable();
                $table->string('type')->default('string');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('requisitions');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('inventory_products');
        Schema::dropIfExists('settings');
    }
};
