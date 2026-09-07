<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_levels', function (Blueprint $table) {
            $table->boolean('is_manager')->default(false)->after('sort_order');
        });

        // Backfill the levels the manager picker previously matched by hardcoded name.
        DB::table('staff_levels')
            ->whereIn('name', ['Managing Director', 'General Manager', 'Manager'])
            ->update(['is_manager' => true]);
    }

    public function down(): void
    {
        Schema::table('staff_levels', function (Blueprint $table) {
            $table->dropColumn('is_manager');
        });
    }
};
