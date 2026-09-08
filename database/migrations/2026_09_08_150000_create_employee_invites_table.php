<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_invites', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('expires_at');

            // Filled in by the applicant when they submit the public form.
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->nullable();
            $table->string('mobile_1')->nullable();
            $table->string('mobile_2')->nullable();
            $table->string('emergency_person')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamp('submitted_at')->nullable();

            // Set once HR reviews the submission and creates the real employee record.
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_employee_id')->nullable()->constrained('employees')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_invites');
    }
};
