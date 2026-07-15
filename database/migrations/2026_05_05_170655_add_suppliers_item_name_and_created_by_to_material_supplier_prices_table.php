<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('material_supplier_prices', function (Blueprint $table) {
            $table->string('suppliers_item_name')->nullable()->after('price');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('date_created');
        });
    }

    public function down(): void
    {
        Schema::table('material_supplier_prices', function (Blueprint $table) {
            $table->dropColumn('suppliers_item_name');
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
        });
    }
};
