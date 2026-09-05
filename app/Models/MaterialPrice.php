<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MaterialPrice extends Model
{
    protected $fillable = [
        'material_id',
        'supplier_id',
        'units_purchased',
        'qty_per_unit',
        'qty',
        'material_cost',
        'total_cost',
        'price',
        'collected_by',
        'collection_date',
        'added_by',
    ];

    protected $casts = [
        'units_purchased' => 'decimal:2',
        'qty_per_unit' => 'decimal:2',
        'qty' => 'decimal:2',
        'material_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'price' => 'decimal:2',
        'collection_date' => 'date',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(InventoryProduct::class, 'material_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function collectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }

    public function costItems(): HasMany
    {
        return $this->hasMany(MaterialPriceCostItem::class);
    }
}
