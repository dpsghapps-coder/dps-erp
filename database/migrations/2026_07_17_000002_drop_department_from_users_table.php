<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (config('database.default') === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');

            $columns = Schema::getColumnListing('users');
            $keep = array_diff($columns, ['department', 'department_manager_id']);

            DB::transaction(function () use ($keep) {
                DB::statement('CREATE TABLE users_backup AS SELECT '.implode(', ', array_map(fn ($c) => "`$c`", $keep)).' FROM users');
                DB::statement('DROP TABLE users');
                DB::statement('ALTER TABLE users_backup RENAME TO users');
            });

            DB::statement('PRAGMA foreign_keys = ON');
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['department_manager_id']);
                $table->dropColumn(['department', 'department_manager_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('department')->nullable()->after('is_active');
            $table->foreignId('department_manager_id')->nullable()->after('department')->constrained('users')->nullOnDelete();
        });
    }
};
