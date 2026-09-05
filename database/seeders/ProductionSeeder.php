<?php

namespace Database\Seeders;

use App\Models\JobStatusHistory;
use App\Models\Order;
use App\Models\ProductionJob;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $inProductionOrders = Order::where('status', Order::STATUS_IN_PRODUCTION)->get();
        $readyOrders = Order::where('status', Order::STATUS_READY)->get();
        $deliveredOrders = Order::where('status', Order::STATUS_DELIVERED)->get();
        $cancelledOrders = Order::where('status', Order::STATUS_CANCELLED)->get();

        $activeStages = ['new_jobs', 'design', 'printing', 'assembly', 'qc_inspection'];

        foreach ($inProductionOrders as $i => $order) {
            $this->createJob($order, $activeStages[$i % count($activeStages)], $users, $i);
        }

        foreach ($readyOrders as $i => $order) {
            $this->createJob($order, 'completed', $users, $i + 10);
        }

        foreach ($deliveredOrders as $i => $order) {
            $this->createJob($order, 'completed', $users, $i + 20);
        }

        foreach ($cancelledOrders as $i => $order) {
            $this->createJob($order, 'cancelled', $users, $i + 30);
        }

        // One paused job for Kanban variety, on the first in-production order.
        if ($inProductionOrders->isNotEmpty()) {
            $this->createJob($inProductionOrders->first(), 'paused', $users, 99, ' (Paused)');
        }
    }

    private function createJob(Order $order, string $status, $users, int $seedIndex, string $titleSuffix = ''): void
    {
        $priorities = ['low', 'normal', 'high', 'urgent'];
        $assignee = $users[$seedIndex % $users->count()];

        $job = ProductionJob::create([
            'job_number' => ProductionJob::generateJobNumber(),
            'order_id' => $order->id,
            'title' => 'Job for '.$order->order_number.$titleSuffix,
            'description' => 'Production run for order '.$order->order_number,
            'status' => $status,
            'priority' => $priorities[$seedIndex % count($priorities)],
            'assigned_to' => $assignee->id,
            'started_at' => in_array($status, ['new_jobs'], true) ? null : now()->subDays(3),
            'due_date' => $order->delivery_date,
            'completed_at' => $status === 'completed' ? now()->subDay() : null,
        ]);

        $job->populateMaterialsFromOrder($order);

        JobStatusHistory::create([
            'production_job_id' => $job->id,
            'old_status' => null,
            'new_status' => 'new_jobs',
            'changed_by' => $assignee->id,
            'notes' => 'Job created',
        ]);

        if ($status !== 'new_jobs') {
            JobStatusHistory::create([
                'production_job_id' => $job->id,
                'old_status' => 'new_jobs',
                'new_status' => $status,
                'changed_by' => $assignee->id,
                'notes' => null,
            ]);
        }
    }
}
