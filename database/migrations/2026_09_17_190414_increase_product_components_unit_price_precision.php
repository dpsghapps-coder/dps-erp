<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Raw SQL rather than Blueprint::change() -- that requires doctrine/dbal,
     * which isn't installed and can't be added on the no-composer production server.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE product_components MODIFY unit_price DECIMAL(12, 4) NOT NULL DEFAULT 0');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE product_components MODIFY unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0');
    }
};
