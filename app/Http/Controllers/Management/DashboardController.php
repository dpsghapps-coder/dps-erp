<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Models\Decision;
use App\Models\DecisionActionItem;
use App\Models\Meeting;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $pendingDecisions = Decision::where('status', 'proposed')->count();
        $approvedThisMonth = Decision::where('status', 'approved')
            ->whereMonth('updated_at', now()->month)
            ->count();
        $overdueActions = DecisionActionItem::where('status', 'pending')
            ->where('due_date', '<', now())
            ->count();
        $completedThisWeek = DecisionActionItem::where('status', 'completed')
            ->where('updated_at', '>=', now()->startOfWeek())
            ->count();

        $decisionsByCategory = Decision::selectRaw('category_id, count(*) as count')
            ->whereNotNull('category_id')
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->map(fn ($d) => ['name' => $d->category->name ?? 'Uncategorized', 'value' => $d->count]);

        $decisionsByStatus = Decision::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn ($d) => ['name' => str_replace('_', ' ', ucfirst($d->status)), 'value' => $d->count]);

        $recentDecisions = Decision::with(['category', 'createdBy'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $overdueActionItems = DecisionActionItem::with(['decision', 'assignedTo'])
            ->where('status', 'pending')
            ->where('due_date', '<', now())
            ->orderBy('due_date')
            ->limit(5)
            ->get();

        return inertia('Management/Dashboard', [
            'stats' => [
                'pending_decisions' => $pendingDecisions,
                'approved_this_month' => $approvedThisMonth,
                'overdue_actions' => $overdueActions,
                'completed_this_week' => $completedThisWeek,
            ],
            'decisionsByCategory' => $decisionsByCategory,
            'decisionsByStatus' => $decisionsByStatus,
            'recentDecisions' => $recentDecisions,
            'overdueActionItems' => $overdueActionItems,
        ]);
    }
}
