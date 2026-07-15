<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->uuid('good_id')->nullable()->after('product_id');
            $table->foreign('good_id')->references('id')->on('goods')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropForeign(['good_id']);
            $table->dropColumn('good_id');
        });
    }
};
