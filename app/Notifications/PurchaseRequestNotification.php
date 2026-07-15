<?php

namespace App\Notifications;

use App\Models\PurchaseRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
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
        return ['database'];
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
            'po_created' => 'Purchase Order created for PR '.$this->purchaseRequest->pr_number.'.',
            default => 'Purchase Request '.$this->purchaseRequest->pr_number.' has been updated.',
        };
    }
}
