<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('client')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return inertia('Orders/Index', ['orders' => $orders]);
    }

    public function create()
    {
        $clients = Client::whereIn('status', ['prospect', 'active'])->get();

        return inertia('Orders/Create', ['clients' => $clients]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_pct' => 'nullable|numeric|min:0|max:100',
        ]);

        $order = Order::create(array_merge($validated, [
            'order_number' => Order::generateOrderNumber(),
            'created_by' => auth()->id(),
            'status' => 'draft',
        ]));

        foreach ($validated['items'] as $item) {
            $item['line_total'] = $item['qty'] * $item['unit_price'] * (1 - ($item['discount_pct'] ?? 0) / 100);
            $order->items()->create($item);
        }

        $order->calculateTotals();

        return redirect()->route('orders.index')->with('success', 'Order created successfully');
    }

    public function show(Order $order)
    {
        $order->load(['client', 'contact', 'items.product', 'createdBy', 'productionJobs']);

        return inertia('Orders/Show', ['order' => $order]);
    }

    public function edit(Order $order)
    {
        $clients = Client::whereIn('status', ['prospect', 'active'])->get();
        $order->load('items');

        return inertia('Orders/Edit', ['order' => $order, 'clients' => $clients]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
        ]);

        $order->update($validated);

        $order->items()->delete();
        foreach ($validated['items'] as $item) {
            $item['line_total'] = $item['qty'] * $item['unit_price'] * (1 - ($item['discount_pct'] ?? 0) / 100);
            $order->items()->create($item);
        }

        $order->calculateTotals();

        return redirect()->route('orders.show', $order->id)->with('success', 'Order updated successfully');
    }

    public function confirm(Order $order)
    {
        $order->update(['status' => 'confirmed']);

        return back()->with('success', 'Order confirmed');
    }

    public function cancel(Order $order)
    {
        $order->update(['status' => 'cancelled']);

        return back()->with('success', 'Order cancelled');
    }
}
