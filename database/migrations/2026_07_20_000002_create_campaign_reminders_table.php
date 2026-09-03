<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->dateTime('remind_at');
            $table->boolean('sent')->default(false);
            $table->timestamps();

            $table->unique(['campaign_id', 'user_id', 'remind_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_reminders');
    }
};
