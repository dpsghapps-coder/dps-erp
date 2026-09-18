<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Opt-in per product, not a blanket "any non-discrete UOM" rule --
            // lets the Order form's Length x Breadth calculator show only
            // where it's actually meaningful (e.g. a custom cut-to-size item).
            $table->boolean('requires_dimensions')->default(false)->after('unit');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->boolean('requires_dimensions')->default(false)->after('unit');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('requires_dimensions');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('requires_dimensions');
        });
    }
};
