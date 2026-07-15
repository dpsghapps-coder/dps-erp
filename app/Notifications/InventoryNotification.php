<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InventoryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $action,
        public ?string $itemName = null,
        public ?int $itemId = null,
        public ?string $message = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'module' => 'inventory',
            'action' => $this->action,
            'item_id' => $this->itemId,
            'item_name' => $this->itemName,
            'message' => $this->message ?? $this->getDefaultMessage(),
            'url' => $this->itemId ? '/inventory/products/'.$this->itemId : '/inventory',
        ];
    }

    private function getDefaultMessage(): string
    {
        return match ($this->action) {
            'low_stock' => 'Low stock alert for '.($this->itemName ?? 'item').'.',
            'stock_added' => 'Stock added for '.($this->itemName ?? 'item').'.',
            'stock_removed' => 'Stock removed for '.($this->itemName ?? 'item').'.',
            default => 'Inventory has been updated.',
        };
    }
}
