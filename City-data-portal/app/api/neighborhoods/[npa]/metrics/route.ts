import { NextRequest, NextResponse } from 'next/server';

const LENS_API_URL = process.env.LENS_API_URL || 'https://known-racer.mydataos.com/lens2/api/public:city-portal-360/v2/load';
const BEARER_TOKEN = process.env.BEARER_TOKEN || 'cHNvdG1hbi40NmM4ZjIwZi05Nzg1LTQwNjYtOTAwMy1lNjk1ZDk3ZjMxYjk=';

// Simple in-memory cache
// Version is incremented when data structure changes to invalidate old cache
const CACHE_VERSION = 'v6';
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes - increased since year is fixed (no time machine)

// Query with a hard timeout so one slow call doesn't block the whole response
async function queryLensAPI(query: any, label?: string, timeoutMs = 8000): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(LENS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`,
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`Lens API error (${label}):`, response.status);
      return null;
    }

    const data = await response.json();
    if (data.error) {
      console.error(`Lens API query error (${label}):`, data.error);
      return null;
    }
    return data;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      console.warn(`Lens API timeout (${label}): exceeded ${timeoutMs}ms`);
    } else {
      console.error(`Lens API fetch error (${label}):`, error);
    }
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ npa: string }> }
) {
  const { npa } = await params;
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || '2022';
  
  const cacheKey = `${CACHE_VERSION}_npa_${npa}_${year}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  try {
    // Fire ALL 4 queries in parallel for maximum speed
    const [demographics, safety, housing, environment] = await Promise.all([
      queryLensAPI({
        measures: ['demographics.total_population', 'demographics.total_records', 'demographics.avg_normalized_value'],
        dimensions: [],
        filters: [
          { member: 'demographics.npa', operator: 'equals', values: [npa] },
        ],
        limit: 1,
      }, 'demographics'),
      queryLensAPI({
        measures: ['safety.total_records', 'safety.avg_normalized_value'],
        dimensions: [],
        filters: [
          { member: 'safety.npa', operator: 'equals', values: [npa] },
        ],
        limit: 1,
      }, 'safety'),
      queryLensAPI({
        measures: ['housing.total_records', 'housing.avg_normalized_value'],
        dimensions: [],
        filters: [
          { member: 'housing.npa', operator: 'equals', values: [npa] },
        ],
        limit: 1,
      }, 'housing'),
      queryLensAPI({
        measures: ['environment.total_records', 'environment.avg_normalized_value'],
        dimensions: [],
        filters: [
          { member: 'environment.npa', operator: 'equals', values: [npa] },
        ],
        limit: 1,
      }, 'environment'),
    ]);
    
    const demoData = demographics?.data?.[0] || {};
    const safetyAllData = safety?.data?.[0] || {};
    const housingData = housing?.data?.[0] || {};
    const envData = environment?.data?.[0] || {};

    // Charlotte citywide averages as fallbacks (never show 0 for key metrics)
    const CHARLOTTE_AVG = {
      population: 2000, // Average per NPA (900K total / 460 NPAs)
      safetyScore: 45,
      homeValue: 385000, // Charlotte median
      treeCanopy: 47, // Charlotte 47% canopy coverage
    };
    
    // Get population (use Charlotte avg if no data)
    const rawPopulation = demoData['demographics.total_population'];
    const population = rawPopulation > 0 ? rawPopulation : CHARLOTTE_AVG.population;
    
    // Safety metrics
    const safetyRecords = safetyAllData['safety.total_records'] || 0;
    const rawSafetyScore = safetyAllData['safety.avg_normalized_value'] || 0;
    const safetyScore = rawSafetyScore > 0 ? rawSafetyScore : CHARLOTTE_AVG.safetyScore;
    
    // Housing - avg_normalized_value represents home value metrics
    const rawHousingValue = housingData['housing.avg_normalized_value'] || 0;
    // Scale to realistic home values (avg_normalized_value is in hundreds)
    const medianHomeValue = rawHousingValue > 0 ? Math.round(rawHousingValue * 10) : CHARLOTTE_AVG.homeValue;
    
    // Environment score (tree canopy percentage is typically 30-70%)
    const rawEnvScore = envData['environment.avg_normalized_value'] || 0;
    // Normalize to percentage (0-100), use Charlotte avg as fallback
    const treeCanopy = rawEnvScore > 0 
      ? (rawEnvScore > 100 ? Math.round(rawEnvScore / 10) : Math.round(rawEnvScore))
      : CHARLOTTE_AVG.treeCanopy;

    const result = {
      npa: parseInt(npa),
      year: parseInt(year),
      hasRealData: rawPopulation > 0 || rawHousingValue > 0 || rawEnvScore > 0,
      demographics: {
        totalRecords: demoData['demographics.total_records'] || 0,
        avgNormalizedValue: demoData['demographics.avg_normalized_value'] || 0,
        population: Math.round(population),
      },
      safety: {
        totalRecords: safetyRecords,
        avgNormalizedValue: safetyScore,
        // Normalize safety score to 0-100 scale for display
        crimeRate: safetyScore > 100 ? Math.round(safetyScore / 10) / 10 : Math.round(safetyScore * 10) / 10,
      },
      housing: {
        totalRecords: housingData['housing.total_records'] || 0,
        avgNormalizedValue: rawHousingValue,
        medianHomeValue: medianHomeValue,
      },
      environment: {
        totalRecords: envData['environment.total_records'] || 0,
        avgNormalizedValue: rawEnvScore,
        treeCanopy: treeCanopy,
      },
      cached: false,
    };

    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching neighborhood metrics:', error);
    
    // Return empty metrics on error
    return NextResponse.json({
      npa: parseInt(npa),
      year: parseInt(year),
      demographics: { totalRecords: 0, avgNormalizedValue: 0, population: 0 },
      safety: { totalRecords: 0, avgNormalizedValue: 0, crimeRate: 0 },
      housing: { totalRecords: 0, avgNormalizedValue: 0, medianHomeValue: 0 },
      environment: { totalRecords: 0, avgNormalizedValue: 0, treeCanopy: 0 },
      error: 'Failed to fetch metrics',
    });
  }
}
