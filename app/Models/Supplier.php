<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'company_name',
        'city',
        'country',
        'payment_terms',
        'notes',
        'is_active',
        'location',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function inventoryProducts(): HasMany
    {
        return $this->hasMany(InventoryProduct::class, 'supplier_id');
    }

    public function branches(): HasMany
    {
        return $this->hasMany(SupplierBranch::class);
    }
}
