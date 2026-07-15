<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->morphs('component');
            $table->decimal('quantity', 12, 2)->default(1);
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'component_id', 'component_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_components');
    }
};
