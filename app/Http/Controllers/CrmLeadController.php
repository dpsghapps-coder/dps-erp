<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class CrmLeadController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->get('filter', 'all');
        $view = $request->get('view', 'list');

        $query = Client::with(['lastInteraction', 'primaryContact'])
            ->withCount('interactions')
            ->orderBy('company_name');

        if ($view === 'board') {
            // Board view needs all statuses
        } else {
            $query->whereIn('status', ['lead', 'prospect']);
        }

        if ($filter === 'lead') {
            $query->where('status', 'lead');
        } elseif ($filter === 'prospect') {
            $query->where('status', 'prospect');
        }

        $clients = $query->get();

        $openStages = ['new_lead', 'contacted', 'meeting_scheduled', 'proposal_sent', 'negotiating'];

        $stats = [
            'total' => Client::whereIn('status', ['lead', 'prospect'])->count(),
            'leads' => Client::where('status', 'lead')->count(),
            'prospects' => Client::where('status', 'prospect')->count(),
            'dueToday' => Client::whereIn('status', ['lead', 'prospect'])
                ->whereDate('next_follow_up_at', today())
                ->count(),
            'pipelineValue' => (float) Client::whereIn('pipeline_stage', $openStages)->sum('estimated_value'),
            'openDeals' => Client::whereIn('pipeline_stage', $openStages)->count(),
            'won' => Client::where('pipeline_stage', 'converted')->count(),
            'lost' => Client::where('pipeline_stage', 'lost')->count(),
        ];

        return inertia('CRM/Leads', [
            'clients' => $clients,
            'stats' => $stats,
            'currentFilter' => $filter,
            'currentView' => $view,
        ]);
    }
}
