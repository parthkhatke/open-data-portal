import { NextRequest, NextResponse } from 'next/server';
import curatedDatasetsData from '@/datasets/curated_datasets.json';
import { CuratedDataset } from '@/types/dataset';
import { fetchMetricsByDomain, fetchAvailableYears } from '@/lib/dataService';
import { generateMockMetrics } from '@/lib/mockMetrics';
import { apiCache, cacheKey } from '@/lib/cache';

const curatedDatasets = curatedDatasetsData as CuratedDataset[];

// Set to true to use real Lens API, false for mock data fallback
const USE_REAL_API = true;

// Cache TTL in minutes - very long since this bulk endpoint is no longer actively used
const CACHE_TTL = 120;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ datasetId: string }> }
) {
  const { datasetId } = await params;
  
  const dataset = curatedDatasets.find((d) => d.id === datasetId) as CuratedDataset | undefined;

  if (!dataset) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  }

  const bulkCacheKey = `bulk_${datasetId}`;

  try {
    // Check if we have bulk cached data
    const cachedResult = await apiCache.getOrFetch(
      bulkCacheKey,
      async () => {
        console.log(`Fetching all years data for: ${datasetId}`);
        
        // First, get available years
        const yearRange = await fetchAvailableYears(datasetId);
        const { minYear, maxYear, availableYears } = yearRange;
        
        console.log(`Dataset ${datasetId} has data from ${minYear} to ${maxYear} (${availableYears.length} years)`);
        
        // Fetch metrics for all available years in parallel
        const results = await Promise.allSettled(
          availableYears.map(async (year) => {
            try {
              if (USE_REAL_API) {
                const metrics = await fetchMetricsByDomain(datasetId, year);
                return { year, metrics, source: 'lens-api' };
              } else {
                const metrics = generateMockMetrics(datasetId, year);
                return { year, metrics, source: 'mock' };
              }
            } catch (error) {
              // Fallback to mock data for this year
              const metrics = generateMockMetrics(datasetId, year);
              return { year, metrics, source: 'mock-fallback' };
            }
          })
        );

        // Build the data map
        const dataByYear: Record<number, any> = {};
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            dataByYear[result.value.year] = result.value.metrics;
          }
        });

        return {
          datasetId: dataset.id,
          datasetTitle: dataset.title,
          yearRange: {
            minYear,
            maxYear,
            availableYears,
          },
          dataByYear,
          fetchedAt: new Date().toISOString(),
        };
      },
      CACHE_TTL
    );

    return NextResponse.json({
      ...cachedResult.data,
      cached: cachedResult.cached,
    });
  } catch (error: any) {
    console.error('Error fetching bulk metrics:', error);
    
    // Fallback: generate mock data for default years
    try {
      const defaultYears = [2018, 2019, 2020, 2021, 2022];
      const dataByYear: Record<number, any> = {};
      
      for (const year of defaultYears) {
        dataByYear[year] = generateMockMetrics(datasetId, year);
      }

      return NextResponse.json({
        datasetId: dataset.id,
        datasetTitle: dataset.title,
        yearRange: {
          minYear: 2018,
          maxYear: 2022,
          availableYears: defaultYears,
        },
        dataByYear,
        source: 'mock-fallback',
        cached: false,
      });
    } catch (fallbackError) {
      return NextResponse.json({ error: 'Failed to generate metrics' }, { status: 500 });
    }
  }
}
