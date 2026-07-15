<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Good extends Model
{
    protected $table = 'goods';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'material_id',
        'item_name',
        'item_description',
        'item_category',
        'uom',
        'attributes',
        'picture',
        'restock_threshold',
        'item_status',
        'date_deactivated',
        'supplier_id',
    ];

    protected $casts = [
        'restock_threshold' => 'integer',
        'item_status' => 'string',
        'date_deactivated' => 'datetime',
        'attributes' => 'array',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function supplierPrices(): HasMany
    {
        return $this->hasMany(GoodSupplierPrice::class, 'good_id');
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id', $value)->first();
    }
}
