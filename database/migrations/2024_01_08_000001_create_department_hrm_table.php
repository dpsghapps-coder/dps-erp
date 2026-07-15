<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('departments')) {
            Schema::create('departments', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->nullable()->unique();
                $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (Schema::hasTable('employees') && ! Schema::hasColumn('employees', 'department_id')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('departments')) {
            Schema::table('employees', function (Blueprint $table) {
                if (Schema::hasColumn('employees', 'department_id')) {
                    $table->dropForeign(['department_id']);
                }
            });
            Schema::dropIfExists('departments');
        }
    }
};
