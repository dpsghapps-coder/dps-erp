<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class HrmNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $action,
        public ?string $employeeName = null,
        public ?int $employeeId = null,
        public ?string $message = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'module' => 'hrm',
            'action' => $this->action,
            'employee_id' => $this->employeeId,
            'employee_name' => $this->employeeName,
            'message' => $this->message ?? $this->getDefaultMessage(),
            'url' => $this->employeeId ? '/hrm/employees/'.$this->employeeId : '/hrm',
        ];
    }

    private function getDefaultMessage(): string
    {
        return match ($this->action) {
            'leave_requested' => ($this->employeeName ?? 'Employee').' has submitted a leave request.',
            'leave_approved' => 'Leave request for '.($this->employeeName ?? 'employee').' has been approved.',
            'leave_rejected' => 'Leave request for '.($this->employeeName ?? 'employee').' has been rejected.',
            'onboarding' => ($this->employeeName ?? 'New employee').' has been onboarded.',
            default => 'HRM has been updated.',
        };
    }
}
