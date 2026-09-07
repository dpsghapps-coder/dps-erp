<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Deal;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function store(Client $client)
    {
        $type = $client->isExistingClient() ? 'repeat_business' : 'new_business';

        if ($client->hasOpenDeal($type)) {
            return back()->with('error', 'This client already has an active '.($type === 'repeat_business' ? 'sales campaign' : 'lead').' in the pipeline.');
        }

        $stage = $type === 'repeat_business' ? 'contacted' : 'new_lead';

        $client->deals()->create([
            'type' => $type,
            'stage' => $stage,
            'created_by' => auth()->id(),
        ]);

        $client->interactions()->create([
            'user_id' => auth()->id(),
            'type' => 'note',
            'subject' => 'Sales campaign started',
            'body' => $type === 'repeat_business'
                ? 'New repeat-business deal started, entering the pipeline at Contacted.'
                : 'Client added to the pipeline as a New Lead.',
            'occurred_at' => now(),
        ]);

        return back()->with('success', 'Sales campaign started');
    }

    public function updateStatus(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'stage' => 'required|in:'.implode(',', Deal::STAGES),
            'lost_reason' => 'nullable|string|max:100',
            'lost_note' => 'nullable|string',
            'next_follow_up_at' => 'nullable|date',
            'status' => 'nullable|in:'.implode(',', Client::TIERS),
        ]);

        $previousStage = $deal->stage;
        $newStage = $validated['stage'];

        if ($newStage === 'converted' && $deal->type === 'new_business' && empty($validated['status'])) {
            return back()->with('error', 'A tier must be assigned when converting a new client.');
        }

        $update = ['stage' => $newStage];

        if (array_key_exists('next_follow_up_at', $validated)) {
            $update['next_follow_up_at'] = $validated['next_follow_up_at'];
        }

        if ($newStage === 'lost') {
            $update['lost_reason'] = $validated['lost_reason'] ?? null;
            $update['lost_note'] = $validated['lost_note'] ?? null;
            $update['lost_at'] = now();
        }

        if ($newStage === 'converted') {
            $update['converted_at'] = now();
        }

        $deal->update($update);

        $client = $deal->client;

        if ($newStage !== $previousStage) {
            if ($newStage === 'lost') {
                $client->interactions()->create([
                    'user_id' => auth()->id(),
                    'type' => 'note',
                    'subject' => 'Lead marked as lost',
                    'body' => 'Reason: '.($validated['lost_reason'] ?? 'Not specified')
                        .(! empty($validated['lost_note']) ? ' — '.$validated['lost_note'] : ''),
                    'occurred_at' => now(),
                ]);
            } elseif ($newStage === 'converted' && $deal->type === 'new_business') {
                $client->update([
                    'status' => $validated['status'],
                    'first_converted_at' => $client->first_converted_at ?? now(),
                ]);

                $client->interactions()->create([
                    'user_id' => auth()->id(),
                    'type' => 'note',
                    'subject' => 'New client converted',
                    'body' => 'Deal won — assigned '.ucfirst($validated['status']).' tier.',
                    'occurred_at' => now(),
                ]);
            } elseif ($newStage === 'converted' && $deal->type === 'repeat_business') {
                $client->interactions()->create([
                    'user_id' => auth()->id(),
                    'type' => 'note',
                    'subject' => 'Repeat deal closed',
                    'body' => 'Repeat-business deal won.',
                    'occurred_at' => now(),
                ]);
            } else {
                $client->interactions()->create([
                    'user_id' => auth()->id(),
                    'type' => 'note',
                    'subject' => 'Pipeline stage updated',
                    'body' => 'Stage changed from '.(Deal::STAGE_LABELS[$previousStage] ?? 'Unset')
                        .' to '.(Deal::STAGE_LABELS[$newStage] ?? $newStage).'.',
                    'occurred_at' => now(),
                ]);
            }
        }

        return back()->with('success', 'Deal updated successfully');
    }
}
