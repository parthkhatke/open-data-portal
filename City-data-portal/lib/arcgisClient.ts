import axios from 'axios';
import { ArcGISResponse, ArcGISFeature, DatasetMetrics, CuratedDataset } from '@/types/dataset';

const ARCGIS_BASE_URL = 'https://gis.charlottenc.gov/arcgis/rest/services';

export interface QueryParams {
  where?: string;
  outFields?: string;
  returnGeometry?: boolean;
  geometry?: string;
  geometryType?: string;
  spatialRel?: string;
  inSR?: number;
  outSR?: number;
  f?: string;
  resultOffset?: number;
  resultRecordCount?: number;
  orderByFields?: string;
  groupByFieldsForStatistics?: string;
  outStatistics?: Array<{
    statisticType: string;
    onStatisticField: string;
    outStatisticFieldName: string;
  }>;
  returnCountOnly?: boolean;
}

/**
 * Query an ArcGIS REST endpoint
 */
export async function queryArcGIS(
  endpoint: string,
  params: QueryParams = {}
): Promise<ArcGISResponse> {
  const defaultParams: QueryParams = {
    f: 'json',
    returnGeometry: true,
    outFields: '*',
    ...params,
  };

  try {
    const response = await axios.get(endpoint, {
      params: defaultParams,
      timeout: 30000,
    });

    if (response.data.error) {
      throw new Error(`ArcGIS API error: ${JSON.stringify(response.data.error)}`);
    }

    return response.data;
  } catch (error) {
    // Re-throw without verbose logging (caller handles fallback)
    throw error;
  }
}

/**
 * Get all features from an endpoint with pagination
 */
export async function getAllFeatures(
  endpoint: string,
  params: QueryParams = {},
  maxRecords: number = 10000
): Promise<ArcGISFeature[]> {
  const allFeatures: ArcGISFeature[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const response = await queryArcGIS(endpoint, {
      ...params,
      resultOffset: offset,
      resultRecordCount: pageSize,
    });

    allFeatures.push(...response.features);

    if (
      !response.exceededTransferLimit ||
      allFeatures.length >= maxRecords ||
      response.features.length === 0
    ) {
      break;
    }

    offset += pageSize;
  }

  return allFeatures.slice(0, maxRecords);
}

/**
 * Get sample records from a dataset
 */
export async function getSampleRecords(
  dataset: CuratedDataset,
  limit: number = 10
): Promise<ArcGISFeature[]> {
  const response = await queryArcGIS(dataset.apiEndpoint, {
    resultRecordCount: limit,
    orderByFields: dataset.timeField ? `${dataset.timeField} DESC` : undefined,
  });

  return response.features;
}

/**
 * Compute metrics for a dataset
 */
export async function computeMetrics(
  dataset: CuratedDataset,
  timeRange?: { start: Date; end: Date }
): Promise<DatasetMetrics> {
  // Note: ArcGIS REST API expects dates in milliseconds since epoch or formatted strings
  // Adjust the where clause based on the actual field type in your datasets
  const whereClause = timeRange && dataset.timeField
    ? `${dataset.timeField} >= ${timeRange.start.getTime()} AND ${dataset.timeField} <= ${timeRange.end.getTime()}`
    : undefined;

  // Get total count
  const countResponse = await queryArcGIS(dataset.apiEndpoint, {
    where: whereClause,
    returnCountOnly: true,
    f: 'json',
  });

  const totalCount = countResponse.count || 0;

  const metrics: DatasetMetrics = {
    totalCount,
  };

  // Get time series if time field exists
  if (dataset.timeField) {
    const timeSeriesData = await getTimeSeries(dataset, timeRange);
    metrics.timeSeries = timeSeriesData;
  }

  // Get top neighborhoods if neighborhood field exists
  if (dataset.neighborhoodField) {
    const topNeighborhoods = await getTopNeighborhoods(dataset, timeRange, 10);
    const bottomNeighborhoods = await getTopNeighborhoods(
      dataset,
      timeRange,
      10,
      'ASC'
    );
    metrics.topNeighborhoods = topNeighborhoods;
    metrics.bottomNeighborhoods = bottomNeighborhoods;
  }

  return metrics;
}

/**
 * Get time series data
 */
async function getTimeSeries(
  dataset: CuratedDataset,
  timeRange?: { start: Date; end: Date }
): Promise<Array<{ period: string; count: number }>> {
  // This is a simplified version - in production, you'd use GROUP BY queries
  const whereClause = timeRange && dataset.timeField
    ? `${dataset.timeField} >= ${timeRange.start.getTime()} AND ${dataset.timeField} <= ${timeRange.end.getTime()}`
    : undefined;

  const features = await getAllFeatures(dataset.apiEndpoint, {
    where: whereClause,
  }, 1000);

  // Group by month
  const monthlyCounts: Record<string, number> = {};
  features.forEach((feature) => {
    if (dataset.timeField && feature.attributes[dataset.timeField]) {
      const date = new Date(feature.attributes[dataset.timeField]);
      if (!isNaN(date.getTime())) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const monthKey = `${date.getFullYear()}-${month}`;
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
      }
    }
  });

  return Object.entries(monthlyCounts)
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Get top neighborhoods by count
 */
async function getTopNeighborhoods(
  dataset: CuratedDataset,
  timeRange?: { start: Date; end: Date },
  limit: number = 10,
  order: 'DESC' | 'ASC' = 'DESC'
): Promise<Array<{ neighborhood: string; count: number }>> {
  const whereClause = timeRange && dataset.timeField
    ? `${dataset.timeField} >= ${timeRange.start.getTime()} AND ${dataset.timeField} <= ${timeRange.end.getTime()}`
    : undefined;

  const features = await getAllFeatures(dataset.apiEndpoint, {
    where: whereClause,
  }, 5000);

  const neighborhoodCounts: Record<string, number> = {};
  features.forEach((feature) => {
    if (dataset.neighborhoodField && feature.attributes[dataset.neighborhoodField]) {
      const neighborhood = feature.attributes[dataset.neighborhoodField];
      neighborhoodCounts[neighborhood] = (neighborhoodCounts[neighborhood] || 0) + 1;
    }
  });

  return Object.entries(neighborhoodCounts)
    .map(([neighborhood, count]) => ({ neighborhood, count }))
    .sort((a, b) => (order === 'DESC' ? b.count - a.count : a.count - b.count))
    .slice(0, limit);
}

/**
 * Get dataset fields/schema
 */
export async function getDatasetFields(dataset: CuratedDataset): Promise<
  Array<{
    name: string;
    type: string;
    alias?: string;
  }>
> {
  const response = await queryArcGIS(dataset.apiEndpoint, {
    resultRecordCount: 0,
    returnGeometry: false,
  });

  return response.fields || [];
}

