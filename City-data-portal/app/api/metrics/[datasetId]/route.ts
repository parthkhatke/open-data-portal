import { NextRequest, NextResponse } from 'next/server';
import curatedDatasetsData from '@/datasets/curated_datasets.json';
import { CuratedDataset } from '@/types/dataset';
import { fetchMetricsByDomain, fetchAvailableYears } from '@/lib/dataService';
import { generateMockMetrics } from '@/lib/mockMetrics';
import { apiCache, cacheKey } from '@/lib/cache';

const curatedDatasets = curatedDatasetsData as CuratedDataset[];

// Set to true to use real Lens API, false for mock data fallback
const USE_REAL_API = true;

// Cache TTL in minutes - increased since year is now fixed (no time machine)
const CACHE_TTL = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  const { datasetId } = await params;
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
  const npa = searchParams.get('npa') ? parseInt(searchParams.get('npa')!, 10) : undefined;
  
  const dataset = curatedDatasets.find((d) => d.id === datasetId) as CuratedDataset | undefined;

  if (!dataset) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  }

  // Include NPA in cache key for neighborhood-specific queries
  const key = npa ? cacheKey(`${datasetId}_npa_${npa}`, year) : cacheKey(datasetId, year);

  try {
    if (USE_REAL_API) {
      // Fetch available years for this domain (cached separately)
      const yearRangeKey = `years_${datasetId}`;
      const yearRangeResult = await apiCache.getOrFetch(
        yearRangeKey,
        async () => {
          console.log(`Fetching available years for: ${datasetId}`);
          return fetchAvailableYears(datasetId);
        },
        60 // Cache year range for 60 minutes
      );
      const yearRange = yearRangeResult.data;

      // Use stale-while-revalidate caching (time machine removed, year is fixed)
      // Returns cached data instantly, refreshes in background if stale
      const result = await apiCache.getOrFetch(
        key,
        async () => {
          console.log(`Fetching data for: ${datasetId}, year: ${year}${npa ? `, npa: ${npa}` : ''}`);
          return fetchMetricsByDomain(datasetId, year, npa);
        },
        CACHE_TTL
      );

      return NextResponse.json({
        datasetId: dataset.id,
        datasetTitle: dataset.title,
        year,
        npa,
        metrics: result.data,
        yearRange: {
          minYear: yearRange.minYear,
          maxYear: yearRange.maxYear,
          availableYears: yearRange.availableYears,
        },
        source: 'lens-api',
        cached: result.cached,
      });
    } else {
      // Use mock metrics (no caching needed)
    const metrics = generateMockMetrics(datasetId, year);
    return NextResponse.json({
      datasetId: dataset.id,
      datasetTitle: dataset.title,
      year,
      metrics,
        source: 'mock',
        cached: false,
    });
    }
  } catch (error: any) {
    console.error('Error generating metrics:', error);
    
    // Fallback to mock data
    try {
      const fallbackMetrics = generateMockMetrics(datasetId, year);
      return NextResponse.json({
        datasetId: dataset.id,
        datasetTitle: dataset.title,
        year,
        metrics: fallbackMetrics,
        source: 'mock-fallback',
        cached: false,
      });
    } catch (fallbackError) {
    return NextResponse.json({ error: 'Failed to generate metrics' }, { status: 500 });
    }
  }
}
