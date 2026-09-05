<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryProduct;
use App\Models\Setting;
use App\Models\Stock;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $stocks = Stock::with(['product', 'supplier', 'costItems'])
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

        $costTypes = Setting::where('key', 'like', 'extra_cost_%')->pluck('value');

        return inertia('Inventory/Stock/Index', [
            'stocks' => $stocks,
            'products' => $products,
            'stockLevels' => $stockLevels,
            'suppliers' => $suppliers,
            'categories' => $categories,
            'costTypes' => $costTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateStock($request);

        $stock = DB::transaction(function () use ($validated) {
            $stock = Stock::create([
                ...$this->stockFields($validated),
                'added_by' => auth()->user()->name ?? auth()->user()->email,
            ]);

            foreach ($validated['cost_items'] ?? [] as $item) {
                $stock->costItems()->create($item);
            }

            return $stock;
        });

        return back()->with('success', 'Stock added successfully');
    }

    public function update(Request $request, Stock $stock)
    {
        $validated = $this->validateStock($request);

        DB::transaction(function () use ($validated, $stock) {
            $stock->update($this->stockFields($validated));

            $stock->costItems()->delete();
            foreach ($validated['cost_items'] ?? [] as $item) {
                $stock->costItems()->create($item);
            }
        });

        return back()->with('success', 'Stock updated successfully');
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();

        return back()->with('success', 'Stock record deleted');
    }

    private function validateStock(Request $request): array
    {
        return $request->validate([
            'product_id' => 'required|exists:inventory_products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'units_purchased' => 'required|numeric|min:0.01',
            'qty_per_unit' => 'required|numeric|min:0.01',
            'material_cost' => 'required|numeric|min:0',
            'cost_items' => 'nullable|array',
            'cost_items.*.label' => 'required|string|max:100',
            'cost_items.*.amount' => 'required|numeric|min:0',
            'date_purchased' => 'required|date',
            'notes' => 'nullable|string',
            'purchased_by' => 'nullable|string|max:255',
        ]);
    }

    private function stockFields(array $validated): array
    {
        $qtyPurchased = $validated['units_purchased'] * $validated['qty_per_unit'];
        $totalCost = $validated['material_cost'] + collect($validated['cost_items'] ?? [])->sum('amount');

        return [
            'product_id' => $validated['product_id'],
            'supplier_id' => $validated['supplier_id'] ?? null,
            'units_purchased' => $validated['units_purchased'],
            'qty_per_unit' => $validated['qty_per_unit'],
            'qty_purchased' => $qtyPurchased,
            'material_cost' => $validated['material_cost'],
            'total_cost' => $totalCost,
            'price' => $qtyPurchased > 0 ? round($totalCost / $qtyPurchased, 2) : 0,
            'date_purchased' => $validated['date_purchased'],
            'notes' => $validated['notes'] ?? null,
            'purchased_by' => $validated['purchased_by'] ?? null,
        ];
    }
}
