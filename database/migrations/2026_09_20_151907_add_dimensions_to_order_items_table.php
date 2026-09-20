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
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('length', 10, 2)->nullable()->after('description');
            $table->decimal('breadth', 10, 2)->nullable()->after('length');
            $table->string('dimension_unit', 4)->nullable()->after('breadth');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['length', 'breadth', 'dimension_unit']);
        });
    }
};
