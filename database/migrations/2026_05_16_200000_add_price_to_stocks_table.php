<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->default(0)->after('qty_purchased');
            $table->decimal('total_cost', 12, 2)->default(0)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn(['price', 'total_cost']);
        });
    }
};
