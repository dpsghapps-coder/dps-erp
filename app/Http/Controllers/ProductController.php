<?php

namespace App\Http\Controllers;

use App\Models\InventoryProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        $categories = ProductCategory::all();

        return inertia('Products/Index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        $categories = ProductCategory::all();
        $inventoryProducts = InventoryProduct::where('item_status', 'Active')
            ->orderBy('description')
            ->get();
        $services = Service::where('is_active', true)
            ->orderBy('name')
            ->get();

        return inertia('Products/Create', [
            'categories' => $categories,
            'inventoryProducts' => $inventoryProducts,
            'services' => $services,
            'nextSku' => Product::generateSku(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|unique:products|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:physical,service,digital',
            'category_id' => 'nullable|exists:product_categories,id',
            'unit' => 'required|string|max:30',
            'is_active' => 'boolean',
            'components' => 'nullable|array',
            'components.*.component_id' => 'required|integer',
            'components.*.component_type' => 'required|in:App\Models\InventoryProduct,App\Models\Service',
            'components.*.quantity' => 'required|numeric|min:0.01',
        ]);

        $product = Product::create([
            'sku' => $validated['sku'],
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
                ]);
            }
        }

        return redirect()->route('products.index')->with('success', 'Product created successfully');
    }

    public function edit(Product $product)
    {
        $categories = ProductCategory::all();
        $product->load('components.component');

        $inventoryProducts = InventoryProduct::where('item_status', 'Active')
            ->orderBy('description')
            ->get();
        $services = Service::where('is_active', true)
            ->orderBy('name')
            ->get();

        return inertia('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'inventoryProducts' => $inventoryProducts,
            'services' => $services,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'sku' => 'required|string|unique:products,sku,'.$product->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:physical,service,digital',
            'category_id' => 'nullable|exists:product_categories,id',
            'unit' => 'required|string|max:30',
            'is_active' => 'boolean',
            'components' => 'nullable|array',
            'components.*.component_id' => 'required|integer',
            'components.*.component_type' => 'required|in:App\Models\InventoryProduct,App\Models\Service',
            'components.*.quantity' => 'required|numeric|min:0.01',
        ]);

        $product->update([
            'sku' => $validated['sku'],
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
}
