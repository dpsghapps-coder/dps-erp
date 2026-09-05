<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfNotSetUp
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->routeIs('setup.*') || $request->routeIs('setup')) {
            return $next($request);
        }

        if (User::count() === 0) {
            return redirect()->route('setup');
        }

        return $next($request);
    }
}
