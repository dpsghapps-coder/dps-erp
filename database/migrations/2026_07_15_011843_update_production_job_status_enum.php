<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('production_jobs')->where('status', 'queued')->update(['status' => 'new_jobs']);
        DB::table('production_jobs')->where('status', 'in_progress')->update(['status' => 'printing']);

        Schema::table('production_jobs', function (Blueprint $table) {
            $table->string('status')->default('new_jobs')->change();
        });
    }

    public function down(): void
    {
        DB::table('production_jobs')->where('status', 'new_jobs')->update(['status' => 'queued']);
        DB::table('production_jobs')->where('status', 'printing')->update(['status' => 'in_progress']);

        Schema::table('production_jobs', function (Blueprint $table) {
            $table->enum('status', ['queued', 'in_progress', 'paused', 'completed', 'cancelled'])->default('queued')->change();
        });
    }
};
