<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected array $tables = [
        'clients',
        'contacts',
        'proformas',
        'products',
        'services',
        'suppliers',
        'inventory_products',
        'stocks',
        'requisitions',
        'production_jobs',
        'goods',
        'purchase_requests',
        'invoices',
        'bills',
        'assets',
        'accounts',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->softDeletes();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropSoftDeletes();
            });
        }
    }
};
