<?php

namespace App\Http\Controllers;

use App\Models\ProductionJob;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProductionReportController extends Controller
{
    public function index()
    {
        $stats = [];
        foreach (ProductionJob::ALL_STATUSES as $status) {
            $stats[$status] = ProductionJob::where('status', $status)->count();
        }

        $totalJobs = ProductionJob::count();

        $overdueCount = ProductionJob::whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->whereNotIn('status', [ProductionJob::STATUS_COMPLETED, ProductionJob::STATUS_CANCELLED])
            ->count();

        $completedDurations = ProductionJob::where('status', ProductionJob::STATUS_COMPLETED)
            ->whereNotNull('started_at')
            ->whereNotNull('completed_at')
            ->get(['started_at', 'completed_at'])
            ->map(fn ($job) => $job->started_at->diffInHours($job->completed_at));
        $avgCompletionHours = $completedDurations->isNotEmpty() ? $completedDurations->avg() : 0;

        $priorityBreakdown = [
            'low' => ProductionJob::where('priority', 'low')->count(),
            'normal' => ProductionJob::where('priority', 'normal')->count(),
            'high' => ProductionJob::where('priority', 'high')->count(),
            'urgent' => ProductionJob::where('priority', 'urgent')->count(),
        ];

        // Monthly jobs created (last 12 months)
        $monthlyJobs = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthJobs = ProductionJob::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month);
            $monthlyJobs[] = [
                'month' => $month->format('M Y'),
                'count' => (clone $monthJobs)->count(),
                'completed' => (clone $monthJobs)->where('status', ProductionJob::STATUS_COMPLETED)->count(),
            ];
        }

        $workload = DB::table('production_jobs')
            ->join('users', 'users.id', '=', 'production_jobs.assigned_to')
            ->whereNotIn('production_jobs.status', [ProductionJob::STATUS_COMPLETED, ProductionJob::STATUS_CANCELLED])
            ->selectRaw('users.id, users.name, COUNT(*) as job_count')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('job_count')
            ->limit(8)
            ->get();

        $recentJobs = ProductionJob::with(['assignedTo:id,name', 'order:id,order_number'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'job_number', 'title', 'order_id', 'status', 'priority', 'assigned_to', 'due_date', 'created_at']);

        return inertia('Production/Reports', [
            'stats' => $stats,
            'totalJobs' => $totalJobs,
            'overdueCount' => $overdueCount,
            'avgCompletionHours' => round($avgCompletionHours, 1),
            'priorityBreakdown' => $priorityBreakdown,
            'monthlyJobs' => $monthlyJobs,
            'workload' => $workload,
            'recentJobs' => $recentJobs,
        ]);
    }
}
