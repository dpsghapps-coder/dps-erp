<?php

namespace App\Models;

use App\Models\Concerns\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deal extends Model
{
    use Auditable;

    protected $fillable = [
        'client_id',
        'type',
        'stage',
        'estimated_value',
        'lost_reason',
        'lost_note',
        'next_follow_up_at',
        'converted_at',
        'lost_at',
        'created_by',
    ];

    protected $casts = [
        'type' => 'string',
        'stage' => 'string',
        'estimated_value' => 'decimal:2',
        'next_follow_up_at' => 'datetime',
        'converted_at' => 'datetime',
        'lost_at' => 'datetime',
    ];

    public const TYPES = ['new_business', 'repeat_business'];

    public const STAGES = [
        'new_lead',
        'contacted',
        'meeting_scheduled',
        'proposal_sent',
        'negotiating',
        'converted',
        'lost',
    ];

    public const OPEN_STAGES = [
        'new_lead',
        'contacted',
        'meeting_scheduled',
        'proposal_sent',
        'negotiating',
    ];

    public const STAGE_LABELS = [
        'new_lead' => 'New Lead',
        'contacted' => 'Contacted',
        'meeting_scheduled' => 'Meeting Scheduled',
        'proposal_sent' => 'Proposal Sent',
        'negotiating' => 'Negotiating',
        'converted' => 'Converted',
        'lost' => 'Lost',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
