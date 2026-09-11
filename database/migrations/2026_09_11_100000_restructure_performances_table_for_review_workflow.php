<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('performances', function (Blueprint $table) {
            $table->dropColumn(['status', 'reviewer_name', 'rating', 'comments']);
        });

        Schema::table('performances', function (Blueprint $table) {
            $table->string('status')->default('self_assessment')->after('review_date');
            $table->string('period')->nullable()->after('status');
            $table->foreignId('initiated_by')->nullable()->after('period')->constrained('users')->nullOnDelete();

            $table->integer('self_rating')->nullable()->after('achievements');
            $table->text('self_comments')->nullable()->after('self_rating');
            $table->timestamp('self_submitted_at')->nullable()->after('self_comments');

            $table->foreignId('supervisor_employee_id')->nullable()->after('self_submitted_at')->constrained('employees')->nullOnDelete();
            $table->integer('supervisor_rating')->nullable()->after('supervisor_employee_id');
            $table->text('supervisor_comments')->nullable()->after('supervisor_rating');
            $table->timestamp('supervisor_submitted_at')->nullable()->after('supervisor_comments');

            $table->foreignId('manager_employee_id')->nullable()->after('supervisor_submitted_at')->constrained('employees')->nullOnDelete();
            $table->text('manager_comments')->nullable()->after('manager_employee_id');
            $table->timestamp('manager_submitted_at')->nullable()->after('manager_comments');

            $table->foreignId('hr_user_id')->nullable()->after('manager_submitted_at')->constrained('users')->nullOnDelete();
            $table->text('hr_comments')->nullable()->after('hr_user_id');
            $table->timestamp('hr_submitted_at')->nullable()->after('hr_comments');
        });
    }

    public function down(): void
    {
        Schema::table('performances', function (Blueprint $table) {
            $table->dropForeign(['initiated_by']);
            $table->dropForeign(['supervisor_employee_id']);
            $table->dropForeign(['manager_employee_id']);
            $table->dropForeign(['hr_user_id']);

            $table->dropColumn([
                'status', 'period', 'initiated_by',
                'self_rating', 'self_comments', 'self_submitted_at',
                'supervisor_employee_id', 'supervisor_rating', 'supervisor_comments', 'supervisor_submitted_at',
                'manager_employee_id', 'manager_comments', 'manager_submitted_at',
                'hr_user_id', 'hr_comments', 'hr_submitted_at',
            ]);
        });

        Schema::table('performances', function (Blueprint $table) {
            $table->enum('status', ['pending', 'completed'])->default('pending');
            $table->string('reviewer_name')->nullable();
            $table->integer('rating')->default(3);
            $table->text('comments')->nullable();
        });
    }
};
