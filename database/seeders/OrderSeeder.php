<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Order;
use App\Models\Product;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Auth;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $clients = Client::all();
        $products = Product::with('components')->get();
        $services = Service::all();
        $users = User::all();
        $currency = Setting::get('currency', 'GHS');

        if ($clients->isEmpty() || $products->isEmpty() || $users->isEmpty()) {
            return;
        }

        Auth::login($users->first());

        // [target status, payment: 'none' | 'partial' | 'full', days offset for delivery date]
        $plan = [
            ['draft', 'none', 14],
            ['draft', 'none', 21],
            ['confirmed', 'none', 10],
            ['confirmed', 'none', 18],
            ['payment_received', 'partial', 7],
            ['payment_received', 'full', 12],
            ['in_production', 'full', 5],
            ['in_production', 'full', 6],
            ['in_production', 'full', 8],
            ['in_production', 'full', 9],
            ['in_production', 'full', 4],
            ['ready', 'full', 2],
            ['ready', 'full', 3],
            ['ready', 'full', 1],
            ['delivered', 'full', -3],
            ['delivered', 'full', -7],
            ['delivered', 'full', -14],
            ['cancelled', 'none', 20],
        ];

        foreach ($plan as $i => [$targetStatus, $paymentMode, $deliveryOffset]) {
            $client = $clients[$i % $clients->count()];
            $creator = $users[$i % $users->count()];

            $order = Order::create([
                'client_id' => $client->id,
                'contact_id' => $client->contacts()->first()?->id,
                'delivery_date' => now()->addDays($deliveryOffset)->toDateString(),
                'notes' => null,
                'order_number' => Order::generateOrderNumber(),
                'currency' => $currency,
                'created_by' => $creator->id,
                'status' => Order::STATUS_DRAFT,
            ]);

            $lineCount = 1 + ($i % 2);
            for ($l = 0; $l < $lineCount; $l++) {
                $product = $products[($i + $l) % $products->count()];
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_type' => Product::class,
                    'description' => $product->name,
                    'qty' => [12, 24, 6, 50, 3][($i + $l) % 5],
                    'unit_price' => $product->prices->first()?->unit_price ?? 50,
                    'discount_pct' => $i % 7 === 0 ? 5 : 0,
                ]);
            }

            if ($services->isNotEmpty() && $i % 4 === 0) {
                $service = $services[$i % $services->count()];
                $order->items()->create([
                    'product_id' => $service->id,
                    'product_type' => Service::class,
                    'description' => $service->name,
                    'qty' => 1,
                    'unit_price' => $service->default_price ?: 25,
                    'discount_pct' => 0,
                ]);
            }

            $order->calculateTotals();

            $order->statusHistory()->create([
                'old_status' => null,
                'new_status' => Order::STATUS_DRAFT,
                'changed_by' => $creator->id,
                'notes' => 'Order created',
            ]);

            $path = ['draft', 'confirmed', 'payment_received', 'in_production', 'ready', 'delivered'];
            if ($targetStatus === 'cancelled') {
                $order->transitionTo('cancelled', 'Client cancelled the order');
            } else {
                foreach ($path as $status) {
                    if ($status === 'draft') {
                        continue;
                    }
                    $order->transitionTo($status);
                    if ($status === $targetStatus) {
                        break;
                    }
                }
            }

            if ($paymentMode !== 'none') {
                $amount = $paymentMode === 'full' ? $order->grand_total : round($order->grand_total * 0.5, 2);
                $order->payments()->create([
                    'payment_method' => ['cash', 'mobile_money', 'bank_transfer'][$i % 3],
                    'mobile_money_provider' => $i % 3 === 1 ? 'mtn_momo' : null,
                    'amount' => $amount,
                    'recorded_by' => $creator->id,
                ]);
            }
        }
    }
}
