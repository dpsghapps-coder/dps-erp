<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Proforma;
use App\Models\Service;

class SalesOverviewController extends Controller
{
    public function index()
    {
        $productStats = [
            'total' => Product::count(),
            'active' => Product::where('is_active', true)->count(),
        ];

        $serviceStats = [
            'total' => Service::count(),
            'active' => Service::where('is_active', true)->count(),
        ];

        $categoryBreakdown = ProductCategory::withCount(['products', 'services'])
            ->orderBy('name')
            ->get()
            ->filter(fn ($category) => $category->products_count > 0 || $category->services_count > 0)
            ->map(fn ($category) => [
                'name' => $category->name,
                'products_count' => $category->products_count,
                'services_count' => $category->services_count,
            ])
            ->values();

        $proformaStats = [
            'total' => Proforma::count(),
            'total_value' => (float) Proforma::sum('total'),
            'by_status' => Proforma::selectRaw('status, count(*) as count, sum(total) as value')
                ->groupBy('status')
                ->get()
                ->keyBy('status')
                ->map(fn ($row) => ['count' => (int) $row->count, 'value' => (float) $row->value]),
        ];

        $recentProformas = Proforma::with('client:id,company_name')
            ->latest()
            ->limit(6)
            ->get(['id', 'client_id', 'number', 'status', 'total', 'date']);

        return inertia('Sales/Overview', [
            'productStats' => $productStats,
            'serviceStats' => $serviceStats,
            'categoryBreakdown' => $categoryBreakdown,
            'proformaStats' => $proformaStats,
            'recentProformas' => $recentProformas,
        ]);
    }
}
