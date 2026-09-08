<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('studio_bookings', function (Blueprint $table) {
            $table->decimal('rate', 10, 2)->nullable()->after('notes');
            $table->decimal('deposit_amount', 10, 2)->nullable()->after('rate');
            $table->boolean('deposit_paid')->default(false)->after('deposit_amount');
            $table->foreignId('invoice_id')->nullable()->after('order_id')->constrained('invoices')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('studio_bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('invoice_id');
            $table->dropColumn(['rate', 'deposit_amount', 'deposit_paid']);
        });
    }
};
