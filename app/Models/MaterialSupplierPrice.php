<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialSupplierPrice extends Model
{
    protected $fillable = [
        'material_id',
        'supplier_id',
        'price',
        'collection',
        'date_created',
        'created_by',
    ];

    protected $casts = [
        'date_created' => 'date',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(InventoryProduct::class, 'material_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
