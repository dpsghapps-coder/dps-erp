<?php

namespace App\Notifications;

use App\Models\Campaign;
use App\Models\UserNotificationPreference;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CampaignNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $action,
        public ?Campaign $campaign = null,
        public ?string $message = null
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if (UserNotificationPreference::getForUser($notifiable->id)->marketing) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Campaign Update: '.($this->campaign?->title ?? 'Campaign'))
            ->line($this->getDefaultMessage())
            ->action('View Campaign', url($this->toArray($notifiable)['url']))
            ->line('Thank you for using '.config('app.name').'.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'module' => 'marketing',
            'action' => $this->action,
            'campaign_id' => $this->campaign?->id,
            'campaign_number' => $this->campaign?->number,
            'campaign_title' => $this->campaign?->title,
            'message' => $this->message ?? $this->getDefaultMessage(),
            'url' => $this->campaign ? '/marketing/'.$this->campaign->id : '/marketing',
        ];
    }

    private function getDefaultMessage(): string
    {
        $title = $this->campaign?->title ?? 'Campaign';

        return match ($this->action) {
            'created' => 'New campaign "'.$title.'" has been created.',
            'updated' => 'Campaign "'.$title.'" has been updated.',
            'status_changed' => 'Campaign "'.$title.'" status has been changed to '.$this->campaign->status.'.',
            'reminder' => 'Reminder: Campaign "'.$title.'" starts on '.$this->campaign->start_date->format('M d, Y').'.',
            default => 'Campaign "'.$title.'" has been updated.',
        };
    }
}
