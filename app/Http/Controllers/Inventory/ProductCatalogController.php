<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryProduct;
use App\Models\MaterialSupplierPrice;
use App\Models\ProductCategory;
use App\Models\Setting;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductCatalogController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $category = $request->get('category', 'all');

        $products = InventoryProduct::with(['supplier', 'supplierPrices.supplier', 'approvedRequisitions', 'stocks'])
            ->when($search, function ($query) use ($search) {
                $query->where('item_name', 'like', "%{$search}%")
                    ->orWhere('material_id', 'like', "%{$search}%");
            })
            ->when($status !== 'all', function ($query) use ($status) {
                $query->where('item_status', $status);
            })
            ->when($category !== 'all', function ($query) use ($category) {
                $query->where('item_category', $category);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        $categories = ProductCategory::with('attributes')->orderBy('name')->get(['id', 'name']);
        $uoms = Setting::where('key', 'like', 'uom_%')->pluck('value');
        $attributes = Setting::where('key', 'like', 'attr_%')->pluck('value');
        $categoryAttributes = ProductCategory::with('attributes')->get()->mapWithKeys(function ($cat) {
            return [$cat->name => $cat->attributes->pluck('value')];
        });

        return inertia('Inventory/ProductCatalog/Index', [
            'products' => $products,
            'categories' => $categories,
            'uoms' => $uoms,
            'attributes' => $attributes,
            'categoryAttributes' => $categoryAttributes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'item_description' => 'nullable|string',
            'item_category' => 'nullable|string|max:100',
            'uom' => 'required|string|max:50',
            'item_status' => 'required|in:Active,Disabled',
            'attributes' => 'nullable|json',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'restock_threshold' => 'nullable|integer|min:0',
        ]);

        $validated['material_id'] = 'MAT-'.now()->format('ymd').'-'.strtoupper(Str::random(4));

        if ($request->filled('attributes')) {
            $validated['attributes'] = json_decode($request->input('attributes'), true);
        }

        if ($request->hasFile('picture')) {
            $validated['picture'] = $request->file('picture')->store('materials', 'public');
        }

        $product = InventoryProduct::create($validated);

        // Save supplier prices if provided
        if ($request->has('supplier_prices')) {
            foreach ($request->input('supplier_prices', []) as $priceData) {
                if (! empty($priceData['supplier_id']) && ! empty($priceData['price'])) {
                    $product->supplierPrices()->create([
                        'supplier_id' => $priceData['supplier_id'],
                        'price' => $priceData['price'],
                        'suppliers_item_name' => $priceData['suppliers_item_name'] ?? null,
                        'collection' => $priceData['collection'] ?? null,
                        'date_created' => $priceData['date_created'] ?? now(),
                        'created_by' => auth()->id(),
                    ]);
                }
            }
        }

        return back()->with('success', 'Material created successfully');
    }

    public function update(Request $request, InventoryProduct $product)
    {
        $validated = $request->validate([
            'material_id' => 'required|string|unique:inventory_products,material_id,'.$product->id,
            'item_name' => 'required|string|max:255',
            'item_description' => 'nullable|string',
            'item_category' => 'nullable|string|max:100',
            'uom' => 'required|string|max:50',
            'item_status' => 'required|in:Active,Disabled',
            'attributes' => 'nullable|json',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'restock_threshold' => 'nullable|integer|min:0',
        ]);

        if ($request->filled('attributes')) {
            $validated['attributes'] = json_decode($request->input('attributes'), true);
        }

        if ($request->hasFile('picture')) {
            $validated['picture'] = $request->file('picture')->store('materials', 'public');
        }

        if ($validated['item_status'] === 'Disabled' && $product->item_status !== 'Disabled') {
            $validated['date_deactivated'] = now();
        }

        $product->update($validated);

        // Update supplier prices if provided
        if ($request->has('supplier_prices')) {
            $product->supplierPrices()->delete();
            foreach ($request->input('supplier_prices', []) as $priceData) {
                if (! empty($priceData['supplier_id']) && ! empty($priceData['price'])) {
                    $product->supplierPrices()->create([
                        'supplier_id' => $priceData['supplier_id'],
                        'price' => $priceData['price'],
                        'suppliers_item_name' => $priceData['suppliers_item_name'] ?? null,
                        'collection' => $priceData['collection'] ?? null,
                        'date_created' => $priceData['date_created'] ?? now(),
                        'created_by' => auth()->id(),
                    ]);
                }
            }
        }

        return back()->with('success', 'Material updated successfully');
    }

    public function updateThreshold(Request $request, InventoryProduct $product)
    {
        $validated = $request->validate([
            'restock_threshold' => 'required|integer|min:0',
        ]);

        $product->update($validated);

        return back()->with('success', 'Restock threshold updated successfully');
    }

    public function destroy(InventoryProduct $product)
    {
        $product->delete();

        return redirect()->route('inventory.materials')->with('success', 'Material deleted successfully');
    }

    public function show(InventoryProduct $product)
    {
        $product->load(['supplierPrices.supplier.branches', 'supplierPrices.createdBy', 'approvedRequisitions', 'stocks']);

        $suppliers = Supplier::with('branches')->where('is_active', true)->orderBy('company_name')->get();
        $categories = ProductCategory::with('attributes')->orderBy('name')->get(['id', 'name']);
        $uoms = Setting::where('key', 'like', 'uom_%')->pluck('value');
        $attributes = Setting::where('key', 'like', 'attr_%')->pluck('value');
        $categoryAttributes = ProductCategory::with('attributes')->get()->mapWithKeys(function ($cat) {
            return [$cat->name => $cat->attributes->pluck('value')];
        });

        return inertia('Inventory/ProductCatalog/Show', [
            'product' => $product,
            'suppliers' => $suppliers,
            'categories' => $categories,
            'uoms' => $uoms,
            'attributes' => $attributes,
            'categoryAttributes' => $categoryAttributes,
        ]);
    }

    public function storeSupplierPrice(Request $request, InventoryProduct $product)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        $product->supplierPrices()->create([
            'supplier_id' => $validated['supplier_id'],
            'date_created' => now(),
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Supplier added successfully');
    }

    public function updateSupplierPrice(Request $request, MaterialSupplierPrice $supplierPrice)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        $supplierPrice->update($validated);

        return back()->with('success', 'Supplier updated successfully');
    }

    public function destroySupplierPrice(MaterialSupplierPrice $supplierPrice)
    {
        $supplierPrice->delete();

        return back()->with('success', 'Supplier removed successfully');
    }

    public function edit(InventoryProduct $product)
    {
        $product->load(['supplierPrices.supplier.branches', 'stocks']);

        $suppliers = Supplier::with('branches')->where('is_active', true)->orderBy('company_name')->get();
        $categories = ProductCategory::with('attributes')->orderBy('name')->get(['id', 'name']);
        $uoms = Setting::where('key', 'like', 'uom_%')->pluck('value');
        $attributes = Setting::where('key', 'like', 'attr_%')->pluck('value');
        $categoryAttributes = ProductCategory::with('attributes')->get()->mapWithKeys(function ($cat) {
            return [$cat->name => $cat->attributes->pluck('value')];
        });

        return inertia('Inventory/ProductCatalog/Edit', [
            'product' => $product,
            'suppliers' => $suppliers,
            'categories' => $categories,
            'uoms' => $uoms,
            'attributes' => $attributes,
            'categoryAttributes' => $categoryAttributes,
        ]);
    }
}
