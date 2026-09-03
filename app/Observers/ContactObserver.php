<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Client;
use App\Models\Contact;

class ContactObserver
{
    /**
     * Handle the Contact "created" event.
     */
    public function created(Contact $contact): void
    {
        if (!$contact->client_id) {
            return;
        }

        $attributes = $contact->getAttributes();
        unset($attributes['created_at'], $attributes['updated_at']);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'created_contact',
            'model_type' => Client::class,
            'model_id' => $contact->client_id,
            'old_values' => null,
            'new_values' => $attributes,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Handle the Contact "updated" event.
     */
    public function updated(Contact $contact): void
    {
        if (!$contact->client_id) {
            return;
        }

        $dirty = $contact->getDirty();
        unset($dirty['updated_at']);

        if (empty($dirty)) {
            return;
        }

        $oldValues = [];
        $newValues = [];

        foreach ($dirty as $key => $newValue) {
            $oldValues[$key] = $contact->getOriginal($key);
            $newValues[$key] = $newValue;
        }

        // Include contact identifier for clarity
        $oldValues['_contact_name'] = $contact->getOriginal('first_name') . ' ' . $contact->getOriginal('last_name');
        $newValues['_contact_name'] = $contact->first_name . ' ' . $contact->last_name;

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'updated_contact',
            'model_type' => Client::class,
            'model_id' => $contact->client_id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Handle the Contact "deleted" event.
     */
    public function deleted(Contact $contact): void
    {
        if (!$contact->client_id) {
            return;
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'deleted_contact',
            'model_type' => Client::class,
            'model_id' => $contact->client_id,
            'old_values' => [
                'first_name' => $contact->first_name,
                'last_name' => $contact->last_name,
                'job_title' => $contact->job_title,
            ],
            'new_values' => null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
