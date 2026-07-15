<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->string('pr_number')->unique();
            $table->unsignedBigInteger('job_id')->nullable();
            $table->string('job_number')->nullable();
            $table->date('request_date');
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->string('department');
            $table->enum('priority', ['Low', 'Normal', 'High', 'Emergency'])->default('Normal');
            $table->date('required_by_date')->nullable();
            $table->text('purpose')->nullable();
            $table->enum('status', [
                'draft',
                'pending',
                'dept_approved',
                'finance_approved',
                'rejected',
                'queried',
                'held',
                'po_created',
                'cancelled',
            ])->default('draft');
            $table->foreignId('dept_manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('dept_manager_comment')->nullable();
            $table->foreignId('finance_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('finance_comment')->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained()->onDelete('set null');
            $table->date('postpone_until')->nullable();
            $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_requests');
    }
};
