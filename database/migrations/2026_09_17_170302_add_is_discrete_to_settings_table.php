<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            // Only meaningful for uom_* rows: a discrete UOM (e.g. Pieces) has
            // no "amount per pack" to measure, so Qty per Unit is locked to 1
            // on the Add Purchase form instead of being a real multiplier.
            $table->boolean('is_discrete')->default(false)->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn('is_discrete');
        });
    }
};
