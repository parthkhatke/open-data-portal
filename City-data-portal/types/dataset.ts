export interface CuratedDataset {
  id: string;
  title: string;
  description: string;
  theme: string;
  apiEndpoint: string;
  geometryType: 'Point' | 'Line' | 'Polygon' | null;
  timeField: string | null;
  neighborhoodField: string | null;
  owner: string;
  freshness: string;
  license: string;
  metrics: string[];
  visualizations: string[];
}

export interface ArcGISFeature {
  attributes: Record<string, any>;
  geometry?: {
    x?: number;
    y?: number;
    paths?: number[][][];
    rings?: number[][][];
  };
}

export interface ArcGISResponse {
  features: ArcGISFeature[];
  fields?: Array<{
    name: string;
    type: string;
    alias?: string;
  }>;
  exceededTransferLimit?: boolean;
  count?: number;
}

export interface DatasetMetrics {
  totalCount: number;
  timeSeries?: Array<{
    period: string;
    count: number;
  }>;
  topNeighborhoods?: Array<{
    neighborhood: string;
    count: number;
  }>;
  bottomNeighborhoods?: Array<{
    neighborhood: string;
    count: number;
  }>;
  byCategory?: Array<{
    category: string;
    count: number;
  }>;
}

export interface Neighborhood {
  slug: string;
  name: string;
  description?: string;
}

