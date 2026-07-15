<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Good;
use App\Models\ProductCategory;
use App\Models\Setting;
use App\Models\Supplier;

class GoodEditController extends Controller
{
    public function __invoke(Good $good)
    {
        $good->load(['supplierPrices.supplier.branches']);

        $suppliers = Supplier::with('branches')->where('is_active', true)->orderBy('company_name')->get();
        $categories = ProductCategory::with('attributes')->orderBy('name')->get(['id', 'name']);
        $uoms = Setting::where('key', 'like', 'uom_%')->pluck('value');
        $attributes = Setting::where('key', 'like', 'attr_%')->pluck('value');
        $categoryAttributes = ProductCategory::with('attributes')->get()->mapWithKeys(function ($cat) {
            return [$cat->name => $cat->attributes->pluck('value')];
        });

        return inertia('Procurement/Goods/Edit', [
            'good' => $good,
            'suppliers' => $suppliers,
            'categories' => $categories,
            'uoms' => $uoms,
            'attributes' => $attributes,
            'categoryAttributes' => $categoryAttributes,
        ]);
    }
}
