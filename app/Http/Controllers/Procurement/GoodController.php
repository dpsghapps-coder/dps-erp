<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Good;
use App\Models\GoodSupplierPrice;
use App\Models\ProductCategory;
use App\Models\Setting;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GoodController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $category = $request->get('category', 'all');

        $goods = Good::with(['supplier'])
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

        $suppliers = Supplier::where('is_active', true)->orderBy('company_name')->get();

        return inertia('Procurement/Goods/Index', [
            'goods' => $goods,
            'categories' => $categories,
            'uoms' => $uoms,
            'attributes' => $attributes,
            'categoryAttributes' => $categoryAttributes,
            'suppliers' => $suppliers,
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
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $validated['id'] = (string) Str::uuid();
        $validated['material_id'] = 'GOOD-'.now()->format('ymd').'-'.strtoupper(Str::random(4));

        if ($request->filled('attributes')) {
            $validated['attributes'] = json_decode($request->input('attributes'), true);
        }

        if ($request->hasFile('picture')) {
            $validated['picture'] = $request->file('picture')->store('goods', 'public');
        }

        Good::create($validated);

        return back()->with('success', 'Good created successfully');
    }

    public function show(Good $good)
    {
        $good->load(['supplierPrices.supplier.branches', 'supplierPrices.createdBy']);

        $suppliers = Supplier::with('branches')->where('is_active', true)->orderBy('company_name')->get();
        $categories = ProductCategory::with('attributes')->orderBy('name')->get(['id', 'name']);
        $uoms = Setting::where('key', 'like', 'uom_%')->pluck('value');
        $attributes = Setting::where('key', 'like', 'attr_%')->pluck('value');
        $categoryAttributes = ProductCategory::with('attributes')->get()->mapWithKeys(function ($cat) {
            return [$cat->name => $cat->attributes->pluck('value')];
        });

        return inertia('Procurement/Goods/Show', [
            'good' => $good,
            'suppliers' => $suppliers,
            'categories' => $categories,
            'uoms' => $uoms,
            'attributes' => $attributes,
            'categoryAttributes' => $categoryAttributes,
        ]);
    }

    public function update(Request $request, Good $good)
    {
        $validated = $request->validate([
            'material_id' => 'required|string|unique:goods,material_id,'.$good->id,
            'item_name' => 'required|string|max:255',
            'item_description' => 'nullable|string',
            'item_category' => 'nullable|string|max:100',
            'uom' => 'required|string|max:50',
            'item_status' => 'required|in:Active,Disabled',
            'attributes' => 'nullable|json',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'restock_threshold' => 'nullable|integer|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        if ($request->filled('attributes')) {
            $validated['attributes'] = json_decode($request->input('attributes'), true);
        }

        if ($request->hasFile('picture')) {
            $validated['picture'] = $request->file('picture')->store('goods', 'public');
        }

        if ($validated['item_status'] === 'Disabled' && $good->item_status !== 'Disabled') {
            $validated['date_deactivated'] = now();
        }

        $good->update($validated);

        return back()->with('success', 'Good updated successfully');
    }

    public function destroy(Good $good)
    {
        $good->delete();

        return redirect()->route('procurement.goods.index')->with('success', 'Good deleted successfully');
    }

    public function storeSupplierPrice(Request $request, Good $good)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
        ]);

        if ($good->supplierPrices()->where('supplier_id', $validated['supplier_id'])->exists()) {
            return back()->withErrors(['supplier_id' => 'This supplier is already linked to this good.']);
        }

        $good->supplierPrices()->create([
            'supplier_id' => $validated['supplier_id'],
            'date_created' => now(),
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Supplier added successfully');
    }

    public function destroySupplierPrice(GoodSupplierPrice $supplierPrice)
    {
        $supplierPrice->delete();

        return back()->with('success', 'Supplier removed successfully');
    }
}
