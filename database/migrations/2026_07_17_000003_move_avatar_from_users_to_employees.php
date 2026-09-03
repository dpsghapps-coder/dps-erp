<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('email');
        });

        $userAvatars = DB::table('users')
            ->whereNotNull('avatar')
            ->whereNotNull('employee_id')
            ->select('employee_id', 'avatar')
            ->get();

        foreach ($userAvatars as $row) {
            DB::table('employees')
                ->where('id', $row->employee_id)
                ->update(['avatar' => $row->avatar]);
        }

        if (config('database.default') === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');

            $columns = Schema::getColumnListing('users');
            $keep = array_diff($columns, ['avatar']);

            DB::transaction(function () use ($keep) {
                DB::statement('CREATE TABLE users_backup AS SELECT '.implode(', ', array_map(fn ($c) => "`$c`", $keep)).' FROM users');
                DB::statement('DROP TABLE users');
                DB::statement('ALTER TABLE users_backup RENAME TO users');
            });

            DB::statement('PRAGMA foreign_keys = ON');
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('avatar');
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('employee_id');
        });

        $employeeAvatars = DB::table('employees')
            ->whereNotNull('avatar')
            ->select('id', 'user_id', 'avatar')
            ->whereNotNull('user_id')
            ->get();

        foreach ($employeeAvatars as $row) {
            DB::table('users')
                ->where('id', $row->user_id)
                ->update(['avatar' => $row->avatar]);
        }

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });
    }
};
