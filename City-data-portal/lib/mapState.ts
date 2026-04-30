/**
 * Persisted map view state helpers.
 * SSR-safe: no Leaflet or browser-only imports.
 */

const LS_MAP_ZOOM = 'cdp-map-zoom';
const LS_MAP_CENTER = 'cdp-map-center';

/** Read persisted map zoom/center from localStorage (returns null if nothing saved or on server). */
export function getPersistedMapState(): { center: [number, number]; zoom: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const zoom = localStorage.getItem(LS_MAP_ZOOM);
    const center = localStorage.getItem(LS_MAP_CENTER);
    if (zoom && center) {
      const parsed = JSON.parse(center);
      if (Array.isArray(parsed) && parsed.length === 2) {
        return { zoom: Number(zoom), center: [Number(parsed[0]), Number(parsed[1])] };
      }
    }
  } catch { /* ignore */ }
  return null;
}

/** Save map zoom + center to localStorage. */
export function persistMapState(zoom: number, lat: number, lng: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_MAP_ZOOM, String(zoom));
    localStorage.setItem(LS_MAP_CENTER, JSON.stringify([lat, lng]));
  } catch { /* quota / SSR */ }
}
