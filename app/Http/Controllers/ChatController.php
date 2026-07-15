<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{
    public function getConversations(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with(['participants' => function ($q) {
                $q->with('user:id,name,avatar');
            }])
            ->with(['latestMessage' => function ($q) {
                $q->with('user:id,name');
                $q->latest();
            }])
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('user_id', '!=', $user->id)
                    ->where('is_deleted', false)
                    ->where(function ($q2) use ($user) {
                        $q2->whereNull('created_at')
                            ->orWhere('created_at', '>', DB::raw(
                                '(SELECT last_read_at FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = '.$user->id.' LIMIT 1)'
                            ));
                    });
            }])
            ->orderByDesc(
                DB::raw('(SELECT MAX(created_at) FROM messages WHERE messages.conversation_id = conversations.id)')
            )
            ->get();

        return response()->json($conversations);
    }

    public function getMessages(Request $request, int $conversationId): JsonResponse
    {
        $user = $request->user();

        $conversation = Conversation::findOrFail($conversationId);

        if (! $conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = Message::where('conversation_id', $conversationId)
            ->with(['user:id,name,avatar', 'attachments'])
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($messages);
    }

    public function sendMessage(Request $request, int $conversationId): JsonResponse
    {
        $user = $request->user();

        $conversation = Conversation::findOrFail($conversationId);

        if (! $conversation->participants()->where('user_id', $user->id)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required_without:files|string|max:10000',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:10240|mimes:pdf,jpg,jpeg,png,gif,doc,docx,xls,xlsx',
        ]);

        $message = Message::create([
            'conversation_id' => $conversationId,
            'user_id' => $user->id,
            'content' => $validated['content'] ?? '',
            'type' => isset($validated['files']) ? 'file' : 'text',
        ]);

        if (! empty($validated['files'])) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('chat/attachments', 'private');
                $message->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        $message->load(['user:id,name,avatar', 'attachments']);

        return response()->json($message);
    }

    public function createConversation(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'type' => 'required|in:dm,group',
            'name' => 'required_if:type,group|nullable|string|max:255',
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'exists:users,id',
        ]);

        if ($validated['type'] === 'dm') {
            if (count($validated['participant_ids']) !== 1) {
                return response()->json(['error' => 'DM requires exactly one other participant'], 422);
            }

            $otherUserId = $validated['participant_ids'][0];

            $existingDm = Conversation::where('type', 'dm')
                ->whereHas('participants', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->whereHas('participants', function ($q) use ($otherUserId) {
                    $q->where('user_id', $otherUserId);
                })
                ->withCount('participants')
                ->where('participants_count', 2)
                ->first();

            if ($existingDm) {
                return response()->json($existingDm->load(['participants.user:id,name,avatar']));
            }
        }

        if ($validated['type'] === 'group' && ! $user->hasPermission('admin.manage_users')) {
            return response()->json(['error' => 'Only managers+ can create group chats'], 403);
        }

        $conversation = Conversation::create([
            'type' => $validated['type'],
            'name' => $validated['name'] ?? null,
            'created_by' => $user->id,
        ]);

        $conversation->participants()->create([
            'user_id' => $user->id,
            'role' => 'admin',
        ]);

        foreach ($validated['participant_ids'] as $participantId) {
            $conversation->participants()->create([
                'user_id' => $participantId,
                'role' => 'member',
            ]);
        }

        $conversation->load(['participants.user:id,name,avatar']);

        return response()->json($conversation);
    }

    public function deleteMessage(Request $request, int $conversationId, int $messageId): JsonResponse
    {
        $user = $request->user();

        $message = Message::where('conversation_id', $conversationId)
            ->where('id', $messageId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $message->deleteMessage();

        return response()->json(['success' => true]);
    }

    public function searchMessages(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'query' => 'required|string|min:2|max:100',
        ]);

        $query = $validated['query'];

        $conversationIds = ConversationParticipant::where('user_id', $user->id)
            ->pluck('conversation_id');

        $messages = Message::whereIn('conversation_id', $conversationIds)
            ->where('is_deleted', false)
            ->where('content', 'LIKE', "%{$query}%")
            ->with(['user:id,name,avatar', 'conversation:id,type,name'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($messages);
    }

    public function markAsRead(Request $request, int $conversationId): JsonResponse
    {
        $user = $request->user();

        ConversationParticipant::where('conversation_id', $conversationId)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);

        Message::where('conversation_id', $conversationId)
            ->where('user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function addParticipants(Request $request, int $conversationId): JsonResponse
    {
        $user = $request->user();

        $conversation = Conversation::findOrFail($conversationId);

        if ($conversation->type !== 'group') {
            return response()->json(['error' => 'Cannot add participants to DM'], 422);
        }

        if (! $user->hasPermission('admin.manage_users')) {
            return response()->json(['error' => 'Only managers+ can add members'], 403);
        }

        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        foreach ($validated['user_ids'] as $userId) {
            ConversationParticipant::firstOrCreate([
                'conversation_id' => $conversationId,
                'user_id' => $userId,
            ], [
                'role' => 'member',
            ]);
        }

        $conversation->load(['participants.user:id,name,avatar']);

        return response()->json($conversation);
    }

    public function leaveConversation(Request $request, int $conversationId): JsonResponse
    {
        $user = $request->user();

        $conversation = Conversation::findOrFail($conversationId);

        $participant = $conversation->participants()->where('user_id', $user->id)->firstOrFail();

        $adminCount = $conversation->participants()->where('role', 'admin')->count();

        if ($participant->role === 'admin' && $adminCount <= 1) {
            $memberCount = $conversation->participants()->count();
            if ($memberCount > 1) {
                return response()->json(['error' => 'You are the only admin. Promote another member or delete the group.'], 422);
            }
        }

        $participant->delete();

        if ($conversation->participants()->count() === 0) {
            $conversation->delete();
        }

        return response()->json(['success' => true]);
    }

    public function deleteConversation(Request $request, int $conversationId): JsonResponse
    {
        $user = $request->user();

        $conversation = Conversation::findOrFail($conversationId);

        if ($conversation->type !== 'group') {
            return response()->json(['error' => 'Use leave for DMs'], 422);
        }

        $isCreator = $conversation->created_by === $user->id;
        $isAdmin = $conversation->participants()
            ->where('user_id', $user->id)
            ->where('role', 'admin')
            ->exists();

        if (! $isCreator && ! $user->hasPermission('admin.manage_users')) {
            return response()->json(['error' => 'Only creator or managers+ can delete groups'], 403);
        }

        $conversation->messages()->each(function ($message) {
            $message->attachments()->each(function ($attachment) {
                Storage::disk('private')->delete($attachment->file_path);
            });
            $message->delete();
        });

        $conversation->participants()->delete();
        $conversation->delete();

        return response()->json(['success' => true]);
    }

    public function getUnreadCounts(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('user_id', '!=', $user->id)
                    ->where('is_deleted', false)
                    ->where(function ($q2) use ($user) {
                        $q2->whereNull('created_at')
                            ->orWhere('created_at', '>', DB::raw(
                                '(SELECT last_read_at FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = '.$user->id.' LIMIT 1)'
                            ));
                    });
            }])
            ->get()
            ->pluck('unread_count')
            ->sum();

        return response()->json(['unread_count' => $conversations]);
    }
}
