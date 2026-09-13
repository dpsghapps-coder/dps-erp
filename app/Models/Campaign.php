<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    /**
     * Campaign types that can act as a parent "Sales/Promo Event" for
     * other campaigns to be attached to -- see parentCampaign()/childCampaigns().
     */
    public const ATTACHABLE_PARENT_TYPES = ['sale', 'promotion'];

    protected $fillable = [
        'number', 'title', 'description', 'type', 'color', 'status',
        'start_date', 'end_date', 'client_id', 'budget',
        'actual_cost', 'assigned_to', 'tags', 'notes', 'created_by',
        'parent_campaign_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'tags' => 'array',
    ];

    public static function nextNumber(): string
    {
        $year = date('Y');
        $prefix = 'CMP-'.$year.'-';
        $last = static::where('number', 'like', $prefix.'%')->orderByDesc('number')->value('number');
        $next = $last ? (int) substr($last, -4) + 1 : 1;

        return $prefix.str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(CampaignReminder::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(MarketingDocument::class);
    }

    public function parentCampaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'parent_campaign_id');
    }

    public function childCampaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'parent_campaign_id');
    }

    public function teamMembers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'campaign_team_members')->withTimestamps();
    }
}
