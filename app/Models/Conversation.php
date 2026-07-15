<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'created_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function users(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, ConversationParticipant::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage(): HasMany
    {
        return $this->hasMany(Message::class)->latest();
    }

    public function getUnreadCountForUser(User $user): int
    {
        $participant = $this->participants()->where('user_id', $user->id)->first();

        if (! $participant || ! $participant->last_read_at) {
            return $this->messages()->where('user_id', '!=', $user->id)->where('is_deleted', false)->count();
        }

        return $this->messages()
            ->where('user_id', '!=', $user->id)
            ->where('is_deleted', false)
            ->where('created_at', '>', $participant->last_read_at)
            ->count();
    }

    public function getDisplay_name_for_user(User $user): string
    {
        if ($this->type === 'group') {
            return $this->name;
        }

        $otherParticipant = $this->participants()
            ->where('user_id', '!=', $user->id)
            ->with('user')
            ->first();

        return $otherParticipant?->user?->name ?? 'Unknown User';
    }
}
