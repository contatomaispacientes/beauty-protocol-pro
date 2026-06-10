/**
 * Service Worker registration wrapper.
 * Only registers in production, outside preview/dev, and with a kill switch.
 * Follows Lovable PWA skill guidelines.
 */

const SW_PATH = '/sw.js';

function shouldRegister(): boolean {
  if (!('serviceWorker' in navigator)) return false;
  if (!import.meta.env.PROD) return false;
  if (window.self !== window.top) return false; // inside iframe

  const hostname = location.hostname;
  if (hostname.startsWith('id-preview--') || hostname.startsWith('preview--')) return false;
  if (hostname === 'lovableproject.com' || hostname.endsWith('.lovableproject.com')) return false;
  if (hostname === 'lovableproject-dev.com' || hostname.endsWith('.lovableproject-dev.com')) return false;
  if (hostname === 'beta.lovable.dev' || hostname.endsWith('.beta.lovable.dev')) return false;

  const url = new URL(location.href);
  if (url.searchParams.get('sw') === 'off') return false;

  return true;
}

async function unregisterStale(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((r) => r.scope.includes(location.origin) && r.active?.scriptURL?.endsWith(SW_PATH))
        .map((r) => r.unregister())
    );
  } catch {
    // ignore cleanup errors
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (!shouldRegister()) {
    await unregisterStale();
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: '/',
    });

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'activated') {
          // Optional: notify user that an update is available
          // console.log('New content is available; please refresh.');
        }
      });
    });
  } catch (err) {
    console.warn('Service worker registration failed:', err);
  }
}
