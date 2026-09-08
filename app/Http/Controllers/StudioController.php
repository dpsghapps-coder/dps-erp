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
        $clients = Client::where('is_greylisted', false)->get();
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

        if (! empty($validated['client_id']) && Client::find($validated['client_id'])?->is_greylisted) {
            return back()->withErrors(['client_id' => 'This client is greylisted and cannot receive new bookings.'])->withInput();
        }

        if ($conflict = $this->findResourceConflict($validated['resource_ids'] ?? [], $validated['start_datetime'], $validated['end_datetime'])) {
            return back()->withErrors(['resource_ids' => $conflict])->withInput();
        }

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
        $booking->load('resources');

        // Include the booking's current client/resources even if they've since
        // been greylisted or marked unavailable, so editing doesn't silently
        // drop them from the form (and from the record on save).
        $clients = Client::where('is_greylisted', false)
            ->orWhere('id', $booking->client_id)
            ->get();

        $resources = StudioResource::where('is_available', true)
            ->orWhereIn('id', $booking->resources->pluck('id'))
            ->get();

        return inertia('Studio/Edit', [
            'booking' => $booking,
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

        if ($conflict = $this->findResourceConflict($validated['resource_ids'] ?? [], $validated['start_datetime'], $validated['end_datetime'], $booking->id)) {
            return back()->withErrors(['resource_ids' => $conflict])->withInput();
        }

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

    /**
     * Returns a human-readable conflict message if any of the given resources
     * are already booked (on a non-cancelled booking) during an overlapping
     * time window, or null if there's no conflict.
     */
    private function findResourceConflict(array $resourceIds, string $start, string $end, ?int $excludeBookingId = null): ?string
    {
        if (empty($resourceIds)) {
            return null;
        }

        $conflicting = StudioBooking::whereHas('resources', fn ($q) => $q->whereIn('studio_resources.id', $resourceIds))
            ->where('status', '!=', 'cancelled')
            ->when($excludeBookingId, fn ($q) => $q->where('id', '!=', $excludeBookingId))
            ->where('start_datetime', '<', $end)
            ->where('end_datetime', '>', $start)
            ->with('resources')
            ->get();

        if ($conflicting->isEmpty()) {
            return null;
        }

        $lines = $conflicting->map(function ($booking) use ($resourceIds) {
            $names = $booking->resources->whereIn('id', $resourceIds)->pluck('name')->implode(', ');

            return "{$names} — already booked for \"{$booking->title}\" ({$booking->booking_reference}) "
                .$booking->start_datetime->format('M j, g:i A').' to '.$booking->end_datetime->format('M j, g:i A');
        });

        return $lines->implode(' | ');
    }

    public function resources()
    {
        return inertia('Studio/Resources', [
            'resources' => StudioResource::orderBy('name')->get(),
            'types' => StudioResource::TYPES,
        ]);
    }

    public function storeResource(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:'.implode(',', StudioResource::TYPES),
            'description' => 'nullable|string',
            'is_available' => 'boolean',
        ]);

        StudioResource::create($validated);

        return back()->with('success', 'Resource added');
    }

    public function updateResource(Request $request, StudioResource $resource)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:'.implode(',', StudioResource::TYPES),
            'description' => 'nullable|string',
            'is_available' => 'boolean',
        ]);

        $resource->update($validated);

        return back()->with('success', 'Resource updated');
    }

    public function destroyResource(StudioResource $resource)
    {
        if ($resource->bookings()->exists()) {
            return back()->withErrors(['resource' => 'Cannot delete a resource that has bookings — mark it unavailable instead.']);
        }

        $resource->delete();

        return back()->with('success', 'Resource deleted');
    }
}
