<?php

namespace App\Http\Controllers;

use App\Models\InventoryProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'components.component'])
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        $products->getCollection()->each(function (Product $product) {
            $product->total_value = $product->calculateCost();
        });

        $categories = ProductCategory::all();

        return inertia('Products/Index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    private function inStockMaterials()
    {
        return InventoryProduct::where('item_status', 'Active')
            ->orderBy('item_name')
            ->get()
            ->filter(fn (InventoryProduct $item) => $item->available_stock > 0)
            ->values();
    }

    public function create()
    {
        $categories = ProductCategory::all();
        $services = Service::where('is_active', true)
            ->orderBy('name')
            ->get();

        return inertia('Products/Create', [
            'categories' => $categories,
            'inventoryProducts' => $this->inStockMaterials(),
            'services' => $services,
            'uoms' => Setting::where('key', 'like', 'uom_%')->pluck('value'),
            'nextSku' => Product::generateSku(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:physical,service,digital',
            'category_id' => 'nullable|exists:product_categories,id',
            'unit' => 'required|string|max:30',
            'is_active' => 'boolean',
            'components' => 'nullable|array',
            'components.*.component_id' => 'required',
            'components.*.component_type' => 'required|in:App\Models\InventoryProduct,App\Models\Service',
            'components.*.quantity' => 'required|numeric|min:0.01',
            'components.*.unit_price' => 'required|numeric|min:0',
        ]);

        $product = Product::create([
            'sku' => Product::generateSku(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'category_id' => $validated['category_id'] ?? null,
            'unit' => $validated['unit'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['components'])) {
            foreach ($validated['components'] as $component) {
                $product->components()->create([
                    'component_id' => $component['component_id'],
                    'component_type' => $component['component_type'],
                    'quantity' => $component['quantity'],
                    'unit_price' => $component['unit_price'],
                ]);
            }
        }

        return redirect()->route('products.index')->with('success', 'Product created successfully');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'components.component']);

        return inertia('Products/Show', [
            'product' => $product,
            'totalCost' => $product->calculateCost(),
        ]);
    }

    public function edit(Product $product)
    {
        $categories = ProductCategory::all();
        $product->load('components.component');

        $services = Service::where('is_active', true)
            ->orderBy('name')
            ->get();

        return inertia('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'inventoryProducts' => $this->inStockMaterials(),
            'services' => $services,
            'uoms' => Setting::where('key', 'like', 'uom_%')->pluck('value'),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:physical,service,digital',
            'category_id' => 'nullable|exists:product_categories,id',
            'unit' => 'required|string|max:30',
            'is_active' => 'boolean',
            'components' => 'nullable|array',
            'components.*.component_id' => 'required',
            'components.*.component_type' => 'required|in:App\Models\InventoryProduct,App\Models\Service',
            'components.*.quantity' => 'required|numeric|min:0.01',
            'components.*.unit_price' => 'required|numeric|min:0',
        ]);

        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'category_id' => $validated['category_id'] ?? null,
            'unit' => $validated['unit'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (isset($validated['components'])) {
            $product->components()->delete();
            foreach ($validated['components'] as $component) {
                $product->components()->create([
                    'component_id' => $component['component_id'],
                    'component_type' => $component['component_type'],
                    'quantity' => $component['quantity'],
                    'unit_price' => $component['unit_price'],
                ]);
            }
        }

        return redirect()->route('products.index')->with('success', 'Product updated successfully');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted successfully');
    }

    public function calculators()
    {
        return inertia('Products/Calculators');
    }
}
