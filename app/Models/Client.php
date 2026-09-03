<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
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
        'pipeline_stage',
        'lost_reason',
        'lost_note',
        'estimated_value',
        'source',
        'notes',
        'location',
        'next_follow_up_at',
        'linkedin',
        'facebook',
        'instagram',
        'twitter',
        'tiktok',
    ];

    protected $casts = [
        'status' => 'string',
        'pipeline_stage' => 'string',
        'estimated_value' => 'decimal:2',
        'next_follow_up_at' => 'datetime',
    ];

    public const PIPELINE_STAGES = [
        'new_lead',
        'contacted',
        'meeting_scheduled',
        'proposal_sent',
        'negotiating',
        'converted',
        'lost',
    ];

    public static function pipelineStageForStatus(string $status): string
    {
        return match ($status) {
            'active' => 'converted',
            'inactive' => 'lost',
            'prospect' => 'negotiating',
            default => 'new_lead',
        };
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

    public function proformas(): HasMany
    {
        return $this->hasMany(Proforma::class);
    }

    public function primaryContact()
    {
        return $this->hasOne(Contact::class)->oldest();
    }

    public function lastInteraction()
    {
        return $this->hasOne(Interaction::class)->latestOfMany('occurred_at');
    }
}
