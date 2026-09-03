<?php

namespace App\Http\Controllers;

use App\Models\UserNotificationPreference;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user()->load(['role', 'employee.department', 'employee.staffLevel', 'employee.employmentType']);

        $notificationPreferences = UserNotificationPreference::getForUser($user->id);

        return Inertia::render('Profile/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->employee->avatar ?? null,
                'role' => $user->role ? [
                    'name' => $user->role->name,
                ] : null,
                'employee' => $user->employee ? [
                    'employee_number' => $user->employee->employee_number,
                    'first_name' => $user->employee->first_name,
                    'last_name' => $user->employee->last_name,
                    'email' => $user->employee->email,
                    'avatar' => $user->employee->avatar,
                    'job_title' => $user->employee->job_title,
                    'mobile_1' => $user->employee->mobile_1,
                    'mobile_2' => $user->employee->mobile_2,
                    'date_hired' => $user->employee->date_hired?->format('Y-m-d'),
                    'department' => $user->employee->department ? [
                        'name' => $user->employee->department->name,
                    ] : null,
                    'staff_level' => $user->employee->staffLevel ? [
                        'name' => $user->employee->staffLevel->name,
                    ] : null,
                    'employment_type' => $user->employee->employmentType ? [
                        'name' => $user->employee->employmentType->name,
                    ] : null,
                ] : null,
                'notification_preferences' => [
                    'procurement' => $notificationPreferences->procurement,
                    'orders' => $notificationPreferences->orders,
                    'inventory' => $notificationPreferences->inventory,
                    'hrm' => $notificationPreferences->hrm,
                    'chat_messages' => $notificationPreferences->chat_messages,
                ],
            ],
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $request->user()->id,
            'avatar' => 'nullable|image|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $employee = $user->employee;
            if ($employee) {
                if ($employee->avatar) {
                    Storage::disk('public')->delete($employee->avatar);
                }
                $employee->update(['avatar' => $request->file('avatar')->store('avatars', 'public')]);
            }
        }

        if (array_key_exists('email', $validated) && $validated['email'] !== $user->email) {
            $user->email_verified_at = null;
        }

        $user->fill(collect($validated)->only('name', 'email')->toArray());
        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    public function updateNotificationPreferences(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'procurement' => 'boolean',
            'orders' => 'boolean',
            'inventory' => 'boolean',
            'hrm' => 'boolean',
            'chat_messages' => 'boolean',
        ]);

        UserNotificationPreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return Redirect::route('profile.edit')->with('success', 'Notification preferences updated.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
