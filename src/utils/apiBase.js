// Single source of truth for API base URL.
//
// Goals:
// - In dev, prefer same-origin `/api/*` so Vite's proxy can forward to the backend.
// - In prod, if `VITE_API_URL` is set to a different origin, use it.
// - Avoid accidental configuration where API base points to the frontend origin (returns HTML).

export function getApiBaseUrl() {
  // In tests we keep the historical default so fetch expectations remain stable.
  if (import.meta?.env?.MODE === 'test') return 'http://localhost:3000';

  const configured = (import.meta?.env?.VITE_API_URL || '').trim();

  // Default: same-origin. In Vite dev, `/api` is proxied to the backend.
  if (!configured) return '';

  // If VITE_API_URL equals the current origin, use same-origin to avoid HTML responses.
  if (typeof window !== 'undefined') {
    try {
      const currentOrigin = window.location.origin;
      const configuredOrigin = new URL(configured).origin;
      if (configuredOrigin === currentOrigin) return '';
    } catch {
      // If configured isn't a valid absolute URL, fall back to using it as-is.
    }
  }

  return configured.replace(/\/+$/, '');
}
