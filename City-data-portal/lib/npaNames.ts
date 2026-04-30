/**
 * Shared NPA (Neighborhood Profile Area) to neighborhood name mapping.
 * Names come from mock data in data/npa_names.json (no external CSV).
 * All other data (population, metrics, map values) comes from the API.
 */
import npaNamesFromCsv from '../data/npa_names.json';

const NPA_NAMES_RAW = npaNamesFromCsv as Record<string, string>;

/** NPA number → display name. Use getNpaName() for fallback. */
export const NPA_NAMES: Record<string, string> = NPA_NAMES_RAW;

function fallbackNpaName(npa: number | string): string {
  const key = typeof npa === 'string' ? npa : String(npa);
  return `Neighborhood ${key}`;
}

export function getNpaName(npa: number | string): string {
  const key = typeof npa === 'string' ? npa : String(npa);
  return NPA_NAMES[key] ?? fallbackNpaName(key);
}
