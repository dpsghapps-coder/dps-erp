<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductionJob;
use App\Models\StudioBooking;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $canViewProduction = $request->user()->hasPermission('production.view');

        $stats = [
            'total_clients' => Client::count(),
            'active_clients' => Client::whereNotNull('first_converted_at')->count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'draft')->count(),
            'production_jobs' => $canViewProduction ? ProductionJob::whereNotIn('status', [
                ProductionJob::STATUS_COMPLETED,
                ProductionJob::STATUS_PAUSED,
                ProductionJob::STATUS_CANCELLED,
            ])->count() : null,
            'studio_bookings' => StudioBooking::whereIn('status', ['tentative', 'confirmed'])
                ->where('start_datetime', '>=', now())
                ->count(),
            'total_products' => Product::count(),
            'total_employees' => Employee::whereNull('date_terminated')->count(),
        ];

        $recent_orders = Order::with('client')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recent_jobs = $canViewProduction
            ? ProductionJob::with('assignedTo')->orderBy('created_at', 'desc')->limit(5)->get()
            : null;

        return inertia('Dashboard', [
            'stats' => $stats,
            'recent_orders' => $recent_orders,
            'recent_jobs' => $recent_jobs,
        ]);
    }
}
