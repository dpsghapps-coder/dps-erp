<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_request_item_cost_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_request_item_id')
                ->constrained('purchase_request_items', 'id', 'pr_item_cost_items_pri_id_fk')
                ->onDelete('cascade');
            $table->string('label');
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_request_item_cost_items');
    }
};
