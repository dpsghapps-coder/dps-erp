<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\StudioBooking;
use App\Models\StudioResource;
use Illuminate\Http\Request;

class StudioController extends Controller
{
    public function index()
    {
        $bookings = StudioBooking::with(['client', 'resources'])
            ->orderBy('start_datetime', 'desc')
            ->paginate(25);

        $resources = StudioResource::all();

        return inertia('Studio/Index', ['bookings' => $bookings, 'resources' => $resources]);
    }

    public function create()
    {
        $clients = Client::whereIn('status', ['prospect', 'active'])->get();
        $resources = StudioResource::where('is_available', true)->get();

        return inertia('Studio/Create', ['clients' => $clients, 'resources' => $resources]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'client_id' => 'nullable|exists:clients,id',
            'status' => 'required|in:tentative,confirmed',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'notes' => 'nullable|string',
            'resource_ids' => 'array',
            'resource_ids.*' => 'exists:studio_resources,id',
        ]);

        $booking = StudioBooking::create(array_merge($validated, [
            'booking_reference' => StudioBooking::generateBookingReference(),
            'created_by' => auth()->id(),
        ]));

        if (! empty($validated['resource_ids'])) {
            $booking->resources()->attach($validated['resource_ids']);
        }

        return redirect()->route('studio.index')->with('success', 'Booking created successfully');
    }

    public function show(StudioBooking $booking)
    {
        $booking->load(['client', 'resources', 'crew']);

        return inertia('Studio/Show', ['booking' => $booking]);
    }

    public function edit(StudioBooking $booking)
    {
        $clients = Client::whereIn('status', ['prospect', 'active'])->get();
        $resources = StudioResource::where('is_available', true)->get();

        return inertia('Studio/Edit', [
            'booking' => $booking->load('resources'),
            'clients' => $clients,
            'resources' => $resources,
        ]);
    }

    public function update(Request $request, StudioBooking $booking)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'client_id' => 'nullable|exists:clients,id',
            'status' => 'required|in:tentative,confirmed,in_progress,completed,cancelled',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'notes' => 'nullable|string',
            'resource_ids' => 'array',
            'resource_ids.*' => 'exists:studio_resources,id',
        ]);

        $booking->update($validated);

        if (isset($validated['resource_ids'])) {
            $booking->resources()->sync($validated['resource_ids']);
        }

        return redirect()->route('studio.show', $booking->id)->with('success', 'Booking updated successfully');
    }

    public function destroy(StudioBooking $booking)
    {
        $booking->delete();

        return redirect()->route('studio.index')->with('success', 'Booking deleted');
    }
}
