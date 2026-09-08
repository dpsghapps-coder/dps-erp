<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Finance\Invoice;
use App\Models\StudioBooking;
use App\Models\StudioDeliverable;
use App\Models\StudioResource;
use App\Models\StudioShootType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudioController extends Controller
{
    /**
     * Users eligible to be tagged as booking crew: active, linked to an
     * employee record, and either an admin or explicitly granted the
     * studio.crew_member permission (mirrors User::hasPermission()'s
     * admin-bypass logic, done as a query instead of per-row checks).
     */
    private function crewEligibleUsers()
    {
        return User::where('is_active', true)
            ->whereNotNull('employee_id')
            ->whereHas('role', function ($q) {
                $q->where('name', 'admin')
                    ->orWhereHas('permissions', fn ($q2) => $q2->where('name', 'studio.crew_member'));
            })
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
    }

    public function index()
    {
        $bookings = StudioBooking::with(['client', 'resources'])
            ->orderBy('start_datetime', 'desc')
            ->paginate(25);

        // A wider, unpaginated window for the calendar view — the list above
        // stays paginated for the table/grid view.
        $calendarBookings = StudioBooking::with(['client', 'resources'])
            ->where('start_datetime', '>=', now()->subMonths(2))
            ->where('start_datetime', '<=', now()->addMonths(3))
            ->get();

        $resources = StudioResource::all();

        return inertia('Studio/Index', [
            'bookings' => $bookings,
            'calendarBookings' => $calendarBookings,
            'resources' => $resources,
        ]);
    }

    public function create()
    {
        $clients = Client::where('is_greylisted', false)->get();
        $resources = StudioResource::where('is_available', true)->get();
        $users = $this->crewEligibleUsers();
        $shootTypes = StudioShootType::orderBy('name')->get();

        return inertia('Studio/Create', ['clients' => $clients, 'resources' => $resources, 'users' => $users, 'shootTypes' => $shootTypes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'client_id' => 'nullable|exists:clients,id',
            'shoot_type_id' => 'nullable|exists:studio_shoot_types,id',
            'status' => 'required|in:tentative,confirmed',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'notes' => 'nullable|string',
            'resource_ids' => 'array',
            'resource_ids.*' => 'exists:studio_resources,id',
            'crew' => 'array',
            'crew.*.user_id' => ['required', Rule::in($this->crewEligibleUsers()->pluck('id'))],
            'crew.*.role_in_shoot' => 'required|string|max:255',
            'rate' => 'nullable|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'deposit_paid' => 'boolean',
        ]);

        if (! empty($validated['client_id']) && Client::find($validated['client_id'])?->is_greylisted) {
            return back()->withErrors(['client_id' => 'This client is greylisted and cannot receive new bookings.'])->withInput();
        }

        if ($conflict = $this->findResourceConflict($validated['resource_ids'] ?? [], $validated['start_datetime'], $validated['end_datetime'])) {
            return back()->withErrors(['resource_ids' => $conflict])->withInput();
        }

        $booking = StudioBooking::create([
            ...$validated,
            'booking_reference' => StudioBooking::generateBookingReference(),
            'created_by' => auth()->id(),
        ]);

        if (! empty($validated['resource_ids'])) {
            $booking->resources()->attach($validated['resource_ids']);
        }

        if (! empty($validated['crew'])) {
            $booking->crew()->sync($this->crewPivotData($validated['crew']));
        }

        return redirect()->route('studio.index')->with('success', 'Booking created successfully');
    }

    public function show(StudioBooking $booking)
    {
        $booking->load(['client', 'shootType', 'resources', 'crew', 'deliverables', 'invoice']);

        return inertia('Studio/Show', ['booking' => $booking]);
    }

    public function edit(StudioBooking $booking)
    {
        $booking->load(['resources', 'crew']);

        // Include the booking's current client/resources even if they've since
        // been greylisted or marked unavailable, so editing doesn't silently
        // drop them from the form (and from the record on save).
        $clients = Client::where('is_greylisted', false)
            ->orWhere('id', $booking->client_id)
            ->get();

        $resources = StudioResource::where('is_available', true)
            ->orWhereIn('id', $booking->resources->pluck('id'))
            ->get();

        $users = $this->crewEligibleUsers();
        $currentCrewIds = $booking->crew->pluck('id');
        if ($currentCrewIds->isNotEmpty()) {
            $users = $users->merge(
                User::whereIn('id', $currentCrewIds->diff($users->pluck('id')))->select('id', 'name')->get()
            )->sortBy('name')->values();
        }

        $shootTypes = StudioShootType::orderBy('name')->get();

        return inertia('Studio/Edit', [
            'booking' => $booking,
            'clients' => $clients,
            'resources' => $resources,
            'users' => $users,
            'shootTypes' => $shootTypes,
        ]);
    }

    public function update(Request $request, StudioBooking $booking)
    {
        $allowedCrewIds = $this->crewEligibleUsers()->pluck('id')->merge($booking->crew()->pluck('users.id'));

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'client_id' => 'nullable|exists:clients,id',
            'shoot_type_id' => 'nullable|exists:studio_shoot_types,id',
            'status' => 'required|in:tentative,confirmed,in_progress,completed,cancelled',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'notes' => 'nullable|string',
            'resource_ids' => 'array',
            'resource_ids.*' => 'exists:studio_resources,id',
            'crew' => 'array',
            'crew.*.user_id' => ['required', Rule::in($allowedCrewIds)],
            'crew.*.role_in_shoot' => 'required|string|max:255',
            'rate' => 'nullable|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'deposit_paid' => 'boolean',
        ]);

        if ($conflict = $this->findResourceConflict($validated['resource_ids'] ?? [], $validated['start_datetime'], $validated['end_datetime'], $booking->id)) {
            return back()->withErrors(['resource_ids' => $conflict])->withInput();
        }

        $booking->update($validated);

        if (isset($validated['resource_ids'])) {
            $booking->resources()->sync($validated['resource_ids']);
        }

        $booking->crew()->sync($this->crewPivotData($validated['crew'] ?? []));

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

    /**
     * Maps [{user_id, role_in_shoot}, ...] into the [user_id => ['role_in_shoot' => ...]]
     * shape sync() expects for a pivot table.
     */
    private function crewPivotData(array $crew): array
    {
        return collect($crew)->mapWithKeys(fn ($c) => [$c['user_id'] => ['role_in_shoot' => $c['role_in_shoot']]])->all();
    }

    public function resources()
    {
        return inertia('Studio/Resources', [
            'resources' => StudioResource::orderBy('name')->get(),
            'types' => StudioResource::TYPES,
            'shootTypes' => StudioShootType::orderBy('name')->get(),
            'canManagePricing' => auth()->user()->hasPermission('studio.manage_pricing'),
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

    private function authorizePricing(): void
    {
        if (! auth()->user()->hasPermission('studio.manage_pricing')) {
            abort(403, 'You are not authorized to manage shoot types or pricing.');
        }
    }

    public function storeShootType(Request $request)
    {
        $this->authorizePricing();

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:studio_shoot_types,name',
            'price' => 'nullable|numeric|min:0',
        ]);

        StudioShootType::create($validated);

        return back()->with('success', 'Shoot type added');
    }

    public function updateShootType(Request $request, StudioShootType $shootType)
    {
        $this->authorizePricing();

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:studio_shoot_types,name,'.$shootType->id,
            'price' => 'nullable|numeric|min:0',
        ]);

        $shootType->update($validated);

        return back()->with('success', 'Shoot type updated');
    }

    public function destroyShootType(StudioShootType $shootType)
    {
        $this->authorizePricing();

        if (StudioBooking::where('shoot_type_id', $shootType->id)->exists()) {
            return back()->withErrors(['shoot_type' => 'Cannot delete a shoot type that has bookings.']);
        }

        $shootType->delete();

        return back()->with('success', 'Shoot type deleted');
    }

    public function generateInvoice(StudioBooking $booking)
    {
        if (! $booking->client_id) {
            return back()->withErrors(['invoice' => 'Add a client to this booking before generating an invoice.']);
        }

        if (! $booking->rate) {
            return back()->withErrors(['invoice' => 'Set a rate for this booking before generating an invoice.']);
        }

        if ($booking->invoice_id) {
            return back()->withErrors(['invoice' => 'An invoice has already been generated for this booking.']);
        }

        DB::transaction(function () use ($booking) {
            $notes = "Studio booking {$booking->booking_reference}: {$booking->title}";
            if ($booking->deposit_paid && $booking->deposit_amount) {
                $notes .= ". A deposit of {$booking->deposit_amount} has already been collected — record it as a payment once sent.";
            }

            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateNumber(),
                'client_id' => $booking->client_id,
                'category' => 'Studio Booking',
                'invoice_date' => now(),
                'due_date' => now()->addDays(14),
                'notes' => $notes,
                'status' => 'draft',
                'created_by' => auth()->id(),
            ]);

            $invoice->items()->create([
                'description' => $booking->title,
                'quantity' => 1,
                'unit_price' => $booking->rate,
            ]);

            $invoice->recalculateSubtotal();

            $booking->update(['invoice_id' => $invoice->id]);
        });

        return back()->with('success', 'Invoice generated as a draft');
    }

    public function storeDeliverable(Request $request, StudioBooking $booking)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'link' => 'nullable|url|max:500',
        ]);

        $booking->deliverables()->create($validated);

        return back()->with('success', 'Deliverable added');
    }

    public function updateDeliverable(Request $request, StudioDeliverable $deliverable)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'status' => 'required|in:'.implode(',', StudioDeliverable::STATUSES),
            'link' => 'nullable|url|max:500',
        ]);

        $validated['delivered_at'] = $validated['status'] === 'delivered'
            ? ($deliverable->delivered_at ?? now())
            : null;

        $deliverable->update($validated);

        return back()->with('success', 'Deliverable updated');
    }

    public function destroyDeliverable(StudioDeliverable $deliverable)
    {
        $deliverable->delete();

        return back()->with('success', 'Deliverable removed');
    }
}
