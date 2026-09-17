<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnlineUsersController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::where('is_active', true)
            ->where('id', '!=', $request->user()->id)
            ->whereNotNull('last_active_at')
            ->where('last_active_at', '>=', now()->subSeconds(120))
            ->orderByDesc('last_active_at')
            ->get(['id', 'name', 'employee_id', 'last_active_at'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'avatar' => $u->avatar,
                'department' => $u->department,
            ])
            ->values();

        return response()->json(['users' => $users]);
    }
}
