<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\JobStatusHistory;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductionJob;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
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

        $order = DB::transaction(function () use ($validated) {
            $order = Order::create([
                'client_id' => $validated['client_id'],
                'contact_id' => $validated['contact_id'] ?? null,
                'delivery_date' => $validated['delivery_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'order_number' => Order::generateOrderNumber(),
                'currency' => Setting::get('currency', 'GHS'),
                'created_by' => auth()->id(),
                'status' => Order::STATUS_DRAFT,
            ]);

            foreach ($validated['items'] as $item) {
                $order->items()->create($item);
            }

            $order->calculateTotals();

            $order->statusHistory()->create([
                'old_status' => null,
                'new_status' => Order::STATUS_DRAFT,
                'changed_by' => auth()->id(),
                'notes' => 'Order created',
            ]);

            return $order;
        });

        return redirect()->route('orders.index')->with('success', 'Order created successfully');
    }

    public function show(Order $order)
    {
        $order->load(['client', 'contact', 'items.product', 'createdBy', 'productionJobs.assignedTo', 'productionJobs.statusHistory.changedBy', 'payments.recordedBy', 'statusHistory.changedBy']);
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
            ]);

            $order->items()->delete();
            foreach ($validated['items'] as $item) {
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

        return back()->with('success', 'Payment recorded');
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
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.product_type' => 'required|in:App\Models\Product,App\Models\Service',
            'items.*.description' => 'nullable|string|max:255',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_pct' => 'nullable|numeric|min:0|max:100',
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

            $exists = $type::where('id', $id)->where('is_active', true)->exists();

            if (! $exists) {
                $validator->errors()->add("items.$i.product_id", 'This item is not available and cannot be added to an order.');
            }
        }
    }
}
