<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderReportController extends Controller
{
    public function index()
    {
        $stats = [
            'total_orders' => Order::count(),
            'draft' => Order::where('status', 'draft')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'payment_received' => Order::where('status', 'payment_received')->count(),
            'in_production' => Order::where('status', 'in_production')->count(),
            'ready' => Order::where('status', 'ready')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
        ];

        $activeOrders = Order::where('status', '!=', 'cancelled');
        $activeCount = (clone $activeOrders)->count();
        $totalRevenue = (float) (clone $activeOrders)->sum('grand_total');
        $avgOrderValue = $activeCount > 0 ? round($totalRevenue / $activeCount, 2) : 0;

        $paymentStatus = [
            'unpaid' => Order::where('payment_status', 'unpaid')->count(),
            'partial' => Order::where('payment_status', 'partial')->count(),
            'paid' => Order::where('payment_status', 'paid')->count(),
        ];

        // Monthly orders (last 12 months)
        $monthlyOrders = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthOrders = Order::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month);
            $monthlyOrders[] = [
                'month' => $month->format('M Y'),
                'count' => (clone $monthOrders)->count(),
                'revenue' => (float) (clone $monthOrders)->where('status', '!=', 'cancelled')->sum('grand_total'),
            ];
        }

        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.status', '!=', 'cancelled')
            ->where('order_items.product_type', Product::class)
            ->selectRaw('products.id, products.name, SUM(order_items.qty) as total_qty, SUM(order_items.line_total) as total_revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_revenue')
            ->limit(8)
            ->get();

        $topClients = DB::table('orders')
            ->join('clients', 'clients.id', '=', 'orders.client_id')
            ->where('orders.status', '!=', 'cancelled')
            ->selectRaw('clients.id, clients.company_name, COUNT(*) as order_count, SUM(orders.grand_total) as total_revenue')
            ->groupBy('clients.id', 'clients.company_name')
            ->orderByDesc('total_revenue')
            ->limit(8)
            ->get();

        $recentOrders = Order::with('client:id,company_name')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'order_number', 'client_id', 'status', 'grand_total', 'created_at']);

        return inertia('Orders/Reports', [
            'stats' => $stats,
            'totalRevenue' => $totalRevenue,
            'avgOrderValue' => $avgOrderValue,
            'paymentStatus' => $paymentStatus,
            'monthlyOrders' => $monthlyOrders,
            'topProducts' => $topProducts,
            'topClients' => $topClients,
            'recentOrders' => $recentOrders,
        ]);
    }
}
