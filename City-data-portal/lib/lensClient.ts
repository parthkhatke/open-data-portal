// Lens API Client for city-portal-360
// This client connects to the DataOS Lens semantic layer for real city data

const LENS_API_URL = process.env.LENS_API_URL || 'https://known-racer.mydataos.com/lens2/api/public:city-portal-360/v2/load';
const BEARER_TOKEN = process.env.BEARER_TOKEN || '';

export interface LensQueryParams {
  measures?: string[];
  dimensions?: string[];
  segments?: string[];
  filters?: LensFilter[];
  timeDimensions?: LensTimeDimension[];
  limit?: number;
  offset?: number;
  order?: LensOrder[];
}

export interface LensFilter {
  member: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'gt' | 'gte' | 'lt' | 'lte' | 'set' | 'notSet' | 'inDateRange' | 'notInDateRange' | 'beforeDate' | 'afterDate';
  values?: (string | number)[];
}

export interface LensTimeDimension {
  dimension: string;
  dateRange?: string | [string, string];
  granularity?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface LensOrder {
  id: string;
  desc?: boolean;
}

export interface LensResponse<T = Record<string, any>> {
  query: any;
  data: T[];
  lastRefreshTime: string;
  annotation: {
    measures: Record<string, any>;
    dimensions: Record<string, any>;
    segments: Record<string, any>;
    timeDimensions: Record<string, any>;
  };
  dataSource: string;
  dbType: string;
  total: number | null;
  requestId: string;
}

export class LensClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string = LENS_API_URL, token: string = BEARER_TOKEN) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  /**
   * Execute a Lens API query with automatic retry on "Continue wait" responses.
   *
   * The Lens API returns HTTP 200 with `{ error: "Continue wait" }` when the
   * result is still being computed (cold query).  We transparently retry up to
   * `maxRetries` times with exponential back-off so callers always receive
   * either real data or an explicit error.
   */
  async query<T = Record<string, any>>(
    params: LensQueryParams,
    { maxRetries = 5, initialDelayMs = 1000 }: { maxRetries?: number; initialDelayMs?: number } = {},
  ): Promise<LensResponse<T>> {
    // Convert order from [{id, desc}] format to [["id", "desc"]] format required by Lens API
    const orderArray = (params.order || []).map(o => [o.id, o.desc ? 'desc' : 'asc']);
    
    // Ensure filter values are strings (Lens API requirement)
    const normalizedFilters = (params.filters || []).map(filter => ({
      ...filter,
      values: filter.values?.map(v => String(v)),
    }));

    const queryBody = {
      query: {
        measures: params.measures || [],
        dimensions: params.dimensions || [],
        segments: params.segments || [],
        filters: normalizedFilters,
        timeDimensions: params.timeDimensions || [],
        limit: params.limit || 10000,
        offset: params.offset || 0,
        ...(orderArray.length > 0 ? { order: orderArray } : {}),
      },
    };

    let delay = initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(queryBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lens API error: ${response.status} - ${errorText}`);
      }

      const json = await response.json();

      // Lens API signals "still computing" with { error: "Continue wait" }
      if (json?.error === 'Continue wait') {
        if (attempt < maxRetries) {
          console.warn(
            `[LensClient] "Continue wait" – retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay = Math.min(delay * 1.5, 10000); // exponential back-off, cap at 10 s
          continue;
        }
        // Exhausted retries – return whatever we have so the caller can handle it
        console.error('[LensClient] Exhausted retries on "Continue wait"');
      }

      return json as LensResponse<T>;
    }

    // Should not reach here, but satisfy TS
    throw new Error('Lens API: exhausted retries');
  }
}

// Singleton instance for server-side use
export const lensClient = new LensClient();

// Domain table names mapping
export const DOMAIN_TABLES = {
  npa: 'npa',
  demographics: 'demographics',
  economy: 'economy',
  education: 'education',
  health: 'health',
  housing: 'housing',
  environment: 'environment',
  transportation: 'transportation',
  safety: 'safety',
  city_services: 'city_services',
  civic_engagement: 'civic_engagement',
  utilities: 'utilities',
  waste_management: 'waste_management',
  services: 'services',
  geographic: 'geographic',
  police: 'police_crime_facts', // Maps to police_crime_facts table
  police_npa: 'police_npa',
  police_crime_facts: 'police_crime_facts',
  police_divisions: 'police_divisions',
  police_employees: 'police_employees',
  police_ois: 'police_ois',
  police_diversion: 'police_diversion',
} as const;

export type DomainTable = keyof typeof DOMAIN_TABLES;

// Helper to get common measures and dimensions for a domain
export const DOMAIN_SCHEMA: Record<string, { measures: string[]; dimensions: string[] }> = {
  npa: {
    measures: ['npa.total_npas'],
    dimensions: ['npa.latitude', 'npa.longitude', 'npa.npa_id'],
  },
  // Alias for npa_neighborhoods dataset
  npa_neighborhoods: {
    measures: ['npa.total_npas'],
    dimensions: ['npa.latitude', 'npa.longitude', 'npa.npa_id'],
  },
  // Police dataset (maps to police_crime_facts)
  police: {
    measures: [
      'police_crime_facts.incident_count',
      'police_crime_facts.homicide_count',
      'police_crime_facts.cleared_count',
    ],
    dimensions: [
      'police_crime_facts.npa',
      'police_crime_facts.data_year',
      'police_crime_facts.record_type',
    ],
  },
  demographics: {
    measures: [
      'demographics.avg_normalized_value',
      'demographics.avg_raw_value',
      'demographics.max_normalized_value',
      'demographics.min_normalized_value',
      'demographics.population_density_avg',
      'demographics.total_population',
      'demographics.total_records',
      'demographics.unique_npas',
    ],
    dimensions: [
      'demographics.variable_id',
      'demographics.npa',
      'demographics.data_year',
      'demographics.raw_data_name',
    ],
  },
  economy: {
    measures: [
      'economy.avg_income',
      'economy.median_income_estimate',
      'economy.total_economic_output',
      'economy.max_income',
      'economy.min_income',
      'economy.income_disparity',
      'economy.unique_npas',
    ],
    dimensions: [
      'economy.variable_id',
      'economy.npa',
      'economy.data_year',
      'economy.raw_data_name',
      'economy.normalized_data_name',
      'economy.domain_name',
    ],
  },
  education: {
    measures: [
      'education.avg_graduation_rate',
      'education.avg_proficiency_score',
      'education.max_education_score',
      'education.min_education_score',
      'education.education_equity_gap',
      'education.unique_npas',
    ],
    dimensions: [
      'education.variable_id',
      'education.npa',
      'education.data_year',
      'education.raw_data_name',
      'education.normalized_data_name',
      'education.domain_name',
    ],
  },
  health: {
    measures: [
      'health.avg_health_score',
      'health.avg_life_expectancy',
      'health.max_health_score',
      'health.min_health_score',
      'health.health_disparity_index',
      'health.total_health_events',
      'health.unique_npas',
    ],
    dimensions: [
      'health.variable_id',
      'health.npa',
      'health.data_year',
      'health.raw_data_name',
      'health.normalized_data_name',
      'health.domain_name',
    ],
  },
  housing: {
    measures: [
      'housing.avg_home_value',
      'housing.total_housing_units',
      'housing.max_home_value',
      'housing.min_home_value',
      'housing.housing_affordability_gap',
      'housing.avg_housing_density',
      'housing.unique_npas',
    ],
    dimensions: [
      'housing.variable_id',
      'housing.npa',
      'housing.data_year',
      'housing.raw_data_name',
      'housing.normalized_data_name',
      'housing.domain_name',
    ],
  },
  environment: {
    measures: [
      'environment.avg_tree_canopy',
      'environment.avg_environmental_score',
      'environment.max_environmental_score',
      'environment.min_environmental_score',
      'environment.total_green_area',
      'environment.environmental_equity_gap',
      'environment.unique_npas',
    ],
    dimensions: [
      'environment.variable_id',
      'environment.npa',
      'environment.data_year',
      'environment.raw_data_name',
      'environment.normalized_data_name',
      'environment.domain_name',
    ],
  },
  transportation: {
    measures: [
      'transportation.avg_transit_access_score',
      'transportation.avg_commute_time',
      'transportation.max_transit_score',
      'transportation.min_transit_score',
      'transportation.total_transit_miles',
      'transportation.transit_equity_gap',
      'transportation.unique_npas',
    ],
    dimensions: [
      'transportation.variable_id',
      'transportation.npa',
      'transportation.data_year',
      'transportation.raw_data_name',
      'transportation.normalized_data_name',
      'transportation.domain_name',
    ],
  },
  safety: {
    measures: [
      'safety.avg_crime_rate',
      'safety.avg_safety_score',
      'safety.total_incidents',
      'safety.max_crime_rate',
      'safety.min_crime_rate',
      'safety.safety_disparity_index',
      'safety.unique_npas',
    ],
    dimensions: [
      'safety.variable_id',
      'safety.npa',
      'safety.data_year',
      'safety.raw_data_name',
      'safety.normalized_data_name',
      'safety.domain_name',
    ],
  },
  city_services: {
    measures: [
      'city_services.total_service_requests',
      'city_services.avg_service_requests',
      'city_services.avg_service_quality_score',
      'city_services.max_service_requests',
      'city_services.min_service_requests',
      'city_services.service_equity_index',
      'city_services.unique_npas',
    ],
    dimensions: [
      'city_services.variable_id',
      'city_services.npa',
      'city_services.data_year',
      'city_services.raw_data_name',
      'city_services.normalized_data_name',
      'city_services.domain_name',
    ],
  },
  civic_engagement: {
    measures: [
      'civic_engagement.avg_voter_turnout',
      'civic_engagement.avg_civic_participation_score',
      'civic_engagement.total_community_orgs',
      'civic_engagement.max_engagement_score',
      'civic_engagement.min_engagement_score',
      'civic_engagement.civic_equity_gap',
      'civic_engagement.unique_npas',
    ],
    dimensions: [
      'civic_engagement.variable_id',
      'civic_engagement.npa',
      'civic_engagement.data_year',
      'civic_engagement.raw_data_name',
      'civic_engagement.normalized_data_name',
      'civic_engagement.domain_name',
    ],
  },
  utilities: {
    measures: [
      'utilities.avg_consumption',
      'utilities.total_consumption',
      'utilities.avg_efficiency_score',
      'utilities.max_consumption',
      'utilities.min_consumption',
      'utilities.consumption_variance',
      'utilities.unique_npas',
    ],
    dimensions: [
      'utilities.variable_id',
      'utilities.npa',
      'utilities.data_year',
      'utilities.raw_data_name',
      'utilities.normalized_data_name',
      'utilities.domain_name',
    ],
  },
  waste_management: {
    measures: [
      'waste_management.avg_recycling_rate',
      'waste_management.total_waste_volume',
      'waste_management.avg_waste_per_capita',
      'waste_management.max_recycling_rate',
      'waste_management.min_recycling_rate',
      'waste_management.recycling_equity_gap',
      'waste_management.unique_npas',
    ],
    dimensions: [
      'waste_management.variable_id',
      'waste_management.npa',
      'waste_management.data_year',
      'waste_management.raw_data_name',
      'waste_management.normalized_data_name',
      'waste_management.domain_name',
    ],
  },
  services: {
    measures: [
      'services.avg_access_score',
      'services.avg_normalized_value',
      'services.avg_proximity_score',
      'services.max_access_score',
      'services.min_access_score',
      'services.service_desert_gap',
      'services.total_service_points',
      'services.total_records',
      'services.unique_npas',
    ],
    dimensions: [
      'services.services_id',
      'services.data_year',
      'services.domain_name',
      'services.normalized_data_name',
      'services.normalized_units',
      'services.normalized_value',
      'services.npa',
      'services.raw_data_name',
      'services.raw_units',
      'services.raw_value',
      'services.variable_id',
    ],
  },
  geographic: {
    measures: [
      'geographic.avg_developed_pct',
      'geographic.avg_land_area',
      'geographic.avg_normalized_value',
      'geographic.land_area_variance',
      'geographic.max_land_area',
      'geographic.min_land_area',
      'geographic.total_land_area',
      'geographic.total_records',
      'geographic.unique_npas',
    ],
    dimensions: [
      'geographic.variable_id',
      'geographic.npa',
      'geographic.data_year',
      'geographic.raw_data_name',
    ],
  },
  police_npa: {
    measures: [
      'police_npa.total_homicides',
      'police_npa.total_incidents',
      'police_npa.total_crimes',
      'police_npa.avg_homicide_clearance',
      'police_npa.avg_incident_clearance',
      'police_npa.npa_count',
    ],
    dimensions: [
      'police_npa.homicide_count',
      'police_npa.incident_count',
      'police_npa.total_crime_count',
      'police_npa.data_year',
      'police_npa.domain_name',
    ],
  },
  police_crime_facts: {
    measures: [
      'police_crime_facts.total_records',
      'police_crime_facts.homicide_count',
      'police_crime_facts.incident_count',
      'police_crime_facts.avg_victim_age',
      'police_crime_facts.cleared_count',
    ],
    dimensions: [
      'police_crime_facts.victim_gender',
      'police_crime_facts.victim_race',
      'police_crime_facts.clearance_status',
      'police_crime_facts.weapon',
      'police_crime_facts.division',
      'police_crime_facts.npa',
      'police_crime_facts.data_year',
      'police_crime_facts.data_month',
      'police_crime_facts.circumstances',
      'police_crime_facts.record_type',
    ],
  },
  police_divisions: {
    measures: [
      'police_divisions.total_traffic_stops',
      'police_divisions.total_incidents',
      'police_divisions.total_homicides',
      'police_divisions.avg_clearance_rate',
      'police_divisions.avg_search_rate',
      'police_divisions.division_count',
    ],
    dimensions: [
      'police_divisions.traffic_stop_count',
      'police_divisions.search_count',
      'police_divisions.arrest_count',
      'police_divisions.incident_count',
      'police_divisions.homicide_count',
      'police_divisions.incident_clearance_rate',
      'police_divisions.homicide_clearance_rate',
    ],
  },
  police_employees: {
    measures: [
      'police_employees.total_employees',
      'police_employees.avg_service_years',
      'police_employees.avg_employee_age',
      'police_employees.category_count',
    ],
    dimensions: [
      'police_employees.job_title',
      'police_employees.race',
      'police_employees.gender',
      'police_employees.employee_count',
      'police_employees.avg_years_service',
      'police_employees.division',
    ],
  },
  police_ois: {
    measures: [
      'police_ois.total_incidents',
      'police_ois.total_fatalities',
      'police_ois.avg_officers_per_incident',
      'police_ois.avg_individuals_per_incident',
      'police_ois.fatal_incident_count',
    ],
    dimensions: [
      'police_ois.data_year',
      'police_ois.data_month',
      'police_ois.division',
      'police_ois.npa',
      'police_ois.da_legal_review',
      'police_ois.individual_races',
      'police_ois.officer_races',
      'police_ois.is_fatal_incident',
    ],
  },
  police_diversion: {
    measures: [
      'police_diversion.total_participants',
      'police_diversion.successful_count',
      'police_diversion.unsuccessful_count',
      'police_diversion.category_count',
    ],
    dimensions: [
      'police_diversion.race_ethnicity',
      'police_diversion.gender',
      'police_diversion.status',
      'police_diversion.data_year',
      'police_diversion.npa',
    ],
  },
};
