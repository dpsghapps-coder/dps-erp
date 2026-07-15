<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'company_name',
        'industry',
        'website',
        'phone',
        'email',
        'address',
        'city',
        'country',
        'status',
        'assigned_to',
        'source',
        'notes',
        'location',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(Interaction::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function primaryContact()
    {
        return $this->hasOne(Contact::class)->where('is_primary', true);
    }
}
