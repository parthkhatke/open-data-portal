import { NextResponse } from 'next/server';
import { apiCache } from '@/lib/cache';
import { NPA_NAMES, getNpaName } from '@/lib/npaNames';

const LENS_API_URL = process.env.LENS_API_URL || 'https://known-racer.mydataos.com/lens2/api/public:city-portal-360/v2/load';
const BEARER_TOKEN = process.env.BEARER_TOKEN || 'cHNvdG1hbi40NmM4ZjIwZi05Nzg1LTQwNjYtOTAwMy1lNjk1ZDk3ZjMxYjk=';

// Cache TTL in minutes - increased since year is fixed (no time machine)
const CACHE_TTL = 120;

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function queryLensAPI(query: any) {
  const response = await fetch(LENS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

async function fetchNeighborhoodsData() {
    // Fetch all NPAs with population data from the Lens API
    const result = await queryLensAPI({
      measures: ['demographics.total_population', 'demographics.total_records', 'demographics.avg_normalized_value'],
      dimensions: ['demographics.npa'],
      limit: 500,
    });

    const data = result.data || [];

    // Charlotte average population per NPA (for fallback)
    const CHARLOTTE_AVG_POPULATION = 2000;

    // Build a lookup of demographics data keyed by NPA id
    const demoByNpa: Record<string, { population: number; records: number; score: number }> = {};
    for (const item of data) {
      const npaNum = parseInt(item['demographics.npa'], 10);
      if (isNaN(npaNum)) continue;
      const rawPopulation = item['demographics.total_population'];
      demoByNpa[String(npaNum)] = {
        population: rawPopulation > 0 ? rawPopulation : CHARLOTTE_AVG_POPULATION,
        records: item['demographics.total_records'] || 0,
        score: Math.round(item['demographics.avg_normalized_value'] || 0),
      };
    }

    // Start from the FULL NPA list (npa_names.json — 461 entries) and enrich with demographics
    const neighborhoods = Object.entries(NPA_NAMES)
      .map(([npaId, name]) => {
        const npaNum = parseInt(npaId, 10);
        const demo = demoByNpa[npaId];
        return {
          npa: npaNum,
          name,
          slug: toSlug(name),
          population: demo?.population ?? 0,
          records: demo?.records ?? 0,
          score: demo?.score ?? 0,
        };
      })
      .filter((n) => !isNaN(n.npa))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Also include any NPAs returned by the API that aren't in npa_names.json
    const knownNpas = new Set(Object.keys(NPA_NAMES));
    for (const item of data) {
      const npaNum = parseInt(item['demographics.npa'], 10);
      if (isNaN(npaNum) || knownNpas.has(String(npaNum))) continue;
      const rawPopulation = item['demographics.total_population'];
      neighborhoods.push({
        npa: npaNum,
        name: getNpaName(npaNum),
        slug: toSlug(getNpaName(npaNum)),
        population: rawPopulation > 0 ? rawPopulation : CHARLOTTE_AVG_POPULATION,
        records: item['demographics.total_records'] || 0,
        score: Math.round(item['demographics.avg_normalized_value'] || 0),
      });
    }

    neighborhoods.sort((a, b) => a.name.localeCompare(b.name));

  return {
    total: neighborhoods.length,
    neighborhoods,
  };
}

export async function GET() {
  try {
    // Use cache with stale-while-revalidate pattern
    const result = await apiCache.getOrFetch(
      'neighborhoods:all',
      fetchNeighborhoodsData,
      CACHE_TTL
    );

    return NextResponse.json({
      ...result.data,
      cached: result.cached,
    });
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);

    // Return fallback data using the full NPA list
    const fallbackNeighborhoods = Object.entries(NPA_NAMES).map(([npa, name]) => ({
      npa: parseInt(npa, 10),
      name,
      slug: toSlug(name),
      population: 0,
      records: 0,
      score: 0,
    })).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      total: fallbackNeighborhoods.length,
      neighborhoods: fallbackNeighborhoods,
      error: 'Using fallback data',
    });
  }
}
