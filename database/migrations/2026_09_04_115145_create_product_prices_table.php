<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('min_qty')->default(1);
            $table->integer('max_qty')->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->timestamps();

            $table->unique(['product_id', 'min_qty']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_prices');
    }
};
