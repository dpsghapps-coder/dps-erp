<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('material_supplier_prices', function (Blueprint $table) {
            $table->dropColumn(['price', 'collection', 'suppliers_item_name']);
        });
    }

    public function down(): void
    {
        Schema::table('material_supplier_prices', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->nullable()->after('supplier_id');
            $table->timestamp('collection')->nullable()->after('price');
            $table->string('suppliers_item_name')->nullable()->after('collection');
        });
    }
};
