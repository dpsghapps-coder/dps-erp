<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studio_resources', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['studio_room', 'camera', 'lighting', 'prop', 'vehicle']);
            $table->text('description')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });

        Schema::create('studio_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference')->unique();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['tentative', 'confirmed', 'in_progress', 'completed', 'cancelled'])->default('tentative');
            $table->dateTime('start_datetime');
            $table->dateTime('end_datetime');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('studio_booking_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('studio_booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('studio_resource_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['studio_booking_id', 'studio_resource_id']);
        });

        Schema::create('studio_crew', function (Blueprint $table) {
            $table->id();
            $table->foreignId('studio_booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role_in_shoot');
            $table->timestamps();

            $table->unique(['studio_booking_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('studio_crew');
        Schema::dropIfExists('studio_booking_resources');
        Schema::dropIfExists('studio_bookings');
        Schema::dropIfExists('studio_resources');
    }
};
