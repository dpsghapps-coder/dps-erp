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
        'source',
        'notes',
        'location',
        'linkedin',
        'facebook',
        'instagram',
        'twitter',
        'tiktok',
    ];

    protected $casts = [
        'status' => 'string',
        'first_converted_at' => 'datetime',
        'is_greylisted' => 'boolean',
        'greylisted_at' => 'datetime',
    ];

    public const TIERS = ['bronze', 'silver', 'gold', 'platinum'];

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

    public function proformas(): HasMany
    {
        return $this->hasMany(Proforma::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    public function greylistedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'greylisted_by');
    }

    public function primaryContact()
    {
        return $this->hasOne(Contact::class)->oldest();
    }

    public function lastInteraction()
    {
        return $this->hasOne(Interaction::class)->latestOfMany('occurred_at');
    }

    public function isExistingClient(): bool
    {
        return ! is_null($this->first_converted_at);
    }

    public function hasOpenDeal(): bool
    {
        return $this->deals()->whereIn('stage', Deal::OPEN_STAGES)->exists();
    }
}
