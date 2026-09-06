<?php

namespace App\Notifications;

use App\Models\PurchaseRequest;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PurchaseRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public PurchaseRequest $purchaseRequest,
        public string $action,
        public ?string $message = null
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if (UserNotificationPreference::getForUser($notifiable->id)->procurement) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Purchase Request Update: '.$this->purchaseRequest->pr_number)
            ->line($this->getDefaultMessage())
            ->action('View Purchase Request', url($this->toArray($notifiable)['url']))
            ->line('Thank you for using '.config('app.name').'.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'module' => 'procurement',
            'action' => $this->action,
            'purchase_request_id' => $this->purchaseRequest->id,
            'pr_number' => $this->purchaseRequest->pr_number,
            'title' => $this->purchaseRequest->title,
            'message' => $this->message ?? $this->getDefaultMessage(),
            'url' => '/procurement/purchase-requests/'.$this->purchaseRequest->id,
        ];
    }

    private function getDefaultMessage(): string
    {
        return match ($this->action) {
            'submitted' => 'Purchase Request '.$this->purchaseRequest->pr_number.' has been submitted for review.',
            'approved' => 'Purchase Request '.$this->purchaseRequest->pr_number.' has been approved.',
            'rejected' => 'Purchase Request '.$this->purchaseRequest->pr_number.' has been rejected.',
            'queried' => 'Purchase Request '.$this->purchaseRequest->pr_number.' has been queried.',
            'held' => 'Purchase Request '.$this->purchaseRequest->pr_number.' has been put on hold.',
            'cancelled' => 'Purchase Request '.$this->purchaseRequest->pr_number.' has been cancelled.',
            'po_created' => 'Purchase Order created for PR '.$this->purchaseRequest->pr_number.'.',
            default => 'Purchase Request '.$this->purchaseRequest->pr_number.' has been updated.',
        };
    }
}
