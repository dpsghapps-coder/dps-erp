<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Stock extends Model
{
    use Auditable, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Stock $stock) {
            if (empty($stock->id)) {
                $stock->id = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'id',
        'product_id',
        'supplier_id',
        'units_purchased',
        'qty_per_unit',
        'qty_purchased',
        'material_cost',
        'price',
        'total_cost',
        'date_purchased',
        'notes',
        'added_by',
        'purchased_by',
    ];

    protected $casts = [
        'units_purchased' => 'decimal:2',
        'qty_per_unit' => 'decimal:2',
        'qty_purchased' => 'decimal:2',
        'material_cost' => 'decimal:2',
        'price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'date_purchased' => 'date',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(InventoryProduct::class, 'product_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function costItems(): HasMany
    {
        return $this->hasMany(StockCostItem::class);
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)->first();
    }
}
