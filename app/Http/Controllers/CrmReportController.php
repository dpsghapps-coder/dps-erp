<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Carbon\Carbon;

class CrmReportController extends Controller
{
    public function index()
    {
        $stats = [
            'total_clients' => Client::count(),
            'leads' => Client::where('status', 'lead')->count(),
            'prospects' => Client::where('status', 'prospect')->count(),
            'active' => Client::where('status', 'active')->count(),
            'inactive' => Client::where('status', 'inactive')->count(),
        ];

        $won = Client::where('pipeline_stage', 'converted')->count();
        $lost = Client::where('pipeline_stage', 'lost')->count();
        $conversionRate = $won + $lost > 0
            ? round(($won / ($won + $lost)) * 100, 1)
            : 0;

        $pipelineStages = Client::PIPELINE_STAGES;
        $pipelineFunnel = [];
        foreach ($pipelineStages as $stage) {
            $pipelineFunnel[$stage] = Client::where('pipeline_stage', $stage)->count();
        }

        $openStages = ['new_lead', 'contacted', 'meeting_scheduled', 'proposal_sent', 'negotiating'];
        $pipelineValue = (float) Client::whereIn('pipeline_stage', $openStages)->sum('estimated_value');
        $wonValue = (float) Client::where('pipeline_stage', 'converted')->sum('estimated_value');

        $lostReasons = Client::where('pipeline_stage', 'lost')
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

        return inertia('CRM/Reports', [
            'stats' => $stats,
            'conversionRate' => $conversionRate,
            'won' => $won,
            'lost' => $lost,
            'pipelineFunnel' => $pipelineFunnel,
            'pipelineValue' => $pipelineValue,
            'wonValue' => $wonValue,
            'lostReasons' => $lostReasons,
            'monthlyClients' => $monthlyClients,
            'sources' => $sources,
            'industries' => $industries,
            'recentClients' => $recentClients,
        ]);
    }
}
