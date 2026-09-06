<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use App\Models\Concerns\GeneratesSequentialCode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class InventoryProduct extends Model
{
    use Auditable, GeneratesSequentialCode, SoftDeletes;

    protected $table = 'inventory_products';

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function booted(): void
    {
        static::creating(function (InventoryProduct $model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }

            if (empty($model->code)) {
                $model->code = static::generateCode();
            }
        });
    }

    public static function generateCode(): string
    {
        return static::nextSequentialCode('MAT', 'code', 5);
    }

    protected $fillable = [
        'id',
        'code',
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

    protected $appends = ['available_stock', 'default_price', 'primary_supplier', 'unit_cost'];

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

    public function getUnitCostAttribute(): float
    {
        return (float) ($this->stocks()
            ->orderBy('date_purchased', 'desc')
            ->orderBy('created_at', 'desc')
            ->first()?->price ?? 0);
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
