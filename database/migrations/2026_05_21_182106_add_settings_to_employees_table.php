<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->foreignId('employment_type_id')->nullable()->constrained('employment_types')->nullOnDelete();
            // Drop old enum employment_type
            $table->dropColumn('employment_type');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->enum('employment_type', ['full_time', 'part_time', 'contract'])->default('full_time');
            $table->dropForeign(['level_id']);
            $table->dropForeign(['employment_type_id']);
            $table->dropColumn(['level_id', 'employment_type_id']);
        });
    }
};
