<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PriceList extends Model
{
    protected $fillable = ['name', 'currency', 'is_default', 'valid_from', 'valid_to'];

    protected $casts = [
        'is_default' => 'boolean',
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(PriceListItem::class);
    }
}
