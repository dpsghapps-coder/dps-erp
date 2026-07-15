<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryProduct;
use App\Models\Stock;
use App\Models\Supplier;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $stocks = Stock::with(['product', 'supplier'])
            ->when($search, function ($query) use ($search) {
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('item_name', 'like', "%{$search}%")
                        ->orWhere('material_id', 'like', "%{$search}%");
                });
            })
            ->orderBy('date_purchased', 'desc')
            ->paginate(25);

        $products = InventoryProduct::where('item_status', 'Active')
            ->orderBy('item_name')
            ->get(['id', 'item_name', 'material_id', 'item_category']);

        $stockLevels = InventoryProduct::with(['stocks', 'approvedRequisitions'])
            ->whereHas('stocks')
            ->select([
                'id',
                'material_id',
                'item_name',
                'item_category',
                'uom',
                'restock_threshold',
            ])
            ->when($search, function ($query) use ($search) {
                $query->where('item_name', 'like', "%{$search}%")
                    ->orWhere('material_id', 'like', "%{$search}%");
            })
            ->orderBy('item_name')
            ->get()
            ->map(function ($product) {
                $lastPurchase = $product->stocks()
                    ->orderBy('date_purchased', 'desc')
                    ->value('date_purchased');
                $product->last_updated = $lastPurchase;

                return $product;
            });

        $suppliers = Supplier::orderBy('company_name')->get(['id', 'company_name']);

        $categories = InventoryProduct::where('item_status', 'Active')
            ->distinct()
            ->pluck('item_category')
            ->filter()
            ->values();

        return inertia('Inventory/Stock/Index', [
            'stocks' => $stocks,
            'products' => $products,
            'stockLevels' => $stockLevels,
            'suppliers' => $suppliers,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:inventory_products,id',
            'qty_purchased' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'date_purchased' => 'required|date',
            'notes' => 'nullable|string',
            'purchased_by' => 'nullable|string|max:255',
        ]);

        $validated['total_cost'] = $validated['qty_purchased'] * $validated['price'];
        $validated['added_by'] = auth()->user()->name ?? auth()->user()->email;

        Stock::create($validated);

        return back()->with('success', 'Stock added successfully');
    }

    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:inventory_products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'qty_purchased' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'date_purchased' => 'required|date',
            'notes' => 'nullable|string',
            'purchased_by' => 'nullable|string|max:255',
        ]);

        $validated['total_cost'] = $validated['qty_purchased'] * $validated['price'];

        $stock->update($validated);

        return back()->with('success', 'Stock updated successfully');
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();

        return back()->with('success', 'Stock record deleted');
    }
}
