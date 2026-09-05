<?php

namespace App\Models;

use App\Models\Concerns\GeneratesSequentialCode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Service extends Model
{
    use GeneratesSequentialCode;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category_id',
        'unit',
        'is_active',
        'workmanship_cost',
        'machine_maintenance_cost',
        'process_cost',
        'capital_recovery_fee',
        'profit',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'workmanship_cost' => 'decimal:2',
        'machine_maintenance_cost' => 'decimal:2',
        'process_cost' => 'decimal:2',
        'capital_recovery_fee' => 'decimal:2',
        'profit' => 'decimal:2',
    ];

    protected $appends = ['default_price', 'calculated_base_price'];

    const COST_FIELDS = [
        'workmanship_cost',
        'machine_maintenance_cost',
        'process_cost',
        'capital_recovery_fee',
        'profit',
    ];

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

    public function productComponents(): MorphMany
    {
        return $this->morphMany(ProductComponent::class, 'component');
    }

    public function getCalculatedBasePriceAttribute(): float
    {
        return (float) collect(self::COST_FIELDS)->sum(fn ($field) => $this->{$field} ?? 0);
    }

    public function getDefaultPriceAttribute()
    {
        return $this->prices()
            ->where('min_qty', '<=', 1)
            ->orderBy('min_qty', 'desc')
            ->first()?->unit_price ?? 0;
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
