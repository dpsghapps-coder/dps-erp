<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_price_cost_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_price_id')->constrained()->onDelete('cascade');
            $table->string('label');
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_price_cost_items');
    }
};
