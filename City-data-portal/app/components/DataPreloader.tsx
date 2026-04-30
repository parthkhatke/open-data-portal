'use client';

import { useEffect, useRef } from 'react';
import { useCivic } from '../context/CivicContext';

const BASE_PATH = '/city-data-portal';
const DEFAULT_YEAR = 2022;

// Dashboard configs (matches dashboards/page.tsx exactly)
// id = cache key used in dashboards-index map, datasetId = API param
const dashboardConfigs = [
  { id: 'demographics', datasetId: 'demographics' },
  { id: 'police', datasetId: 'police' },
  { id: 'transportation', datasetId: 'transportation' },
  { id: 'environment', datasetId: 'environment' },
  { id: 'safety', datasetId: 'safety' },
  { id: 'health', datasetId: 'health' },
  { id: 'economy', datasetId: 'economy' },
  { id: 'education', datasetId: 'education' },
  { id: 'housing', datasetId: 'housing' },
  { id: 'city-services', datasetId: 'city_services' },
  { id: 'civic-engagement', datasetId: 'civic_engagement' },
  { id: 'utilities', datasetId: 'utilities' },
  { id: 'waste-management', datasetId: 'waste_management' },
  { id: 'geographic', datasetId: 'geographic' },
];

// Theme slug → datasetId mapping (matches dashboards/[theme]/page.tsx)
// Each theme slug is a URL segment, the datasetId is what the API expects
const themeToDataset: Record<string, string> = {
  'demographics': 'demographics',
  'economy': 'economy',
  'education': 'education',
  'health': 'health',
  'housing': 'housing',
  'housing-development': 'housing',
  'environment': 'environment',
  'transportation': 'transportation',
  'safety': 'safety',
  'public-safety': 'safety',
  'city-services': 'city_services',
  'civic-engagement': 'civic_engagement',
  'utilities': 'utilities',
  'waste-management': 'waste_management',
  'geographic': 'geographic',
  'police': 'police',
};

// All map datasets to warm up the server-side cache so the Map Explorer loads instantly.
// These match the curated_datasets.json ids and the curls provided for the Lens API.
const MAP_DATASETS = [
  'demographics', 'education', 'health', 'housing', 'environment',
  'transportation', 'safety', 'city_services', 'civic_engagement',
  'utilities', 'waste_management', 'services', 'geographic', 'police',
  // 'economy' is hidden from the map dropdown but we still warm its cache
  'economy',
];

// Popular neighborhood names shown on the homepage quick-access buttons.
// The actual slug + NPA are resolved dynamically from the neighborhoods API
// data (which is backed by npa_names.json) so they always match the homepage links.
const POPULAR_NAMES = ['Uptown', 'Myers Park', 'NoDa East', 'Ballantyne North', 'Dilworth Historic District', 'Plaza Midwood East', 'SouthPark North'];

/**
 * DataPreloader - Invisible component that prefetches key data in the background.
 * 
 * Preload order (highest priority first):
 * 1. Neighborhoods list → cache key: 'neighborhoods-all'
 * 2. 7 Popular neighborhoods → cache key: 'neighborhood:{slug}:{npa}'
 * 3. Dashboard metrics + Police comprehensive (parallel)
 * 4. All map datasets → warms server-side apiCache for /api/datasets/{id}
 * 
 * All data is stored in CivicContext's in-memory cache (useRef),
 * which persists across client-side navigations within the session.
 */
export default function DataPreloader() {
  const { getCachedData, setCachedData } = useCivic();
  const preloadStarted = useRef(false);

  useEffect(() => {
    // Only run once per session
    if (preloadStarted.current) return;
    preloadStarted.current = true;

    // Small delay so we don't block initial page render/paint
    const timer = setTimeout(() => {
      preloadAll();
    }, 300);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function preloadAll() {
    console.log('[Preloader] Starting background data preload...');

    // Phase 1: Fetch the neighborhoods list (needed to resolve popular neighborhoods).
    await preloadNeighborhoods();

    // Phase 2: Load the 7 popular neighborhoods first — these are the most
    // likely pages a user visits right after the homepage.
    await preloadPopularNeighborhoods();

    // Phase 3: All dashboards + police comprehensive data in parallel.
    await Promise.allSettled([
      preloadDashboardMetrics(),
      preloadPoliceComprehensive(),
    ]);

    // Phase 4: Warm the server-side cache for every map dataset (lowest priority).
    await preloadMapDatasets();

    console.log('[Preloader] All preloading complete.');
  }

  /**
   * Preloads all dashboard metrics.
   * Populates both:
   *   - 'dashboards-index' (map of all domain metrics for the index page)
   *   - 'theme-dashboard:{slug}' (individual metrics for each theme dashboard page)
   */
  async function preloadDashboardMetrics() {
    // Skip entirely if dashboard index is already cached (means we've preloaded before)
    if (getCachedData('dashboards-index')) {
      console.log('[Preloader] Dashboard metrics already cached, skipping.');
      return;
    }

    try {
      // Deduplicate datasetIds to avoid double-fetching (e.g., housing & housing-development share same datasetId)
      const uniqueDatasetIds = [...new Set(dashboardConfigs.map(c => c.datasetId))];

      // Fetch all metrics in parallel
      const responses = await Promise.allSettled(
        uniqueDatasetIds.map(async (datasetId) => {
          const response = await fetch(`${BASE_PATH}/api/metrics/${datasetId}?year=${DEFAULT_YEAR}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          return { datasetId, data };
        })
      );

      // Build the dashboard index map (keyed by config.id)
      const indexMap: Record<string, any> = {};

      // Process successful responses
      const dataByDatasetId: Record<string, any> = {};
      for (const result of responses) {
        if (result.status === 'fulfilled') {
          const { datasetId, data } = result.value;
          dataByDatasetId[datasetId] = data;
        }
      }

      // Populate dashboard index cache (keyed by config.id, not datasetId)
      for (const config of dashboardConfigs) {
        const data = dataByDatasetId[config.datasetId];
        if (data?.metrics) {
          indexMap[config.id] = data.metrics;
        }
      }
      setCachedData('dashboards-index', indexMap);
      console.log(`[Preloader] Dashboard index cached (${Object.keys(indexMap).length} domains)`);

      // Populate individual theme dashboard caches
      for (const [themeSlug, datasetId] of Object.entries(themeToDataset)) {
        const cacheKey = `theme-dashboard:${themeSlug}`;
        if (getCachedData(cacheKey)) continue;

        const data = dataByDatasetId[datasetId];
        if (data?.metrics) {
          const yearRange = data.yearRange
            ? { min: data.yearRange.minYear, max: data.yearRange.maxYear }
            : null;
          setCachedData(cacheKey, { metrics: data.metrics, yearRange });
        }
      }
      console.log('[Preloader] Theme dashboard caches populated');
    } catch (err) {
      console.error('[Preloader] Dashboard metrics preload error:', err);
    }
  }

  /**
   * Preloads the police comprehensive data for the police dashboard.
   */
  async function preloadPoliceComprehensive() {
    const CACHE_KEY = 'dashboard:police';
    if (getCachedData(CACHE_KEY)) {
      console.log('[Preloader] Police data already cached, skipping.');
      return;
    }

    try {
      const response = await fetch(`${BASE_PATH}/api/metrics/police/comprehensive`);
      if (response.ok) {
        const data = await response.json();
        setCachedData(CACHE_KEY, data);
        console.log('[Preloader] Police comprehensive data cached');
      }
    } catch (err) {
      console.error('[Preloader] Police preload error:', err);
    }
  }

  /**
   * Preloads all neighborhoods data and stores in CivicContext cache.
   */
  async function preloadNeighborhoods() {
    const CACHE_KEY = 'neighborhoods-all';
    const MIN_EXPECTED = 400; // npa_names.json has 460 neighborhoods
    const existing = getCachedData(CACHE_KEY);
    if (existing?.neighborhoods?.length >= MIN_EXPECTED) {
      console.log(`[Preloader] Neighborhoods already cached (${existing.neighborhoods.length}), skipping.`);
      return;
    }

    try {
      const response = await fetch(`${BASE_PATH}/api/neighborhoods/all`);
      if (response.ok) {
        const data = await response.json();
        setCachedData(CACHE_KEY, data);

        // Also update localStorage cache for the homepage
        // Key must match the versioned key in page.tsx
        if (typeof window !== 'undefined') {
          localStorage.setItem('neighborhoods_cache_v2', JSON.stringify({
            data,
            timestamp: Date.now(),
          }));
        }
        console.log(`[Preloader] Neighborhoods cached (${data.neighborhoods?.length || 0} neighborhoods)`);
      }
    } catch (err) {
      console.error('[Preloader] Neighborhoods preload error:', err);
    }
  }

  /**
   * Warms the server-side apiCache for every map dataset by calling /api/datasets/{id}.
   * Each dataset endpoint fetches from the Lens API and caches the result for 10 min.
   * After this, the Map Explorer loads any dataset nearly instantly.
   *
   * Requests are batched (3 at a time) to avoid flooding the Lens API.
   */
  async function preloadMapDatasets() {
    const BATCH_SIZE = 3;
    let loaded = 0;
    let failed = 0;

    for (let i = 0; i < MAP_DATASETS.length; i += BATCH_SIZE) {
      const batch = MAP_DATASETS.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (id) => {
          const res = await fetch(`${BASE_PATH}/api/datasets/${id}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          // Read body to ensure the server fully processes the request
          await res.json();
          return id;
        })
      );
      for (const r of results) {
        if (r.status === 'fulfilled') loaded++;
        else failed++;
      }
    }

    console.log(
      `[Preloader] Map datasets server cache warmed (${loaded}/${MAP_DATASETS.length} OK${failed ? `, ${failed} failed` : ''})`
    );
  }

  /**
   * Preloads metrics for popular neighborhoods so they load instantly.
   *
   * The slug + NPA are resolved from the neighborhoods list (populated by
   * preloadNeighborhoods) so they exactly match the homepage link:
   *   router.push(`/neighborhoods/${neighborhood.slug}?npa=${neighborhood.npa}`)
   *
   * Cache key: 'neighborhood:{slug}:{npa}' → { metrics, dynamicInfo }
   */
  async function preloadPopularNeighborhoods() {
    // Resolve real slug + NPA from the neighborhoods list (already cached)
    const cached = getCachedData('neighborhoods-all');
    const allNeighborhoods: { npa: number; name: string; slug: string }[] =
      cached?.neighborhoods || [];

    if (allNeighborhoods.length === 0) {
      console.warn('[Preloader] No neighborhoods data yet, skipping popular preload.');
      return;
    }

    // Find each popular name in the canonical list → get correct slug & NPA
    const resolved = POPULAR_NAMES
      .map((name) => allNeighborhoods.find((n) => n.name === name))
      .filter(Boolean) as { npa: number; name: string; slug: string }[];

    const toPreload = resolved.filter(
      (n) => !getCachedData(`neighborhood:${n.slug}:${n.npa}`)
    );

    if (toPreload.length === 0) {
      console.log('[Preloader] Popular neighborhoods already cached, skipping.');
      return;
    }

    console.log(
      `[Preloader] Preloading ${toPreload.length} popular neighborhoods:`,
      toPreload.map((n) => `${n.name} (slug=${n.slug}, npa=${n.npa})`).join(', ')
    );

    try {
      const results = await Promise.allSettled(
        toPreload.map(async ({ slug, npa, name }) => {
          const response = await fetch(
            `${BASE_PATH}/api/neighborhoods/${npa}/metrics?year=${DEFAULT_YEAR}`
          );
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          return { slug, npa, name, data };
        })
      );

      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        const { slug, npa, name, data } = result.value;

        const metrics = {
          safety: {
            totalRecords: data.safety?.totalRecords || 0,
            crimeRate: data.safety?.crimeRate || data.safety?.avgNormalizedValue || 0,
            avgResponse: 4.2,
            trend: -8,
          },
          housing: {
            totalRecords: data.housing?.totalRecords || 0,
            newPermits: Math.max(1, Math.round((data.housing?.totalRecords || 0) / 10)),
            medianPrice: data.housing?.medianHomeValue || 0,
            priceChange: 12,
          },
          environment: {
            treeCanopy: data.environment?.treeCanopy || data.environment?.avgNormalizedValue || 0,
            airQuality: 45,
            totalRecords: data.environment?.totalRecords || 0,
          },
          demographics: {
            population: data.demographics?.population || 0,
            totalRecords: data.demographics?.totalRecords || 0,
          },
        };

        const dynamicInfo =
          data.demographics?.population > 0 || data.demographics?.totalRecords > 0
            ? {
                name,
                npa,
                population: data.demographics?.population || 0,
                description: `NPA ${npa} - A Charlotte neighborhood.`,
                accent: (['transportation', 'housing', 'economy', 'environment', 'safety'] as const)[npa % 5],
                character: 'Neighborhood',
              }
            : null;

        setCachedData(`neighborhood:${slug}:${npa}`, { metrics, dynamicInfo });
      }

      const ok = results.filter((r) => r.status === 'fulfilled').length;
      console.log(`[Preloader] Popular neighborhoods cached (${ok}/${toPreload.length})`);
    } catch (err) {
      console.error('[Preloader] Popular neighborhoods preload error:', err);
    }
  }

  // Invisible component - renders nothing
  return null;
}
