<?php

namespace App\Notifications;

use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
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
        $channels = ['database'];

        if (UserNotificationPreference::getForUser($notifiable->id)->orders) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order Update: '.($this->orderNumber ?? '#'.$this->orderId))
            ->line($this->getDefaultMessage())
            ->action('View Order', url($this->toArray($notifiable)['url']))
            ->line('Thank you for using '.config('app.name').'.');
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
