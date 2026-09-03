<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_types', function (Blueprint $table) {
            $table->foreignId('staff_level_id')->nullable()->after('name')->constrained('staff_levels')->nullOnDelete();
        });

        DB::statement('UPDATE leave_types SET staff_level_id = level_id');

        Schema::table('leave_types', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->dropColumn('level_id');
        });

        Schema::dropIfExists('levels');
    }

    public function down(): void
    {
        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::table('leave_types', function (Blueprint $table) {
            $table->foreignId('level_id')->constrained('levels')->onDelete('cascade');
        });

        Schema::table('leave_types', function (Blueprint $table) {
            $table->dropForeign(['staff_level_id']);
            $table->dropColumn('staff_level_id');
        });
    }
};
