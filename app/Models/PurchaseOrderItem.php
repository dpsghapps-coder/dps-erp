<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'product_type',
        'description',
        'qty',
        'unit_cost',
        'line_total',
        'received_qty',
        'inspection_status',
        'inspection_notes',
        'accepted_qty',
    ];

    protected $casts = [
        'qty' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'line_total' => 'decimal:2',
        'received_qty' => 'decimal:2',
        'accepted_qty' => 'decimal:2',
    ];

    protected $appends = ['display_name'];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): MorphTo
    {
        return $this->morphTo();
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->description ?: ($this->product?->item_name ?? 'Item');
    }
}
