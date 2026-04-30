import { NextRequest, NextResponse } from 'next/server';
import curatedDatasetsData from '@/datasets/curated_datasets.json';
import { CuratedDataset } from '@/types/dataset';
import { fetchFeatureData } from '@/lib/dataService';
import { apiCache, cacheKey } from '@/lib/cache';

const curatedDatasets = curatedDatasetsData as CuratedDataset[];

// Cache TTL in minutes
const CACHE_TTL = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dataset = curatedDatasets.find((d) => d.id === id) as CuratedDataset | undefined;

  if (!dataset) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10000');
  const offset = parseInt(searchParams.get('offset') || '0');
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

  const key = cacheKey(`data:${id}`, year);

  try {
    const result = await apiCache.getOrFetch(
      key,
      async () => {
        console.log(`Fetching map data from Lens API for dataset: ${id}`);
        return fetchFeatureData(id, { year, limit: 10000 });
      },
      CACHE_TTL
    );

    let features = Array.isArray(result.data) ? result.data : [];

    // If the cached result is empty (e.g. from a previous "Continue wait" response),
    // invalidate the cache entry and retry once so the user doesn't see stale zeros.
    if (features.length === 0 && result.cached) {
      console.log(`Cached data for ${id} is empty – invalidating and re-fetching`);
      apiCache.invalidate(key);
      const fresh = await apiCache.getOrFetch(
        key,
        async () => fetchFeatureData(id, { year, limit: 10000 }),
        CACHE_TTL,
      );
      features = Array.isArray(fresh.data) ? fresh.data : [];
    }

    const totalCount = features.length;
    const paginatedFeatures = features.slice(offset, offset + limit);

    return NextResponse.json({
      dataset: {
        id: dataset.id,
        title: dataset.title,
        theme: dataset.theme,
      },
      features: paginatedFeatures,
      count: paginatedFeatures.length,
      totalCount,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      source: 'lens-api',
      cached: result.cached,
    });
  } catch (error: any) {
    console.error('Error fetching map data:', error);
    return NextResponse.json(
      {
        dataset: { id: dataset.id, title: dataset.title, theme: dataset.theme },
        features: [],
        count: 0,
        totalCount: 0,
        page: 1,
        pageSize: limit,
        source: 'lens-api',
        cached: false,
        error: 'Data temporarily unavailable. Please try again.',
      },
      { status: 200 }
    );
  }
}
