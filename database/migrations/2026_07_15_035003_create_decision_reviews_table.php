<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('decision_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('decision_id')->constrained()->onDelete('cascade');
            $table->integer('rating');
            $table->text('notes')->nullable();
            $table->text('lessons_learned')->nullable();
            $table->foreignId('reviewed_by')->constrained('users');
            $table->timestamps();

            $table->unique('decision_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('decision_reviews');
    }
};
