<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('good_supplier_prices', function (Blueprint $table) {
            $table->id();
            $table->uuid('good_id');
            $table->unsignedBigInteger('supplier_id');
            $table->decimal('price', 12, 2)->default(0);
            $table->timestamp('collection')->nullable();
            $table->date('date_created')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('good_id')->references('id')->on('goods')->onDelete('cascade');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->unique(['good_id', 'supplier_id'], 'good_supp_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('good_supplier_prices');
    }
};
