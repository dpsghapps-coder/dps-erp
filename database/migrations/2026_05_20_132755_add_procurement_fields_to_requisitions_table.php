<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->uuid('product_id')->nullable()->change();
            $table->string('material_name')->nullable()->after('product_id');
            $table->text('material_attributes')->nullable()->after('material_name');
            $table->string('assignee')->nullable()->after('department');
        });
    }

    public function down(): void
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->uuid('product_id')->nullable(false)->change();
            $table->dropColumn(['material_name', 'material_attributes', 'assignee']);
        });
    }
};
