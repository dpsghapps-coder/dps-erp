<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Client;

class ClientObserver
{
    /**
     * Handle the Client "created" event.
     */
    public function created(Client $client): void
    {
        $attributes = $client->getAttributes();
        unset($attributes['created_at'], $attributes['updated_at']);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'created_client',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'old_values' => null,
            'new_values' => $attributes,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Handle the Client "updated" event.
     */
    public function updated(Client $client): void
    {
        $dirty = $client->getDirty();
        unset($dirty['updated_at']);

        if (empty($dirty)) {
            return;
        }

        $oldValues = [];
        $newValues = [];

        foreach ($dirty as $key => $newValue) {
            $oldValues[$key] = $client->getOriginal($key);
            $newValues[$key] = $newValue;
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'updated_client',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Handle the Client "deleted" event.
     */
    public function deleted(Client $client): void
    {
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'deleted_client',
            'model_type' => Client::class,
            'model_id' => $client->id,
            'old_values' => ['company_name' => $client->company_name],
            'new_values' => null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
