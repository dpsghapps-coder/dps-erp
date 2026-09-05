<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Validator as ValidatorContract;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $services = Service::with(['prices', 'category'])
            ->withCount('productComponents')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search');
                $q->where(function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category') && $request->category !== 'all', fn ($q) => $q->where('category_id', $request->category))
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        $categories = ProductCategory::whereHas('services')->orderBy('name')->get(['id', 'name']);

        return inertia('Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
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
        $validated = $this->validateService($request);

        $service = DB::transaction(function () use ($validated) {
            $service = Service::create([
                'code' => Service::generateCode(),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
                'unit' => $validated['unit'],
                'is_active' => $validated['is_active'] ?? true,
                ...$this->costFields($validated),
            ]);

            foreach ($this->pricesWithCalculatedBase($validated, $service) as $price) {
                $service->prices()->create($price);
            }

            return $service;
        });

        return redirect()->route('services.index')->with('success', 'Service created successfully');
    }

    public function show(Service $service)
    {
        $service->load(['prices', 'category'])->loadCount('productComponents');

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
        $validated = $this->validateService($request);

        DB::transaction(function () use ($validated, $service) {
            $service->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
                'unit' => $validated['unit'],
                'is_active' => $validated['is_active'] ?? true,
                ...$this->costFields($validated),
            ]);

            $service->prices()->delete();
            foreach ($this->pricesWithCalculatedBase($validated, $service) as $price) {
                $service->prices()->create($price);
            }
        });

        return redirect()->route('services.index')->with('success', 'Service updated successfully');
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->route('services.index')->with('success', 'Service deleted successfully');
    }

    private function costFields(array $validated): array
    {
        return collect(Service::COST_FIELDS)
            ->mapWithKeys(fn ($field) => [$field => $validated[$field] ?? 0])
            ->all();
    }

    private function pricesWithCalculatedBase(array $validated, Service $service): array
    {
        $prices = $validated['prices'] ?? [];

        if (empty($prices)) {
            $prices[] = ['min_qty' => 1, 'max_qty' => null, 'unit_price' => 0];
        }

        $prices[0]['min_qty'] = 1;
        $prices[0]['unit_price'] = $service->calculated_base_price;

        return $prices;
    }

    private function validateService(Request $request): array
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:product_categories,id',
            'unit' => 'required|string|max:30',
            'is_active' => 'boolean',
            'workmanship_cost' => 'nullable|numeric|min:0',
            'machine_maintenance_cost' => 'nullable|numeric|min:0',
            'process_cost' => 'nullable|numeric|min:0',
            'capital_recovery_fee' => 'nullable|numeric|min:0',
            'profit' => 'nullable|numeric|min:0',
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
