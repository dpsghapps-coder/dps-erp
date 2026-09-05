<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['new_business', 'repeat_business']);
            $table->enum('stage', ['new_lead', 'contacted', 'meeting_scheduled', 'proposal_sent', 'negotiating', 'converted', 'lost'])
                ->default('new_lead');
            $table->decimal('estimated_value', 12, 2)->default(0);
            $table->string('lost_reason')->nullable();
            $table->text('lost_note')->nullable();
            $table->dateTime('next_follow_up_at')->nullable();
            $table->dateTime('converted_at')->nullable();
            $table->dateTime('lost_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dateTime('first_converted_at')->nullable()->after('status');
        });

        $clients = DB::table('clients')->whereNotNull('pipeline_stage')->get();

        foreach ($clients as $client) {
            DB::table('deals')->insert([
                'client_id' => $client->id,
                'type' => 'new_business',
                'stage' => $client->pipeline_stage,
                'estimated_value' => $client->estimated_value ?? 0,
                'lost_reason' => $client->lost_reason,
                'lost_note' => $client->lost_note,
                'next_follow_up_at' => $client->next_follow_up_at,
                'converted_at' => $client->pipeline_stage === 'converted' ? $client->updated_at : null,
                'lost_at' => $client->pipeline_stage === 'lost' ? $client->updated_at : null,
                'created_by' => null,
                'created_at' => $client->created_at,
                'updated_at' => $client->updated_at,
            ]);

            if ($client->pipeline_stage === 'converted') {
                DB::table('clients')->where('id', $client->id)->update([
                    'first_converted_at' => $client->updated_at,
                ]);
            }
        }

        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['pipeline_stage', 'lost_reason', 'lost_note', 'estimated_value', 'next_follow_up_at']);
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->enum('status', ['bronze', 'silver', 'gold', 'platinum'])->nullable()->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->enum('status', ['bronze', 'silver', 'gold', 'platinum'])->default('bronze')->change();
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->enum('pipeline_stage', ['new_lead', 'contacted', 'meeting_scheduled', 'proposal_sent', 'negotiating', 'converted', 'lost'])->nullable();
            $table->string('lost_reason')->nullable();
            $table->text('lost_note')->nullable();
            $table->decimal('estimated_value', 12, 2)->default(0);
            $table->dateTime('next_follow_up_at')->nullable();
        });

        $deals = DB::table('deals')->where('type', 'new_business')->get();
        foreach ($deals as $deal) {
            DB::table('clients')->where('id', $deal->client_id)->update([
                'pipeline_stage' => $deal->stage,
                'lost_reason' => $deal->lost_reason,
                'lost_note' => $deal->lost_note,
                'estimated_value' => $deal->estimated_value,
                'next_follow_up_at' => $deal->next_follow_up_at,
            ]);
        }

        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('first_converted_at');
        });

        Schema::dropIfExists('deals');
    }
};
