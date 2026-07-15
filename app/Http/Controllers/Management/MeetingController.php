<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\MeetingAttendee;
use App\Models\User;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    public function index()
    {
        $meetings = Meeting::with(['organizer', 'chairperson', 'createdBy'])
            ->orderByDesc('date')
            ->paginate(20);

        return inertia('Management/Meetings/Index', ['meetings' => $meetings]);
    }

    public function create()
    {
        $employees = User::where('is_active', true)->orderBy('name')->get();

        return inertia('Management/Meetings/Create', ['employees' => $employees]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:board,management,department,ad_hoc',
            'date' => 'required|date',
            'time' => 'nullable|date_format:H:i',
            'venue' => 'nullable|string|max:255',
            'organizer_id' => 'nullable|exists:users,id',
            'chairperson_id' => 'nullable|exists:users,id',
            'secretary_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
            'attendees' => 'nullable|array',
            'attendees.*.user_id' => 'required|exists:users,id',
            'attendees.*.status' => 'nullable|in:present,absent,apologies',
            'agendas' => 'nullable|array',
            'agendas.*.title' => 'required|string|max:255',
            'agendas.*.presenter_id' => 'nullable|exists:users,id',
            'agendas.*.discussion_notes' => 'nullable|string',
        ]);

        $meeting = Meeting::create([
            'number' => Meeting::nextNumber(),
            'title' => $validated['title'],
            'type' => $validated['type'],
            'date' => $validated['date'],
            'time' => $validated['time'] ?? null,
            'venue' => $validated['venue'] ?? null,
            'organizer_id' => $validated['organizer_id'] ?? null,
            'chairperson_id' => $validated['chairperson_id'] ?? null,
            'secretary_id' => $validated['secretary_id'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'scheduled',
            'created_by' => auth()->id(),
        ]);

        if (! empty($validated['attendees'])) {
            foreach ($validated['attendees'] as $attendee) {
                MeetingAttendee::create([
                    'meeting_id' => $meeting->id,
                    'user_id' => $attendee['user_id'],
                    'status' => $attendee['status'] ?? 'present',
                ]);
            }
        }

        if (! empty($validated['agendas'])) {
            foreach ($validated['agendas'] as $i => $agenda) {
                $meeting->agendas()->create([
                    'title' => $agenda['title'],
                    'presenter_id' => $agenda['presenter_id'] ?? null,
                    'discussion_notes' => $agenda['discussion_notes'] ?? null,
                    'position' => $i + 1,
                ]);
            }
        }

        return redirect()->route('management.meetings.show', $meeting)->with('success', 'Meeting created successfully');
    }

    public function show(Meeting $meeting)
    {
        $meeting->load([
            'organizer', 'chairperson', 'secretary', 'createdBy',
            'attendees.user', 'agendas.presenter', 'decisions.category',
        ]);

        return inertia('Management/Meetings/Show', ['meeting' => $meeting]);
    }

    public function edit(Meeting $meeting)
    {
        $meeting->load(['attendees.user', 'agendas']);
        $employees = User::where('is_active', true)->orderBy('name')->get();

        return inertia('Management/Meetings/Edit', [
            'meeting' => $meeting,
            'employees' => $employees,
        ]);
    }

    public function update(Request $request, Meeting $meeting)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:board,management,department,ad_hoc',
            'date' => 'required|date',
            'time' => 'nullable|date_format:H:i',
            'venue' => 'nullable|string|max:255',
            'organizer_id' => 'nullable|exists:users,id',
            'chairperson_id' => 'nullable|exists:users,id',
            'secretary_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:scheduled,in_progress,completed,cancelled',
            'attendees' => 'nullable|array',
            'attendees.*.user_id' => 'required|exists:users,id',
            'attendees.*.status' => 'nullable|in:present,absent,apologies',
            'agendas' => 'nullable|array',
            'agendas.*.title' => 'required|string|max:255',
            'agendas.*.presenter_id' => 'nullable|exists:users,id',
            'agendas.*.discussion_notes' => 'nullable|string',
        ]);

        $meeting->update([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'date' => $validated['date'],
            'time' => $validated['time'] ?? null,
            'venue' => $validated['venue'] ?? null,
            'organizer_id' => $validated['organizer_id'] ?? null,
            'chairperson_id' => $validated['chairperson_id'] ?? null,
            'secretary_id' => $validated['secretary_id'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? $meeting->status,
        ]);

        if (isset($validated['attendees'])) {
            $meeting->attendees()->delete();
            foreach ($validated['attendees'] as $attendee) {
                MeetingAttendee::create([
                    'meeting_id' => $meeting->id,
                    'user_id' => $attendee['user_id'],
                    'status' => $attendee['status'] ?? 'present',
                ]);
            }
        }

        if (isset($validated['agendas'])) {
            $meeting->agendas()->delete();
            foreach ($validated['agendas'] as $i => $agenda) {
                $meeting->agendas()->create([
                    'title' => $agenda['title'],
                    'presenter_id' => $agenda['presenter_id'] ?? null,
                    'discussion_notes' => $agenda['discussion_notes'] ?? null,
                    'position' => $i + 1,
                ]);
            }
        }

        return redirect()->route('management.meetings.show', $meeting)->with('success', 'Meeting updated successfully');
    }

    public function destroy(Meeting $meeting)
    {
        $meeting->update(['status' => 'cancelled']);

        return redirect()->route('management.meetings.index')->with('success', 'Meeting cancelled');
    }
}
