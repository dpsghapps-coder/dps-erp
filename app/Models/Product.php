<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Product extends Model
{
    protected $fillable = [
        'sku',
        'name',
        'description',
        'type',
        'category_id',
        'unit',
        'is_active',
    ];

    protected $casts = [
        'type' => 'string',
        'is_active' => 'boolean',
    ];

    protected static function bootProduct(): void
    {
        static::creating(function (Product $product) {
            if (empty($product->sku)) {
                $product->sku = static::generateSku();
            }
        });
    }

    public static function generateSku(): string
    {
        $prefix = 'PRD';
        $latest = static::orderBy('id', 'desc')->first();
        $nextNumber = $latest ? $latest->id + 1 : 1;

        return $prefix.'-'.str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function priceListItems(): HasMany
    {
        return $this->hasMany(PriceListItem::class);
    }

    public function components(): MorphMany
    {
        return $this->morphMany(ProductComponent::class, 'product');
    }

    public function materials(): HasMany
    {
        return $this->hasManyThrough(
            InventoryProduct::class,
            ProductComponent::class,
            'product_id',
            null,
            null,
            'component_id'
        )->where('component_type', InventoryProduct::class);
    }

    public function services(): HasMany
    {
        return $this->hasManyThrough(
            Service::class,
            ProductComponent::class,
            'product_id',
            null,
            null,
            'component_id'
        )->where('component_type', Service::class);
    }

    public function getDefaultPriceAttribute()
    {
        return $this->priceListItems()
            ->whereHas('priceList', fn ($q) => $q->where('is_default', true))
            ->first()?->unit_price ?? 0;
    }

    public function calculateCost(): float
    {
        $cost = 0;
        foreach ($this->components as $component) {
            if ($component->component_type === InventoryProduct::class) {
                $cost += $component->component->unit_price * $component->quantity;
            } elseif ($component->component_type === Service::class) {
                $cost += $component->component->default_price * $component->quantity;
            }
        }

        return $cost;
    }
}

class ProductComponent extends Model
{
    protected $fillable = [
        'product_id',
        'component_type',
        'component_id',
        'quantity',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'float',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function component(): MorphTo
    {
        return $this->morphTo();
    }
}
