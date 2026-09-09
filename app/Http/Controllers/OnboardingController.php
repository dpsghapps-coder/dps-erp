<?php

namespace App\Http\Controllers;

use App\Models\EmployeeInvite;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OnboardingController extends Controller
{
    public function show(string $token)
    {
        $invite = EmployeeInvite::where('token', $token)->first();
        $logo = Setting::get('company_logo');

        return inertia('Onboarding/Show', [
            'status' => $invite?->status ?? 'not_found',
            'companyName' => Setting::get('company_name', config('app.name')),
            'companyLogo' => $logo ? Storage::url($logo) : null,
        ]);
    }

    public function store(Request $request, string $token)
    {
        $invite = EmployeeInvite::where('token', $token)->firstOrFail();

        if ($invite->status !== 'pending') {
            abort(410, 'This invite link is no longer active.');
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'mobile_1' => 'required|string|max:255',
            'mobile_2' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:255',
            'emergency_contact_relation' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $validated['avatar'] = $request->hasFile('avatar')
            ? $request->file('avatar')->store('avatars', 'public')
            : null;

        $invite->update([...$validated, 'submitted_at' => now()]);

        return redirect()->route('onboarding.show', $token);
    }
}
