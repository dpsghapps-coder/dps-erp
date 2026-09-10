<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Client;
use App\Models\Deal;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CrmReportController extends Controller
{
    public function index(Request $request)
    {
        $stats = [
            'total_clients' => Client::count(),
            'bronze' => Client::where('status', 'bronze')->count(),
            'silver' => Client::where('status', 'silver')->count(),
            'gold' => Client::where('status', 'gold')->count(),
            'platinum' => Client::where('status', 'platinum')->count(),
        ];

        $newBusinessWon = Deal::where('type', 'new_business')->where('stage', 'converted')->count();
        $repeatBusinessWon = Deal::where('type', 'repeat_business')->where('stage', 'converted')->count();
        $won = $newBusinessWon + $repeatBusinessWon;
        $lost = Deal::where('stage', 'lost')->count();
        $conversionRate = $won + $lost > 0
            ? round(($won / ($won + $lost)) * 100, 1)
            : 0;

        $pipelineFunnel = [];
        foreach (Deal::STAGES as $stage) {
            $pipelineFunnel[$stage] = Deal::where('stage', $stage)->count();
        }

        $pipelineValue = (float) Deal::whereIn('stage', Deal::OPEN_STAGES)->sum('estimated_value');
        $wonValue = (float) Deal::where('stage', 'converted')->sum('estimated_value');

        $overdueFollowUps = Deal::whereIn('stage', Deal::OPEN_STAGES)
            ->whereNotNull('next_follow_up_at')
            ->where('next_follow_up_at', '<', now())
            ->count();

        $upcomingFollowUps = Deal::whereIn('stage', Deal::OPEN_STAGES)
            ->whereNotNull('next_follow_up_at')
            ->whereBetween('next_follow_up_at', [now(), now()->addDays(7)])
            ->count();

        $lostReasons = Deal::where('stage', 'lost')
            ->whereNotNull('lost_reason')
            ->selectRaw('lost_reason, count(*) as count')
            ->groupBy('lost_reason')
            ->pluck('count', 'lost_reason')
            ->toArray();

        // Monthly new clients (last 12 months)
        $monthlyClients = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $count = Client::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            $monthlyClients[] = [
                'month' => $month->format('M Y'),
                'count' => $count,
            ];
        }

        // Clients by source
        $sources = Client::whereNotNull('source')
            ->selectRaw('source, count(*) as count')
            ->groupBy('source')
            ->pluck('count', 'source')
            ->toArray();

        // Clients by industry
        $industries = Client::whereNotNull('industry')
            ->selectRaw('industry, count(*) as count')
            ->groupBy('industry')
            ->pluck('count', 'industry')
            ->toArray();

        // Recent clients
        $recentClients = Client::orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'company_name', 'status', 'created_at']);

        $marketing = null;
        if ($request->user()->hasPermission('marketing.view')) {
            $marketing = [
                'total' => Campaign::count(),
                'active' => Campaign::where('status', 'active')->count(),
                'scheduled' => Campaign::where('status', 'scheduled')->count(),
                'completed' => Campaign::where('status', 'completed')->count(),
                'totalBudget' => (float) Campaign::sum('budget'),
                'totalSpent' => (float) Campaign::sum('actual_cost'),
                'byType' => Campaign::selectRaw('type, count(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray(),
                'recentCampaigns' => Campaign::orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(['id', 'number', 'title', 'type', 'status', 'start_date', 'budget']),
            ];
        }

        return inertia('CRM/Reports', [
            'stats' => $stats,
            'conversionRate' => $conversionRate,
            'won' => $won,
            'newBusinessWon' => $newBusinessWon,
            'repeatBusinessWon' => $repeatBusinessWon,
            'lost' => $lost,
            'pipelineFunnel' => $pipelineFunnel,
            'pipelineValue' => $pipelineValue,
            'wonValue' => $wonValue,
            'overdueFollowUps' => $overdueFollowUps,
            'upcomingFollowUps' => $upcomingFollowUps,
            'marketing' => $marketing,
            'lostReasons' => $lostReasons,
            'monthlyClients' => $monthlyClients,
            'sources' => $sources,
            'industries' => $industries,
            'recentClients' => $recentClients,
        ]);
    }
}
