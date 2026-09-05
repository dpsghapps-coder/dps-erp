<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->decimal('workmanship_cost', 12, 2)->default(0)->after('unit');
            $table->decimal('machine_maintenance_cost', 12, 2)->default(0)->after('workmanship_cost');
            $table->decimal('process_cost', 12, 2)->default(0)->after('machine_maintenance_cost');
            $table->decimal('capital_recovery_fee', 12, 2)->default(0)->after('process_cost');
            $table->decimal('profit', 12, 2)->default(0)->after('capital_recovery_fee');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'workmanship_cost',
                'machine_maintenance_cost',
                'process_cost',
                'capital_recovery_fee',
                'profit',
            ]);
        });
    }
};
