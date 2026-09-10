<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\ClientSource;
use App\Models\Industry;
use App\Models\Neighbourhood;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CrmSettingController extends Controller
{
    private const TYPES = [
        'sources' => ClientSource::class,
        'industries' => Industry::class,
        'regions' => Region::class,
        'cities' => City::class,
        'neighbourhoods' => Neighbourhood::class,
    ];

    public function index()
    {
        $lists = collect(self::TYPES)->map(
            fn (string $modelClass) => $modelClass::ordered()->get()
        );

        return inertia('CRM/Settings/Index', [
            'sources' => $lists['sources'],
            'industries' => $lists['industries'],
            'regions' => $lists['regions'],
            'cities' => $lists['cities'],
            'neighbourhoods' => $lists['neighbourhoods'],
        ]);
    }

    public function store(Request $request, string $type)
    {
        $modelClass = $this->resolveType($type);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique((new $modelClass())->getTable(), 'name')],
        ]);

        $maxSortOrder = $modelClass::max('sort_order') ?? -1;

        $modelClass::create([
            'name' => $validated['name'],
            'is_active' => true,
            'sort_order' => $maxSortOrder + 1,
        ]);

        return back()->with('success', 'Added successfully');
    }

    public function update(Request $request, string $type, int $id)
    {
        $modelClass = $this->resolveType($type);
        $item = $modelClass::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique($item->getTable(), 'name')->ignore($item->id)],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $item->update([
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? $item->is_active,
        ]);

        return back()->with('success', 'Updated successfully');
    }

    public function destroy(string $type, int $id)
    {
        $modelClass = $this->resolveType($type);
        $modelClass::findOrFail($id)->delete();

        return back()->with('success', 'Removed successfully');
    }

    private function resolveType(string $type): string
    {
        abort_unless(array_key_exists($type, self::TYPES), 404);

        return self::TYPES[$type];
    }
}
