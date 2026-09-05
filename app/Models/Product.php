<?php

namespace App\Models;

use App\Models\Concerns\GeneratesSequentialCode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Product extends Model
{
    use GeneratesSequentialCode;

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

    protected $appends = ['default_price', 'calculated_base_price'];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Product $product) {
            if (empty($product->sku)) {
                $product->sku = static::generateSku();
            }
        });
    }

    public static function generateSku(): string
    {
        return static::nextSequentialCode('PRD', 'sku', 5);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function priceListItems(): HasMany
    {
        return $this->hasMany(PriceListItem::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function components(): HasMany
    {
        return $this->hasMany(ProductComponent::class);
    }

    public function materials(): HasManyThrough
    {
        return $this->hasManyThrough(
            InventoryProduct::class,
            ProductComponent::class,
            'product_id',
            'id',
            null,
            'component_id'
        )->where('component_type', InventoryProduct::class);
    }

    public function services(): HasManyThrough
    {
        return $this->hasManyThrough(
            Service::class,
            ProductComponent::class,
            'product_id',
            'id',
            null,
            'component_id'
        )->where('component_type', Service::class);
    }

    public function getDefaultPriceAttribute()
    {
        return $this->prices()
            ->where('min_qty', '<=', 1)
            ->orderBy('min_qty', 'desc')
            ->first()?->unit_price ?? 0;
    }

    public function getCalculatedBasePriceAttribute(): float
    {
        return $this->calculateCost();
    }

    public function getPriceForQuantity(int $quantity): ?float
    {
        $price = $this->prices()
            ->where('min_qty', '<=', $quantity)
            ->where(function ($q) use ($quantity) {
                $q->whereNull('max_qty')
                    ->orWhere('max_qty', '>=', $quantity);
            })
            ->orderBy('min_qty', 'desc')
            ->first();

        return $price?->unit_price;
    }

    public function calculateCost(): float
    {
        return (float) $this->components->sum(fn (ProductComponent $component) => $component->unit_price * $component->quantity);
    }
}
