<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->enum('status', [
                'draft',
                'ordered',
                'purchased',
                'inspected',
                'closed',
                'cancelled',
            ])->default('draft')->change();
            $table->string('receipt_path')->nullable()->after('notes');
            $table->string('invoice_path')->nullable()->after('receipt_path');
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->enum('inspection_status', [
                'pending',
                'accepted',
                'rejected',
                'partial',
            ])->default('pending')->after('received_qty');
            $table->text('inspection_notes')->nullable()->after('inspection_status');
            $table->decimal('accepted_qty', 12, 2)->default(0)->after('inspection_notes');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->enum('status', ['draft', 'sent', 'partial', 'received', 'cancelled'])->default('draft')->change();
            $table->dropColumn(['receipt_path', 'invoice_path']);
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropColumn(['inspection_status', 'inspection_notes', 'accepted_qty']);
        });
    }
};
