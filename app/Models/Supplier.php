<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use Auditable, SoftDeletes;

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
