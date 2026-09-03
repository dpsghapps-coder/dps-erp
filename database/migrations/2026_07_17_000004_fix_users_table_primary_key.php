<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF');

        DB::statement('CREATE TABLE users_fixed (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            email_verified_at TIMESTAMP,
            password TEXT,
            role_id INTEGER,
            is_active INTEGER DEFAULT 1,
            remember_token TEXT,
            created_at TIMESTAMP,
            updated_at TIMESTAMP,
            employee_id INTEGER
        )');

        DB::statement('INSERT INTO users_fixed (id, name, email, email_verified_at, password, role_id, is_active, remember_token, created_at, updated_at, employee_id)
            SELECT id, name, email, email_verified_at, password, role_id, is_active, remember_token, created_at, updated_at, employee_id FROM users');

        DB::statement('DROP TABLE users');
        DB::statement('ALTER TABLE users_fixed RENAME TO users');

        DB::statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');

        DB::statement('PRAGMA foreign_keys = ON');
    }

    public function down(): void
    {
        //
    }
};
