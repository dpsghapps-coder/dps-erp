<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Deal;
use Illuminate\Http\Request;

class CrmLeadController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->get('filter', 'all');
        $view = $request->get('view', 'list');

        $engagedStages = ['contacted', 'meeting_scheduled', 'proposal_sent', 'negotiating'];

        $query = Deal::with(['client' => function ($q) {
            $q->withCount('interactions')->with(['lastInteraction', 'primaryContact']);
        }]);

        if ($view === 'board') {
            // Board view needs every deal, both types, all stages — except
            // converted/lost deals older than the visibility window, which
            // drop off the Kanban to keep those terminal columns from piling
            // up. This only hides them from the board; the records (and
            // their audit/interaction history) are untouched.
            $query->where(function ($q) {
                $q->whereNotIn('stage', ['converted', 'lost'])
                    ->orWhere('converted_at', '>=', now()->subHours(Deal::TERMINAL_VISIBLE_HOURS))
                    ->orWhere('lost_at', '>=', now()->subHours(Deal::TERMINAL_VISIBLE_HOURS));
            });
        } else {
            // List view: both new-business leads and repeat-business sales
            // campaigns — i.e. every deal that also appears on the Kanban
            // board, minus the terminal (converted/lost) stages.
            $query->whereIn('stage', Deal::OPEN_STAGES);

            if ($filter === 'lead') {
                $query->where('stage', 'new_lead');
            } elseif ($filter === 'prospect') {
                $query->whereIn('stage', $engagedStages);
            }
        }

        $deals = $query->get();

        $eligibleForCampaign = Client::whereDoesntHave('deals', fn ($q) => $q->whereIn('stage', Deal::OPEN_STAGES))
            ->orderBy('company_name')
            ->get(['id', 'company_name', 'first_converted_at']);

        $openDeals = Deal::whereIn('stage', Deal::OPEN_STAGES);

        $stats = [
            'total' => (clone $openDeals)->count(),
            'leads' => Deal::where('stage', 'new_lead')->count(),
            'prospects' => Deal::whereIn('stage', $engagedStages)->count(),
            'dueToday' => (clone $openDeals)->whereDate('next_follow_up_at', today())->count(),
            'pipelineValue' => (float) (clone $openDeals)->sum('estimated_value'),
            'openDeals' => (clone $openDeals)->count(),
            'won' => Deal::where('stage', 'converted')->count(),
            'lost' => Deal::where('stage', 'lost')->count(),
        ];

        return inertia('CRM/Leads', [
            'deals' => $deals,
            'eligibleForCampaign' => $eligibleForCampaign,
            'stats' => $stats,
            'currentFilter' => $filter,
            'currentView' => $view,
            'terminalVisibleHours' => Deal::TERMINAL_VISIBLE_HOURS,
        ]);
    }
}
