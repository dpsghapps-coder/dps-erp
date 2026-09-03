<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::with(['prices', 'category'])
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return inertia('Services/Index', ['services' => $services]);
    }

    public function create()
    {
        return inertia('Services/Create', [
            'categories' => ProductCategory::orderBy('name')->get(),
            'uoms' => Setting::where('key', 'like', 'uom_%')->pluck('value'),
            'nextCode' => Service::generateCode(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:product_categories,id',
            'unit' => 'required|string|max:30',
            'is_active' => 'boolean',
            'prices' => 'nullable|array',
            'prices.*.min_qty' => 'required|integer|min:1',
            'prices.*.max_qty' => 'nullable|integer|min:1',
            'prices.*.unit_price' => 'required|numeric|min:0',
        ]);

        $service = Service::create([
            'code' => Service::generateCode(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'unit' => $validated['unit'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['prices'])) {
            foreach ($validated['prices'] as $price) {
                $service->prices()->create($price);
            }
        }

        return redirect()->route('services.index')->with('success', 'Service created successfully');
    }

    public function show(Service $service)
    {
        $service->load(['prices', 'category']);

        return inertia('Services/Show', ['service' => $service]);
    }

    public function edit(Service $service)
    {
        $service->load('prices');

        return inertia('Services/Edit', [
            'service' => $service,
            'categories' => ProductCategory::orderBy('name')->get(),
            'uoms' => Setting::where('key', 'like', 'uom_%')->pluck('value'),
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:product_categories,id',
            'unit' => 'required|string|max:30',
            'is_active' => 'boolean',
            'prices' => 'nullable|array',
            'prices.*.min_qty' => 'required|integer|min:1',
            'prices.*.max_qty' => 'nullable|integer|min:1',
            'prices.*.unit_price' => 'required|numeric|min:0',
        ]);

        $service->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category_id' => $validated['category_id'] ?? null,
            'unit' => $validated['unit'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (isset($validated['prices'])) {
            $service->prices()->delete();
            foreach ($validated['prices'] as $price) {
                $service->prices()->create($price);
            }
        }

        return redirect()->route('services.index')->with('success', 'Service updated successfully');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->route('services.index')->with('success', 'Service deleted successfully');
    }
}
