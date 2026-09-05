<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['draft', 'confirmed', 'payment_received', 'in_production', 'ready', 'delivered', 'cancelled'])
                ->default('draft')
                ->change();
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])
                ->default('unpaid')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['draft', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled'])
                ->default('draft')
                ->change();
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])
                ->default('unpaid')
                ->change();
        });
    }
};
