<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->date('review_date');
            $table->integer('rating')->default(3); // 1-5 stars
            $table->text('goals')->nullable();
            $table->text('achievements')->nullable();
            $table->text('comments')->nullable();
            $table->string('reviewer_name')->nullable();
            $table->enum('status', ['pending', 'completed'])->default('pending');
            $table->timestamps();
        });

        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->enum('type', ['announcement', 'birthday', 'anniversary', 'general'])->default('general');
            $table->foreignId('posted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_pinned')->default(false);
            $table->date('event_date')->nullable(); // For birthday/anniversary
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notices');
        Schema::dropIfExists('performances');
    }
};
