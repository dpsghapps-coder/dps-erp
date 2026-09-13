<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_trainings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_module_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('failed');
            $table->unsignedTinyInteger('quiz_score')->nullable();
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['training_module_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_trainings');
    }
};
