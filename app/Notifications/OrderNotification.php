<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class OrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $orderId,
        public string $action,
        public ?string $orderNumber = null,
        public ?string $message = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'module' => 'orders',
            'action' => $this->action,
            'order_id' => $this->orderId,
            'order_number' => $this->orderNumber,
            'message' => $this->message ?? $this->getDefaultMessage(),
            'url' => '/orders/'.$this->orderId,
        ];
    }

    private function getDefaultMessage(): string
    {
        return match ($this->action) {
            'created' => 'New order '.($this->orderNumber ?? '#'.$this->orderId).' has been created.',
            'status_changed' => 'Order '.($this->orderNumber ?? '#'.$this->orderId).' status has been updated.',
            'payment_received' => 'Payment received for order '.($this->orderNumber ?? '#'.$this->orderId).'.',
            default => 'Order '.($this->orderNumber ?? '#'.$this->orderId).' has been updated.',
        };
    }
}
