<?php

namespace App\Http\Controllers;

use App\Models\UserNotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function getNotifications(Request $request): JsonResponse
    {
        $user = $request->user();

        $preferences = UserNotificationPreference::getForUser($user->id);

        $notifications = $user->notifications()
            ->where(function ($query) use ($preferences) {
                if (! $preferences->procurement) {
                    $query->where('type', 'not like', '%Procurement%');
                }
                if (! $preferences->orders) {
                    $query->where('type', 'not like', '%Order%');
                }
                if (! $preferences->inventory) {
                    $query->where('type', 'not like', '%Inventory%');
                }
                if (! $preferences->hrm) {
                    $query->where('type', 'not like', '%Hrm%');
                }
            })
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($notifications);
    }

    public function getUnreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = $user->notifications()->whereNull('read_at')->count();

        return response()->json(['unread_count' => $count]);
    }

    public function markAsRead(Request $request, string $notificationId): JsonResponse
    {
        $user = $request->user();

        $notification = $user->notifications()->where('id', $notificationId)->firstOrFail();
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->notifications()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'procurement' => 'sometimes|boolean',
            'orders' => 'sometimes|boolean',
            'inventory' => 'sometimes|boolean',
            'hrm' => 'sometimes|boolean',
            'chat_messages' => 'sometimes|boolean',
        ]);

        $preferences = UserNotificationPreference::getForUser($user->id);
        $preferences->update($validated);

        return response()->json($preferences);
    }

    public function getPreferences(Request $request): JsonResponse
    {
        $user = $request->user();

        $preferences = UserNotificationPreference::getForUser($user->id);

        return response()->json($preferences);
    }
}
