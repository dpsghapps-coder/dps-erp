<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::with('prices')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return inertia('Services/Index', ['services' => $services]);
    }

    public function create()
    {
        return inertia('Services/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:services|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'unit' => 'required|string|max:30',
            'is_active' => 'boolean',
            'prices' => 'nullable|array',
            'prices.*.min_qty' => 'required|integer|min:1',
            'prices.*.max_qty' => 'nullable|integer|min:1',
            'prices.*.unit_price' => 'required|numeric|min:0',
        ]);

        $service = Service::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
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
        $service->load('prices');

        return inertia('Services/Show', ['service' => $service]);
    }

    public function edit(Service $service)
    {
        $service->load('prices');

        return inertia('Services/Edit', ['service' => $service]);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:services,code,'.$service->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'unit' => 'required|string|max:30',
            'is_active' => 'boolean',
            'prices' => 'nullable|array',
            'prices.*.min_qty' => 'required|integer|min:1',
            'prices.*.max_qty' => 'nullable|integer|min:1',
            'prices.*.unit_price' => 'required|numeric|min:0',
        ]);

        $service->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? null,
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
