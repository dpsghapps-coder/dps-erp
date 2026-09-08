<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studio_shoot_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->decimal('price', 10, 2)->nullable();
            $table->timestamps();
        });

        Schema::table('studio_bookings', function (Blueprint $table) {
            $table->foreignId('shoot_type_id')->nullable()->after('client_id')->constrained('studio_shoot_types')->nullOnDelete();
        });

        $now = now();
        DB::table('studio_shoot_types')->insert(collect([
            ['name' => 'Portrait', 'price' => 150],
            ['name' => 'Product', 'price' => 200],
            ['name' => 'Wedding', 'price' => 1500],
            ['name' => 'Event', 'price' => 800],
            ['name' => 'Corporate', 'price' => 400],
            ['name' => 'Fashion', 'price' => 600],
            ['name' => 'Family', 'price' => 250],
            ['name' => 'Real Estate', 'price' => 300],
        ])->map(fn ($type) => [
            ...$type,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all());
    }

    public function down(): void
    {
        Schema::table('studio_bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('shoot_type_id');
        });

        Schema::dropIfExists('studio_shoot_types');
    }
};
