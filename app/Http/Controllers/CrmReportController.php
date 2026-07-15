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

        $conversionRate = $stats['prospects'] + $stats['active'] > 0
            ? round(($stats['active'] / ($stats['prospects'] + $stats['active'])) * 100, 1)
            : 0;

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
            'monthlyClients' => $monthlyClients,
            'sources' => $sources,
            'industries' => $industries,
            'recentClients' => $recentClients,
        ]);
    }
}
