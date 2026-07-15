<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Requisition extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'product_id',
        'material_name',
        'material_attributes',
        'qty_requested',
        'purpose',
        'date_requested',
        'status',
        'requested_by',
        'department',
        'assignee',
        'notes',
    ];

    protected $casts = [
        'qty_requested' => 'integer',
        'date_requested' => 'datetime',
        'status' => 'string',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(InventoryProduct::class, 'product_id');
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)->first();
    }
}
