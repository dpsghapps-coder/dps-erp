<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            if (! Schema::hasColumn('departments', 'code')) {
                $table->string('code')->nullable()->unique()->after('name');
            }
            if (! Schema::hasColumn('departments', 'description')) {
                $table->text('description')->nullable()->after('code');
            }
            if (! Schema::hasColumn('departments', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn(['code', 'description', 'is_active']);
        });
    }
};
