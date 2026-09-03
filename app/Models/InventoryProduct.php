<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class InventoryProduct extends Model
{
    protected $table = 'inventory_products';

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (InventoryProduct $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'id',
        'material_id',
        'item_name',
        'item_description',
        'item_category',
        'uom',
        'attributes',
        'picture',
        'restock_threshold',
        'item_status',
        'date_deactivated',
    ];

    protected $casts = [
        'item_status' => 'string',
        'date_deactivated' => 'datetime',
        'attributes' => 'array',
    ];

    protected $appends = ['available_stock', 'default_price', 'primary_supplier'];

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

    public function prices(): HasMany
    {
        return $this->hasMany(MaterialPrice::class, 'material_id');
    }

    public function getDefaultPriceAttribute()
    {
        return $this->prices()
            ->orderBy('collection_date', 'desc')
            ->first()?->price ?? 0;
    }

    public function getPrimarySupplierAttribute()
    {
        return $this->supplierPrices()
            ->with('supplier')
            ->latest('date_created')
            ->first()?->supplier;
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)->firstOrFail();
    }
}
