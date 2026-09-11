<?php

namespace App\Notifications;

use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class HrmNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $action,
        public ?string $employeeName = null,
        public ?int $employeeId = null,
        public ?string $message = null,
        public ?string $url = null
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if (UserNotificationPreference::getForUser($notifiable->id)->hrm) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('HRM Update: '.($this->employeeName ?? 'Employee'))
            ->line($this->getDefaultMessage())
            ->action('View in HRM', url($this->toArray($notifiable)['url']))
            ->line('Thank you for using '.config('app.name').'.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'module' => 'hrm',
            'action' => $this->action,
            'employee_id' => $this->employeeId,
            'employee_name' => $this->employeeName,
            'message' => $this->message ?? $this->getDefaultMessage(),
            'url' => $this->url ?? ($this->employeeId ? '/hrm/employees/'.$this->employeeId : '/hrm'),
        ];
    }

    private function getDefaultMessage(): string
    {
        return match ($this->action) {
            'leave_requested' => ($this->employeeName ?? 'Employee').' has submitted a leave request.',
            'leave_approved' => 'Leave request for '.($this->employeeName ?? 'employee').' has been approved.',
            'leave_rejected' => 'Leave request for '.($this->employeeName ?? 'employee').' has been rejected.',
            'onboarding' => ($this->employeeName ?? 'New employee').' has been onboarded.',
            'performance_initiated' => 'A performance review has been started for you.',
            'performance_self_submitted' => ($this->employeeName ?? 'An employee').'\'s self-assessment is ready for your review.',
            'performance_manager_review' => ($this->employeeName ?? 'An employee').'\'s performance review is ready for your input.',
            'performance_hr_review' => ($this->employeeName ?? 'An employee').'\'s performance review is ready for HR comments.',
            'performance_completed' => 'Your performance review has been completed.',
            default => 'HRM has been updated.',
        };
    }
}
