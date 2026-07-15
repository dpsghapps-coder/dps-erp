<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryProduct;
use App\Models\ProductCategory;
use App\Models\Requisition;
use App\Models\Stock;
use App\Models\Supplier;
use App\Models\SupplierBranch;

class InventoryController extends Controller
{
    public function index()
    {
        $totalSuppliers = Supplier::count();
        $totalBranches = SupplierBranch::count();
        $totalMaterials = InventoryProduct::count();
        $activeMaterials = InventoryProduct::where('item_status', 'Active')->count();
        $disabledMaterials = InventoryProduct::where('item_status', 'Disabled')->count();

        $stockOnHand = Stock::sum('qty_purchased');

        $pendingRequisitions = Requisition::where('status', 'pending')->count();
        $categoriesCount = ProductCategory::count();

        $lowStockCount = InventoryProduct::with(['stocks', 'approvedRequisitions'])
            ->get()
            ->filter(fn ($p) => $p->restock_threshold > 0 && $p->available_stock <= $p->restock_threshold)
            ->count();

        $recentStock = Stock::with('product')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $recentRequisitions = Requisition::with('product')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $materialsByCategory = InventoryProduct::selectRaw('item_category, count(*) as total')
            ->whereNotNull('item_category')
            ->groupBy('item_category')
            ->orderByDesc('total')
            ->get();

        return inertia('Inventory/Index', [
            'totalSuppliers' => $totalSuppliers,
            'totalBranches' => $totalBranches,
            'totalMaterials' => $totalMaterials,
            'activeMaterials' => $activeMaterials,
            'disabledMaterials' => $disabledMaterials,
            'stockOnHand' => $stockOnHand,
            'pendingRequisitions' => $pendingRequisitions,
            'categoriesCount' => $categoriesCount,
            'lowStockCount' => $lowStockCount,
            'materialsByCategory' => $materialsByCategory,
            'recentStock' => $recentStock,
            'recentRequisitions' => $recentRequisitions,
        ]);
    }
}
