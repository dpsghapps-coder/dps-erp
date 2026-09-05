<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            $table->string('code')->nullable()->unique()->after('material_id');
        });

        DB::table('inventory_products')
            ->orderBy('created_at')
            ->select('id')
            ->get()
            ->each(function ($product, $index) {
                DB::table('inventory_products')
                    ->where('id', $product->id)
                    ->update(['code' => 'MAT-'.str_pad((string) ($index + 1), 5, '0', STR_PAD_LEFT)]);
            });
    }

    public function down(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
