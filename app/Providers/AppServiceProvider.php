<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Contact;
use App\Observers\ClientObserver;
use App\Observers\ContactObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Client::observe(ClientObserver::class);
        Contact::observe(ContactObserver::class);
    }
}
