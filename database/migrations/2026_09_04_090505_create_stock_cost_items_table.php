<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_cost_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('stock_id');
            $table->string('label');
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();

            $table->foreign('stock_id')->references('id')->on('stocks')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_cost_items');
    }
};
