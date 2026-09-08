<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studio_deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('studio_booking_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->enum('status', ['pending', 'in_progress', 'delivered'])->default('pending');
            $table->string('link')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('studio_deliverables');
    }
};
