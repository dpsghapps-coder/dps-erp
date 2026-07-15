<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryProduct extends Model
{
    protected $table = 'inventory_products';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'material_id',
        'item_name',
        'item_description',
        'item_category',
        'uom',
        'attributes',
        'picture',
        'unit_price',
        'restock_threshold',
        'item_status',
        'date_deactivated',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'item_status' => 'string',
        'date_deactivated' => 'datetime',
        'attributes' => 'array',
    ];

    protected $appends = ['available_stock'];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class, 'product_id');
    }

    public function requisitions(): HasMany
    {
        return $this->hasMany(Requisition::class, 'product_id');
    }

    public function approvedRequisitions(): HasMany
    {
        return $this->hasMany(Requisition::class, 'product_id')->where('status', 'approved');
    }

    public function getAvailableStockAttribute(): int
    {
        $stockOnHand = $this->stocks->sum('qty_purchased');
        $committed = $this->approvedRequisitions->sum('qty_requested');

        return $stockOnHand - $committed;
    }

    public function supplierPrices(): HasMany
    {
        return $this->hasMany(MaterialSupplierPrice::class, 'material_id');
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)->first();
    }
}
