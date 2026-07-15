<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodSupplierPrice extends Model
{
    protected $fillable = [
        'good_id',
        'supplier_id',
        'price',
        'collection',
        'date_created',
        'created_by',
    ];

    protected $casts = [
        'date_created' => 'date',
        'collection' => 'datetime',
        'price' => 'decimal:2',
    ];

    public function good(): BelongsTo
    {
        return $this->belongsTo(Good::class, 'good_id');
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
