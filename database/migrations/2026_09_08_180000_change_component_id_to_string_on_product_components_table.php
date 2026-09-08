<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * component_id was created via morphs() as an unsignedBigInteger, but
     * InventoryProduct (a valid component_type) uses a UUID primary key, so
     * a material could never actually be attached as a product component.
     * Widen it to a string so it can hold both Service's integer ids and
     * InventoryProduct's UUIDs.
     */
    public function up(): void
    {
        Schema::table('product_components', function (Blueprint $table) {
            // The composite unique below is the only index covering product_id,
            // so it's what satisfies the product_id foreign key. Give the FK a
            // dedicated index first, or dropping the unique fails MySQL error 1553.
            $table->index('product_id', 'product_components_product_id_fk_index');
            $table->dropUnique('product_components_product_id_component_id_component_type_unique');
            $table->dropIndex('product_components_component_type_component_id_index');
        });

        Schema::table('product_components', function (Blueprint $table) {
            $table->string('component_id')->change();
        });

        Schema::table('product_components', function (Blueprint $table) {
            $table->unique(['product_id', 'component_id', 'component_type']);
            $table->index(['component_type', 'component_id']);
            $table->dropIndex('product_components_product_id_fk_index');
        });
    }

    public function down(): void
    {
        Schema::table('product_components', function (Blueprint $table) {
            $table->index('product_id', 'product_components_product_id_fk_index');
            $table->dropUnique('product_components_product_id_component_id_component_type_unique');
            $table->dropIndex('product_components_component_type_component_id_index');
        });

        Schema::table('product_components', function (Blueprint $table) {
            $table->unsignedBigInteger('component_id')->change();
        });

        Schema::table('product_components', function (Blueprint $table) {
            $table->unique(['product_id', 'component_id', 'component_type']);
            $table->index(['component_type', 'component_id']);
            $table->dropIndex('product_components_product_id_fk_index');
        });
    }
};
