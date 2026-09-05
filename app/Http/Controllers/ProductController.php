<?php

namespace App\Http\Controllers;

use App\Models\InventoryProduct;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Validator as ValidatorContract;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'components.component', 'prices'])
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
        $validated = $this->validateProduct($request);

        DB::transaction(function () use ($validated) {
            $product = Product::create([
                'sku' => Product::generateSku(),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'],
                'category_id' => $validated['category_id'] ?? null,
                'unit' => $validated['unit'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            $this->syncComponents($product, $validated['components'] ?? []);

            foreach ($this->pricesWithCalculatedBase($validated, $product) as $price) {
                $product->prices()->create($price);
            }

            return $product;
        });

        return redirect()->route('products.index')->with('success', 'Product created successfully');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'components.component', 'prices']);

        return inertia('Products/Show', [
            'product' => $product,
            'totalCost' => $product->calculateCost(),
        ]);
    }

    public function edit(Product $product)
    {
        $categories = ProductCategory::all();
        $product->load(['components.component', 'prices']);

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
        $validated = $this->validateProduct($request);

        DB::transaction(function () use ($validated, $product) {
            $product->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'],
                'category_id' => $validated['category_id'] ?? null,
                'unit' => $validated['unit'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            $this->syncComponents($product, $validated['components'] ?? []);

            $product->prices()->delete();
            foreach ($this->pricesWithCalculatedBase($validated, $product) as $price) {
                $product->prices()->create($price);
            }
        });

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

    private function syncComponents(Product $product, array $components): void
    {
        $product->components()->delete();

        foreach ($components as $component) {
            $product->components()->create([
                'component_id' => $component['component_id'],
                'component_type' => $component['component_type'],
                'quantity' => $component['quantity'],
                'unit_price' => $component['unit_price'],
            ]);
        }

        $product->unsetRelation('components');
    }

    private function pricesWithCalculatedBase(array $validated, Product $product): array
    {
        $prices = $validated['prices'] ?? [];

        if (empty($prices)) {
            $prices[] = ['min_qty' => 1, 'max_qty' => null, 'unit_price' => 0];
        }

        $prices[0]['min_qty'] = 1;
        $prices[0]['unit_price'] = $product->calculateCost();

        return $prices;
    }

    private function validateProduct(Request $request): array
    {
        $validator = Validator::make($request->all(), [
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
            'prices' => 'nullable|array',
            'prices.*.min_qty' => 'required|integer|min:1',
            'prices.*.max_qty' => 'nullable|integer|min:1',
            'prices.*.unit_price' => 'required|numeric|min:0',
        ]);

        $validator->after(function (ValidatorContract $validator) use ($request) {
            $this->validateNoOverlappingTiers($request->input('prices', []), $validator);
        });

        return $validator->validate();
    }

    private function validateNoOverlappingTiers(array $prices, ValidatorContract $validator): void
    {
        $ranges = [];

        foreach ($prices as $i => $price) {
            if (! isset($price['min_qty'])) {
                continue;
            }

            $min = (int) $price['min_qty'];
            $max = isset($price['max_qty']) && $price['max_qty'] !== null && $price['max_qty'] !== ''
                ? (int) $price['max_qty']
                : PHP_INT_MAX;

            if ($max < $min) {
                $validator->errors()->add("prices.$i.max_qty", 'Max quantity must be greater than or equal to min quantity.');

                continue;
            }

            foreach ($ranges as [$existingMin, $existingMax, $existingIndex]) {
                if ($min <= $existingMax && $max >= $existingMin) {
                    $tierNumber = $existingIndex + 1;
                    $validator->errors()->add("prices.$i.min_qty", "This tier's quantity range overlaps with tier #{$tierNumber}.");
                }
            }

            $ranges[] = [$min, $max, $i];
        }
    }
}
