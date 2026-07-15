<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierBranch extends Model
{
    protected $fillable = [
        'supplier_id',
        'name',
        'contact_name',
        'mobile',
        'email',
        'address',
        'location',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
