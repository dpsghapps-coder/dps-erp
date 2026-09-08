<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectIfNotSetUp;
use App\Http\Middleware\TouchUserActivity;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            RedirectIfNotSetUp::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            TouchUserActivity::class,
        ]);

        $middleware->alias([
            'permission' => CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (HttpException $e) {
            if ($e->getStatusCode() === 419) {
                return redirect()->route('login')->with('status', 'Your session expired. Please sign in again.');
            }
        });
    })->create();
