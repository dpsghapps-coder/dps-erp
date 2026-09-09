import axios from 'axios';
import { toast } from 'sonner';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.axios.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
});

// Service workers require a secure context (HTTPS or localhost) — silently
// no-ops elsewhere (e.g. a plain-HTTP LAN IP), same as the Clipboard API.
if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });

    // sw.js calls skipWaiting()/clients.claim() unconditionally, so a new
    // service worker takes over as soon as it's fetched — this event is how
    // we find out. The *first* controllerchange on a page load just means
    // "a worker took control for the first time," not "an update happened,"
    // so only treat it as an update once a controller already existed.
    let hadController = Boolean(navigator.serviceWorker.controller);
    let reloading = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController) {
            hadController = true;
            return;
        }

        if (reloading) {
            return;
        }

        toast('A new version of the app is available.', {
            duration: Infinity,
            action: {
                label: 'Reload',
                onClick: () => {
                    reloading = true;
                    window.location.reload();
                },
            },
        });
    });
}
