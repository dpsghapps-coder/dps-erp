<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('proformas');

        Schema::create('proformas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('number')->unique();
            $table->date('date');
            $table->date('valid_until')->nullable();
            $table->enum('status', ['draft', 'sent', 'accepted', 'rejected'])->default('draft');

            $table->json('items')->default('[]');
            $table->decimal('discount', 12, 2)->default(0);
            $table->enum('discount_type', ['percentage', 'flat'])->default('flat');
            $table->decimal('vat_rate', 5, 2)->default(20);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('vat_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('deposit_rate', 5, 2)->default(70);
            $table->decimal('deposit_amount', 12, 2)->default(0);
            $table->decimal('balance_rate', 5, 2)->default(30);
            $table->decimal('balance_amount', 12, 2)->default(0);

            $table->string('rep_name')->nullable();
            $table->text('terms')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proformas');
    }
};
