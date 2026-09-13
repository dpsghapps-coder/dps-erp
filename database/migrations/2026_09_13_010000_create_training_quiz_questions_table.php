<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_module_id')->constrained()->onDelete('cascade');
            $table->text('question');
            $table->json('options');
            $table->unsignedTinyInteger('correct_option');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_quiz_questions');
    }
};
