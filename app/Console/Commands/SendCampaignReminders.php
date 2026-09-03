<?php

namespace App\Console\Commands;

use App\Models\CampaignReminder;
use App\Models\UserNotificationPreference;
use App\Notifications\CampaignNotification;
use Illuminate\Console\Command;

class SendCampaignReminders extends Command
{
    protected $signature = 'marketing:send-reminders';

    protected $description = 'Dispatch pending campaign reminders whose remind_at has passed';

    public function handle(): int
    {
        $reminders = CampaignReminder::with('campaign', 'user')
            ->where('sent', false)
            ->where('remind_at', '<=', now())
            ->get();

        $sent = 0;

        foreach ($reminders as $reminder) {
            if (! $reminder->campaign || ! $reminder->user) {
                $reminder->update(['sent' => true]);
                continue;
            }

            $prefs = UserNotificationPreference::getForUser($reminder->user_id);
            if (! $prefs->marketing) {
                $reminder->update(['sent' => true]);
                continue;
            }

            $reminder->user->notify(new CampaignNotification('reminder', $reminder->campaign));
            $reminder->update(['sent' => true]);
            $sent++;
        }

        $this->info("Sent {$sent} campaign reminder(s).");

        return self::SUCCESS;
    }
}
