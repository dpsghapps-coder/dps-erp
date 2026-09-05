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
            // Board view needs every deal, both types, all stages
        } else {
            $query->where('type', 'new_business')->whereIn('stage', Deal::OPEN_STAGES);

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

        $newBusinessOpen = Deal::where('type', 'new_business')->whereIn('stage', Deal::OPEN_STAGES);

        $stats = [
            'total' => (clone $newBusinessOpen)->count(),
            'leads' => Deal::where('type', 'new_business')->where('stage', 'new_lead')->count(),
            'prospects' => Deal::where('type', 'new_business')->whereIn('stage', $engagedStages)->count(),
            'dueToday' => (clone $newBusinessOpen)->whereDate('next_follow_up_at', today())->count(),
            'pipelineValue' => (float) (clone $newBusinessOpen)->sum('estimated_value'),
            'openDeals' => (clone $newBusinessOpen)->count(),
            'won' => Deal::where('stage', 'converted')->count(),
            'lost' => Deal::where('stage', 'lost')->count(),
        ];

        return inertia('CRM/Leads', [
            'deals' => $deals,
            'eligibleForCampaign' => $eligibleForCampaign,
            'stats' => $stats,
            'currentFilter' => $filter,
            'currentView' => $view,
        ]);
    }
}
