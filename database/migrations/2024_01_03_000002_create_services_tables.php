<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('unit', 30)->default('pcs');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('service_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->integer('min_qty')->default(1);
            $table->integer('max_qty')->nullable();
            $table->decimal('unit_price', 12, 2);
            $table->timestamps();

            $table->unique(['service_id', 'min_qty']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_prices');
        Schema::dropIfExists('services');
    }
};
