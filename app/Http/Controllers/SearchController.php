<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductionJob;
use App\Models\StudioBooking;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');

        if (! $query || strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $query = '%'.$query.'%';

        $results = [];

        // Clients
        $clients = Client::where('company_name', 'like', $query)
            ->orWhere('email', 'like', $query)
            ->limit(5)
            ->get(['id', 'company_name', 'email']);

        foreach ($clients as $client) {
            $results[] = [
                'type' => 'Client',
                'title' => $client->company_name,
                'subtitle' => $client->email,
                'href' => "/crm/{$client->id}",
            ];
        }

        // Products
        $products = Product::where('name', 'like', $query)
            ->orWhere('sku', 'like', $query)
            ->limit(5)
            ->get(['id', 'name', 'sku']);

        foreach ($products as $product) {
            $results[] = [
                'type' => 'Product',
                'title' => $product->name,
                'subtitle' => $product->sku,
                'href' => "/products/{$product->id}/edit",
            ];
        }

        // Orders
        $orders = Order::where('order_number', 'like', $query)
            ->with('client')
            ->limit(5)
            ->get(['id', 'order_number']);

        foreach ($orders as $order) {
            $results[] = [
                'type' => 'Order',
                'title' => $order->order_number,
                'subtitle' => $order->client?->company_name ?? '',
                'href' => "/orders/{$order->id}",
            ];
        }

        // Production Jobs
        $jobs = ProductionJob::where('title', 'like', $query)
            ->orWhere('job_number', 'like', $query)
            ->limit(5)
            ->get(['id', 'title', 'job_number']);

        foreach ($jobs as $job) {
            $results[] = [
                'type' => 'Job',
                'title' => $job->title,
                'subtitle' => $job->job_number,
                'href' => "/production/{$job->id}",
            ];
        }

        // Employees
        $employees = Employee::where('first_name', 'like', $query)
            ->orWhere('last_name', 'like', $query)
            ->orWhere('employee_number', 'like', $query)
            ->limit(5)
            ->get(['id', 'first_name', 'last_name', 'employee_number']);

        foreach ($employees as $employee) {
            $results[] = [
                'type' => 'Employee',
                'title' => "{$employee->first_name} {$employee->last_name}",
                'subtitle' => $employee->employee_number,
                'href' => "/hrm/{$employee->id}",
            ];
        }

        // Studio Bookings
        $bookings = StudioBooking::where('event_name', 'like', $query)
            ->limit(5)
            ->get(['id', 'event_name']);

        foreach ($bookings as $booking) {
            $results[] = [
                'type' => 'Booking',
                'title' => $booking->event_name,
                'subtitle' => 'Studio Booking',
                'href' => "/studio/{$booking->id}",
            ];
        }

        return response()->json(['results' => $results]);
    }
}
