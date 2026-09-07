<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Deliberately no user_id / submitter reference of any kind — reports
        // are anonymous at the data level, not just hidden in the UI.
        Schema::create('office_issue_reports', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->string('location')->nullable();
            $table->text('description');
            $table->enum('status', ['new', 'in_review', 'resolved', 'dismissed'])->default('new');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('office_issue_reports');
    }
};
