<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Unlike office_issue_reports (deliberately anonymous), technical
     * reports are tied to the submitting user — bugs and equipment issues
     * usually need follow-up, which an anonymous report can't support.
     */
    public function up(): void
    {
        Schema::create('technical_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category');
            $table->string('title');
            $table->text('description');
            $table->string('severity')->default('medium');
            $table->string('location')->nullable();
            $table->string('status')->default('new');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technical_reports');
    }
};
