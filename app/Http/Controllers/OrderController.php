<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\JobStatusHistory;
use App\Models\Order;
use App\Models\OrderItemDeliverable;
use App\Models\Product;
use App\Models\ProductionJob;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\OrderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Validator as ValidatorContract;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with(['client', 'items.product'])
            ->when($request->filled('search'), fn ($q) => $q->where('order_number', 'like', '%'.$request->string('search').'%'))
            ->when($request->filled('status') && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        return inertia('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return inertia('Orders/Create', $this->itemPickerProps());
    }

    public function store(Request $request)
    {
        $validated = $this->validateOrder($request, requireClient: true);

        // "Save & Confirm" on the create form -- create as draft (so status
        // history stays consistent with every other order) then immediately
        // transition, rather than inserting with status=confirmed directly.
        $confirmOnCreate = $request->input('status') === Order::STATUS_CONFIRMED;

        $order = DB::transaction(function () use ($validated, $confirmOnCreate) {
            $order = Order::create([
                'client_id' => $validated['client_id'],
                'contact_id' => $validated['contact_id'] ?? null,
                'delivery_date' => $validated['delivery_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'vat_applicable' => $validated['vat_applicable'] ?? false,
                'order_number' => Order::generateOrderNumber(),
                'currency' => Setting::get('currency', 'GHS'),
                'created_by' => auth()->id(),
                'status' => Order::STATUS_DRAFT,
            ]);

            foreach ($this->resolveItemPricing($validated['items']) as $item) {
                $order->items()->create($item);
            }

            $order->calculateTotals();

            $order->statusHistory()->create([
                'old_status' => null,
                'new_status' => Order::STATUS_DRAFT,
                'changed_by' => auth()->id(),
                'notes' => 'Order created',
            ]);

            if ($confirmOnCreate) {
                $order->transitionTo(Order::STATUS_CONFIRMED, 'Confirmed on creation');
            }

            return $order;
        });

        $message = $confirmOnCreate ? 'Order created and confirmed successfully' : 'Order created successfully';

        return redirect()->route('orders.index')->with('success', $message);
    }

    public function show(Order $order)
    {
        $order->load(['client', 'contact', 'items.product', 'items.deliverables', 'createdBy', 'productionJobs.assignedTo', 'productionJobs.statusHistory.changedBy', 'payments.recordedBy', 'statusHistory.changedBy']);
        $order->append(['total_paid', 'payment_balance']);

        return inertia('Orders/Show', [
            'order' => $order,
            'users' => User::where('is_active', true)->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function edit(Order $order)
    {
        if (! $order->isEditable()) {
            return redirect()->route('orders.show', $order->id)
                ->with('error', 'Only draft orders can be edited.');
        }

        $order->load(['items', 'client.contacts']);

        return inertia('Orders/Edit', [
            'order' => $order,
            ...$this->itemPickerProps(),
        ]);
    }

    public function update(Request $request, Order $order)
    {
        if (! $order->isEditable()) {
            return back()->with('error', 'Only draft orders can be edited.');
        }

        $validated = $this->validateOrder($request, requireClient: false, maxAllowedDiscount: (float) ($order->items()->max('discount_pct') ?? 0));

        DB::transaction(function () use ($validated, $order) {
            $order->update([
                'contact_id' => $validated['contact_id'] ?? null,
                'delivery_date' => $validated['delivery_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'vat_applicable' => $validated['vat_applicable'] ?? false,
            ]);

            $order->items()->delete();
            foreach ($this->resolveItemPricing($validated['items']) as $item) {
                $order->items()->create($item);
            }

            $order->calculateTotals();
        });

        return redirect()->route('orders.show', $order->id)->with('success', 'Order updated successfully');
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:'.implode(',', array_keys(Order::STATUS_TRANSITIONS)),
        ]);

        if (! $order->canTransitionTo($validated['status'])) {
            return back()->with('error', "Cannot move an order from \"{$order->status}\" to \"{$validated['status']}\".");
        }

        if ($validated['status'] === Order::STATUS_IN_PRODUCTION
            && $order->payment_status !== 'paid'
            && ! auth()->user()->hasPermission('orders.override_payment_check')) {
            return back()->with('error', 'This order must be fully paid before it can move into production.');
        }

        DB::transaction(function () use ($validated, $order) {
            $order->transitionTo($validated['status']);

            if ($validated['status'] === Order::STATUS_IN_PRODUCTION) {
                $this->ensureProductionJob($order);
            }
        });

        $owner = $order->created_by ? User::find($order->created_by) : null;
        if ($owner) {
            $owner->notify(new OrderNotification($order->id, 'status_changed', $order->order_number));
        }

        return back()->with('success', 'Order status updated');
    }

    private function ensureProductionJob(Order $order): void
    {
        $hasActiveJob = $order->productionJobs()->whereNotIn('status', [ProductionJob::STATUS_CANCELLED])->exists();

        if ($hasActiveJob) {
            return;
        }

        $job = ProductionJob::create([
            'job_number' => ProductionJob::generateJobNumber(),
            'order_id' => $order->id,
            'title' => "Order {$order->order_number}",
            'status' => ProductionJob::STATUS_NEW_JOBS,
            'priority' => 'normal',
        ]);

        JobStatusHistory::create([
            'production_job_id' => $job->id,
            'old_status' => null,
            'new_status' => $job->status,
            'changed_by' => auth()->id(),
            'notes' => "Auto-created when order {$order->order_number} entered production",
        ]);

        $job->populateMaterialsFromOrder($order);
    }

    public function storePayment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,mobile_money,cheque,bank_transfer,apps_mobile',
            'mobile_money_provider' => 'required_if:payment_method,mobile_money|nullable|in:mtn_momo,telecash,at_money',
            'amount' => 'required|numeric|min:0.01',
        ]);

        DB::transaction(function () use ($validated, $order) {
            $order->payments()->create([
                'payment_method' => $validated['payment_method'],
                'mobile_money_provider' => $validated['mobile_money_provider'] ?? null,
                'amount' => $validated['amount'],
                'recorded_by' => auth()->id(),
            ]);

            $totalPaid = (float) $order->payments()->sum('amount');
            $paymentStatus = match (true) {
                $totalPaid <= 0 => 'unpaid',
                $totalPaid >= $order->grand_total => 'paid',
                default => 'partial',
            };

            $order->update(['payment_status' => $paymentStatus]);

            if ($order->status === Order::STATUS_CONFIRMED) {
                $order->transitionTo(Order::STATUS_PAYMENT_RECEIVED, 'Payment recorded');
            }
        });

        $owner = $order->created_by ? User::find($order->created_by) : null;
        if ($owner) {
            $owner->notify(new OrderNotification($order->id, 'payment_received', $order->order_number));
        }

        return back()->with('success', 'Payment recorded');
    }

    public function storeDeliverable(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_item_id' => 'required|exists:order_items,id',
            'description' => 'required|string|max:255',
            'qty_promised' => 'nullable|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $item = $order->items()->findOrFail($validated['order_item_id']);

        $item->deliverables()->create([
            'description' => $validated['description'],
            'qty_promised' => $validated['qty_promised'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Deliverable added');
    }

    public function updateDeliverable(Request $request, Order $order, OrderItemDeliverable $deliverable)
    {
        abort_unless($deliverable->orderItem->order_id === $order->id, 404);

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'qty_promised' => 'nullable|integer|min:1',
            'qty_delivered' => 'required|integer|min:0',
            'status' => 'required|in:'.implode(',', OrderItemDeliverable::STATUSES),
            'notes' => 'nullable|string',
        ]);

        $deliverable->update($validated);

        return back()->with('success', 'Deliverable updated');
    }

    public function destroyDeliverable(Order $order, OrderItemDeliverable $deliverable)
    {
        abort_unless($deliverable->orderItem->order_id === $order->id, 404);

        $deliverable->delete();

        return back()->with('success', 'Deliverable removed');
    }

    private function itemPickerProps(): array
    {
        return [
            'clients' => Client::where('is_greylisted', false)->with('contacts')->get(),
            'products' => Product::where('is_active', true)->with('prices')->orderBy('name')->get(),
            'services' => Service::where('is_active', true)->with('prices')->orderBy('name')->get(),
        ];
    }

    private function validateOrder(Request $request, bool $requireClient, float $maxAllowedDiscount = 0): array
    {
        $rules = [
            'contact_id' => 'nullable|exists:contacts,id',
            'delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'vat_applicable' => 'nullable|boolean',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.product_type' => 'required|in:App\Models\Product,App\Models\Service',
            'items.*.description' => 'nullable|string|max:255',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_pct' => 'nullable|numeric|min:0|max:100',
            'items.*.length' => 'nullable|numeric|min:0.01',
            'items.*.breadth' => 'nullable|numeric|min:0.01',
            'items.*.dimension_unit' => 'nullable|in:ft,in',
        ];

        if ($requireClient) {
            $rules['client_id'] = 'required|exists:clients,id';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($requireClient) {
            $validator->after(function (ValidatorContract $validator) use ($request) {
                $clientId = $request->input('client_id');
                if ($clientId && Client::find($clientId)?->is_greylisted) {
                    $validator->errors()->add('client_id', 'This client is greylisted and cannot receive new orders.');
                }
            });
        }

        $validator->after(function (ValidatorContract $validator) use ($request) {
            $this->validateItemsAreActive($request->input('items', []), $validator);
        });

        $validator->after(function (ValidatorContract $validator) use ($request, $maxAllowedDiscount) {
            $this->validateDiscountPermission($request->input('items', []), $validator, $maxAllowedDiscount);
        });

        return $validator->validate();
    }

    private function validateDiscountPermission(array $items, ValidatorContract $validator, float $maxAllowedDiscount): void
    {
        if (auth()->user()->hasPermission('orders.apply_discount')) {
            return;
        }

        foreach ($items as $i => $item) {
            if ((float) ($item['discount_pct'] ?? 0) > $maxAllowedDiscount) {
                $validator->errors()->add("items.$i.discount_pct", 'You do not have permission to apply a discount.');
            }
        }
    }

    private function validateItemsAreActive(array $items, ValidatorContract $validator): void
    {
        foreach ($items as $i => $item) {
            $type = $item['product_type'] ?? null;
            $id = $item['product_id'] ?? null;

            if (! $id || ! in_array($type, [Product::class, Service::class], true)) {
                continue;
            }

            $model = $type::where('id', $id)->where('is_active', true)->first();

            if (! $model) {
                $validator->errors()->add("items.$i.product_id", 'This item is not available and cannot be added to an order.');
                continue;
            }

            if ($model->requires_dimensions && (empty($item['length']) || empty($item['breadth']))) {
                $validator->errors()->add("items.$i.length", 'Length and breadth are required for this item.');
            }
        }
    }

    // Dimension-priced items (e.g. LFP prints) are priced per unit area, not
    // by a quantity the user types in directly. The client sends the raw
    // length/breadth so the area -> price lookup happens here, authoritatively,
    // rather than trusting whatever qty/unit_price the browser computed.
    private function resolveItemPricing(array $items): array
    {
        return array_map(function (array $item) {
            $type = $item['product_type'];
            $model = $type::find($item['product_id']);

            if (! $model || ! $model->requires_dimensions) {
                $item['length'] = null;
                $item['breadth'] = null;
                $item['dimension_unit'] = null;

                return $item;
            }

            $unit = $item['dimension_unit'] ?? 'ft';
            $length = (float) $item['length'];
            $breadth = (float) $item['breadth'];
            $area = $unit === 'in' ? ($length * $breadth) / 144 : $length * $breadth;

            $item['qty'] = round($area, 2);
            $item['unit_price'] = $model->getPriceForQuantity($area) ?? (float) $model->default_price;
            $item['length'] = $length;
            $item['breadth'] = $breadth;
            $item['dimension_unit'] = $unit;

            return $item;
        }, $items);
    }
}
