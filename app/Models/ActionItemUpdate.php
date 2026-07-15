<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActionItemUpdate extends Model
{
    protected $fillable = ['action_item_id', 'progress', 'comment', 'created_by'];

    protected $casts = [
        'progress' => 'integer',
    ];

    public function actionItem(): BelongsTo
    {
        return $this->belongsTo(DecisionActionItem::class, 'action_item_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
