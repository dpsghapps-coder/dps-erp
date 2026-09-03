<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialPrice extends Model
{
    protected $fillable = [
        'material_id',
        'supplier_id',
        'price',
        'collected_by',
        'collection_date',
        'added_by',
    ];

    protected $casts = [
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
}
