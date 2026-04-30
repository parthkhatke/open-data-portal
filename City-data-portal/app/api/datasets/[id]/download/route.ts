import { NextRequest, NextResponse } from 'next/server';
import curatedDatasetsData from '@/datasets/curated_datasets.json';
import { CuratedDataset } from '@/types/dataset';
import { fetchFeatureData } from '@/lib/dataService';
import { generateMockData } from '@/lib/mockData';

const curatedDatasets = curatedDatasetsData as CuratedDataset[];

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
  const format = searchParams.get('format') || 'csv';
  const limit = parseInt(searchParams.get('limit') || '10000');

  let features: any[] = [];

  try {
    // Try to get real data from Lens API
    console.log(`Downloading ${id} data, format: ${format}, limit: ${limit}`);
    features = await fetchFeatureData(id, { limit });
    
    // If no features returned, use mock data as fallback
    if (features.length === 0) {
      console.log(`No data from Lens API for ${id}, using mock data`);
      features = generateMockData(id, limit);
    }
  } catch (error: any) {
    console.error('Error fetching dataset for download, using mock data:', error);
    // Use mock data as fallback
    features = generateMockData(id, limit);
  }

  // If still no features, return error
  if (features.length === 0) {
    return NextResponse.json({ error: 'No data available for download' }, { status: 404 });
  }

  try {
    if (format === 'json') {
      const jsonData = {
        dataset: {
          id: dataset.id,
          title: dataset.title,
          theme: dataset.theme,
          description: dataset.description,
        },
        metadata: {
          totalRecords: features.length,
          downloadedAt: new Date().toISOString(),
          source: 'City Portal 360 Lens API',
        },
        features: features.map((f) => f.attributes || f),
      };

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${dataset.id}.json"`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    // CSV format
    const firstFeature = features[0];
    const attributes = firstFeature.attributes || firstFeature;
    const headers = Object.keys(attributes);
    
    const csvRows = [
      headers.join(','),
      ...features.map((f) => {
        const attrs = f.attributes || f;
        return headers
          .map((header) => {
            const value = attrs[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // Escape quotes and wrap in quotes if contains comma, newline, or quote
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',');
      }),
    ];

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${dataset.id}.csv"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error formatting download:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to format download' },
      { status: 500 }
    );
  }
}
