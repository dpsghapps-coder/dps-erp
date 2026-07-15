<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $suppliers = Supplier::with('branches')->when($search, function ($query) use ($search) {
            $query->where('company_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        })
            ->orderBy('company_name', 'asc')
            ->paginate(25);

        return inertia('Inventory/Suppliers/Index', [
            'suppliers' => $suppliers,
        ]);
    }

    public function show(Supplier $supplier)
    {
        $supplier->load('branches');

        return inertia('Inventory/Suppliers/Show', [
            'supplier' => $supplier,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'branches' => 'nullable|array',
            'branches.*.name' => 'required|string|max:255',
            'branches.*.contact_name' => 'nullable|string|max:255',
            'branches.*.mobile' => 'nullable|string|max:20',
            'branches.*.email' => 'nullable|email',
            'branches.*.address' => 'nullable|string',
            'branches.*.location' => 'nullable|string|max:50',
        ]);

        if (! isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        $supplier = Supplier::create($validated);

        if ($request->has('branches')) {
            foreach ($request->input('branches', []) as $branch) {
                $supplier->branches()->create([
                    'name' => $branch['name'],
                    'contact_name' => $branch['contact_name'] ?? null,
                    'mobile' => $branch['mobile'] ?? null,
                    'email' => $branch['email'] ?? null,
                    'address' => $branch['address'] ?? null,
                    'location' => $branch['location'] ?? null,
                ]);
            }
        }

        return back()->with('success', 'Supplier created successfully');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'branches' => 'nullable|array',
            'branches.*.name' => 'required|string|max:255',
            'branches.*.contact_name' => 'nullable|string|max:255',
            'branches.*.mobile' => 'nullable|string|max:20',
            'branches.*.email' => 'nullable|email',
            'branches.*.address' => 'nullable|string',
            'branches.*.location' => 'nullable|string|max:50',
        ]);

        if (! isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        $supplier->update($validated);

        $supplier->branches()->delete();
        if ($request->has('branches')) {
            foreach ($request->input('branches', []) as $branch) {
                $supplier->branches()->create([
                    'name' => $branch['name'],
                    'contact_name' => $branch['contact_name'] ?? null,
                    'mobile' => $branch['mobile'] ?? null,
                    'email' => $branch['email'] ?? null,
                    'address' => $branch['address'] ?? null,
                    'location' => $branch['location'] ?? null,
                ]);
            }
        }

        return back()->with('success', 'Supplier updated successfully');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return back()->with('success', 'Supplier deleted successfully');
    }
}
