<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignReminder extends Model
{
    protected $fillable = [
        'campaign_id', 'user_id', 'remind_at', 'sent',
    ];

    protected $casts = [
        'remind_at' => 'datetime',
        'sent' => 'boolean',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
