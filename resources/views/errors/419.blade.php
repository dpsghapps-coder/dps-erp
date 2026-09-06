<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Session Expired - {{ config('app.name', 'Laravel') }}</title>

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />

    <script>
        (function () {
            var saved = localStorage.getItem('theme');
            var theme = saved === 'light' || saved === 'dark'
                ? saved
                : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.documentElement.classList.add(theme);
        })();
    </script>

    @vite(['resources/css/app.css'])
</head>
<body class="font-sans antialiased">
    <div class="relative min-h-screen flex items-center justify-center overflow-hidden bg-[color:var(--color-bg)] px-4">
        {{-- Ambient gradient blobs --}}
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
            <div class="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-indigo-400/20 dark:bg-indigo-500/10 blur-3xl"></div>
            <div class="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-violet-400/20 dark:bg-violet-500/10 blur-3xl"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-indigo-300/10 dark:bg-indigo-400/5 blur-3xl"></div>
        </div>

        <div class="relative w-full max-w-md animate-scale-in">
            <div class="glass-card !p-8 sm:!p-10 text-center">
                {{-- Icon --}}
                <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                     style="background: linear-gradient(135deg, rgb(79, 70, 229), rgb(139, 92, 246));">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                    </svg>
                </div>

                <p class="text-sm font-semibold tracking-wide text-indigo-600 dark:text-indigo-400 uppercase">Error 419</p>
                <h1 class="mt-2 text-2xl sm:text-3xl font-bold text-[color:var(--color-text)]">
                    Your session has expired
                </h1>
                <p class="mt-3 text-sm sm:text-base text-[color:var(--color-text-secondary)] leading-relaxed">
                    You've been away for a while, so for your security we ended the session.
                    Refresh the page and sign in again to keep going.
                </p>

                <div class="mt-8 flex flex-col sm:flex-row gap-3">
                    <button onclick="window.location.reload()" class="glass-button w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                            <path d="M8 16H3v5" />
                        </svg>
                        Refresh &amp; try again
                    </button>
                    <a href="{{ route('dashboard') }}" class="glass-button-secondary w-full">
                        Back to dashboard
                    </a>
                </div>
            </div>

            <p class="mt-6 text-center text-xs text-[color:var(--color-text-muted)]">
                {{ config('app.name', 'Laravel') }} &middot; If this keeps happening, contact your administrator.
            </p>
        </div>
    </div>
</body>
</html>
