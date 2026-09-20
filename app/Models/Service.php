<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use App\Models\Concerns\GeneratesSequentialCode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use Auditable, GeneratesSequentialCode, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category_id',
        'unit',
        'requires_dimensions',
        'is_active',
    ];

    protected $casts = [
        'requires_dimensions' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $appends = ['default_price', 'calculated_base_price'];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Service $service) {
            if (empty($service->code)) {
                $service->code = static::generateCode();
            }
        });
    }

    public static function generateCode(): string
    {
        return static::nextSequentialCode('SRV', 'code', 5);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ServicePrice::class);
    }

    public function costItems(): HasMany
    {
        return $this->hasMany(ServiceCostItem::class);
    }

    public function productComponents(): MorphMany
    {
        return $this->morphMany(ProductComponent::class, 'component');
    }

    public function getCalculatedBasePriceAttribute(): float
    {
        return (float) $this->costItems->sum('amount');
    }

    public function getDefaultPriceAttribute()
    {
        return $this->prices()
            ->where('min_qty', '<=', 1)
            ->orderBy('min_qty', 'desc')
            ->first()?->unit_price ?? 0;
    }

    public function getPriceForQuantity(float $quantity): ?float
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
}

class ServicePrice extends Model
{
    protected $fillable = [
        'service_id',
        'min_qty',
        'max_qty',
        'unit_price',
    ];

    protected $casts = [
        'min_qty' => 'integer',
        'max_qty' => 'integer',
        'unit_price' => 'float',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
