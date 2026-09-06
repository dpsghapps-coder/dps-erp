<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('financial_account_id')->nullable()->after('reference')->constrained('accounts')->nullOnDelete();
            $table->foreignId('journal_entry_id')->nullable()->after('financial_account_id')->constrained('journal_entries')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('financial_account_id');
            $table->dropConstrainedForeignId('journal_entry_id');
        });
    }
};
