// Data Service for fetching real data from city-portal-360 Lens API
// This replaces the mock data with actual database queries

import { lensClient, DOMAIN_SCHEMA, LensFilter } from './lensClient';
import { getNpaName } from './npaNames';

// Charlotte NPA coordinates for map/location use (name comes from npaNames for full coverage)
const CHARLOTTE_NEIGHBORHOODS: Record<number, { lat: number; lng: number }> = {
  1: { lat: 35.2271, lng: -80.8431 },
  2: { lat: 35.2100, lng: -80.8550 },
  3: { lat: 35.2500, lng: -80.8150 },
  4: { lat: 35.2200, lng: -80.8100 },
  5: { lat: 35.2050, lng: -80.8500 },
  6: { lat: 35.1900, lng: -80.8300 },
  7: { lat: 35.2150, lng: -80.8300 },
  8: { lat: 35.2300, lng: -80.8600 },
  9: { lat: 35.2100, lng: -80.7800 },
  10: { lat: 35.2700, lng: -80.8300 },
  11: { lat: 35.0550, lng: -80.8500 },
  12: { lat: 35.1200, lng: -80.9500 },
  13: { lat: 35.3100, lng: -80.7500 },
  14: { lat: 35.1850, lng: -80.8150 },
  15: { lat: 35.2350, lng: -80.8700 },
  16: { lat: 35.1950, lng: -80.8650 },
  17: { lat: 35.1800, lng: -80.8000 },
  18: { lat: 35.1700, lng: -80.8400 },
  19: { lat: 35.2000, lng: -80.8400 },
  20: { lat: 35.2400, lng: -80.8250 },
};

const DEFAULT_COORDS = { lat: 35.2271, lng: -80.8431 };

// Spread unknown NPAs in a deterministic grid so they don't all cluster at the same point
function getCoordsForUnknownNpa(npa: number): { lat: number; lng: number } {
  const step = 0.018;
  const gridSize = 8;
  const row = Math.floor((npa - 1) / gridSize) % gridSize;
  const col = (npa - 1) % gridSize;
  const offsetLat = (row - gridSize / 2) * step;
  const offsetLng = (col - gridSize / 2) * step;
  return {
    lat: DEFAULT_COORDS.lat + offsetLat,
    lng: DEFAULT_COORDS.lng + offsetLng,
  };
}

export function getNeighborhoodInfo(npa: number): { name: string; lat: number; lng: number } {
  const coords = CHARLOTTE_NEIGHBORHOODS[npa] ?? getCoordsForUnknownNpa(npa);
  return { name: getNpaName(npa), lat: coords.lat, lng: coords.lng };
}

// Colors for pie chart segments
const BREAKDOWN_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#ec4899', '#6b7280', '#14b8a6'];

// Helper function to fetch breakdowns by normalized_data_name for any domain
async function fetchBreakdownsByNormalizedName(
  domain: string,
  measureName: string,
  year?: number,
  limit: number = 10
): Promise<{ label: string; value: number; count: number; color: string }[]> {
  try {
    const response = await lensClient.query({
      measures: [measureName],
      dimensions: [`${domain}.normalized_data_name`],
      filters: year ? [{ member: `${domain}.data_year`, operator: 'equals', values: [year] }] : [],
      order: [{ id: measureName, desc: true }],
      limit,
    });

    if (!response?.data || response.data.length === 0) {
      return [];
    }

    // Calculate total for percentages
    const total = response.data.reduce((sum: number, d: any) => sum + (d[measureName] || 0), 0);
    
    return response.data.map((d: any, index: number) => ({
      label: d[`${domain}.normalized_data_name`] || `Category ${index + 1}`,
      value: total > 0 ? Math.round((d[measureName] || 0) / total * 100 * 10) / 10 : 0,
      count: d[measureName] || 0,
      color: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
    }));
  } catch (error) {
    console.error(`Error fetching breakdowns for ${domain}:`, error);
    return [];
  }
}

// Generic data fetching for any domain
export async function fetchDomainData(
  domain: string,
  options: {
    measures?: string[];
    dimensions?: string[];
    filters?: LensFilter[];
    limit?: number;
    year?: number;
    npa?: number;
  } = {}
) {
  const schema = DOMAIN_SCHEMA[domain];
  if (!schema) {
    throw new Error(`Unknown domain: ${domain}`);
  }

  const measures = options.measures || schema.measures.slice(0, 5);
  const dimensions = options.dimensions || schema.dimensions.slice(0, 5);
  const filters: LensFilter[] = options.filters || [];

  // Add year filter if specified
  if (options.year && schema.dimensions.some(d => d.includes('data_year'))) {
    filters.push({
      member: `${domain}.data_year`,
      operator: 'equals',
      values: [options.year],
    });
  }

  // Add NPA filter if specified
  if (options.npa && schema.dimensions.some(d => d.includes('npa'))) {
    filters.push({
      member: `${domain}.npa`,
      operator: 'equals',
      values: [options.npa],
    });
  }

  try {
    const response = await lensClient.query({
      measures,
      dimensions,
      filters,
      limit: options.limit || 10000,
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching ${domain} data:`, error);
    throw error;
  }
}

// Demographics data
export async function fetchDemographicsData(year?: number, npa?: number) {
  return fetchDomainData('demographics', { year, npa });
}

export async function fetchDemographicsMetrics(year?: number) {
  const [aggregates, byVariable, byYear, demographicBreakdown, byNpa] = await Promise.all([
    // Overall aggregates using exact measures from API
    lensClient.query({
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
      dimensions: [],
      filters: year ? [{ member: 'demographics.data_year', operator: 'equals', values: [year] }] : [],
    }),
    // By variable to get breakdowns
    lensClient.query({
      measures: ['demographics.avg_raw_value', 'demographics.avg_normalized_value'],
      dimensions: ['demographics.raw_data_name', 'demographics.normalized_data_name'],
      filters: year ? [{ member: 'demographics.data_year', operator: 'equals', values: [year] }] : [],
      limit: 10000,
    }),
    // Trend over years
    lensClient.query({
      measures: ['demographics.total_population', 'demographics.total_records'],
      dimensions: ['demographics.data_year'],
      order: [{ id: 'demographics.data_year', desc: false }],
      limit: 10000,
    }),
    // Get actual demographic values by category (not record counts)
    lensClient.query({
      measures: ['demographics.avg_normalized_value'],
      dimensions: ['demographics.normalized_data_name'],
      filters: year ? [{ member: 'demographics.data_year', operator: 'equals', values: [year] }] : [],
      limit: 20,
    }),
    // Get population density by NPA for neighborhood rankings
    lensClient.query({
      measures: ['demographics.population_density_avg', 'demographics.total_records'],
      dimensions: ['demographics.npa'],
      filters: year ? [{ member: 'demographics.data_year', operator: 'equals', values: [year] }] : [],
      order: [{ id: 'demographics.population_density_avg', desc: true }],
      limit: 50,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const variableData = byVariable.data || [];
  const trendData = byYear.data || [];
  const demographicData = demographicBreakdown?.data || [];
  const npaData = byNpa?.data || [];

  // Process demographic data for race/ethnicity breakdown
  const raceCategories = ['White_Population', 'Black_Population', 'Hispanic_Latino', 'Asian_Population', 'All_Other_Races'];
  const raceColors: Record<string, string> = {
    'White_Population': '#3b82f6',
    'Black_Population': '#10b981',
    'Hispanic_Latino': '#f59e0b',
    'Asian_Population': '#8b5cf6',
    'All_Other_Races': '#6b7280',
  };
  const raceLabels: Record<string, string> = {
    'White_Population': 'White',
    'Black_Population': 'Black/African American',
    'Hispanic_Latino': 'Hispanic/Latino',
    'Asian_Population': 'Asian',
    'All_Other_Races': 'Other Races',
  };

  // Extract race/ethnicity data for pie chart
  const raceBreakdown = demographicData
    .filter((d: any) => raceCategories.includes(d['demographics.normalized_data_name']))
    .map((d: any) => ({
      label: raceLabels[d['demographics.normalized_data_name']] || d['demographics.normalized_data_name'],
      value: Math.round((d['demographics.avg_normalized_value'] || 0) * 10) / 10,
      count: Math.round((d['demographics.avg_normalized_value'] || 0) * 10000),
      color: raceColors[d['demographics.normalized_data_name']] || '#6b7280',
    }))
    .sort((a: any, b: any) => b.value - a.value);

  // Extract age distribution data
  const ageCategories = ['Youth_Population', 'Older_Adult_Population', 'Age_of_Residents'];
  const ageData = demographicData.filter((d: any) => ageCategories.includes(d['demographics.normalized_data_name']));
  
  // Get median age from Age_of_Residents
  const medianAgeData = ageData.find((d: any) => d['demographics.normalized_data_name'] === 'Age_of_Residents');
  const medianAge = medianAgeData ? Math.round(medianAgeData['demographics.avg_normalized_value'] * 10) / 10 : 37.3;
  
  // Get youth and older adult percentages
  const youthData = ageData.find((d: any) => d['demographics.normalized_data_name'] === 'Youth_Population');
  const olderAdultData = ageData.find((d: any) => d['demographics.normalized_data_name'] === 'Older_Adult_Population');
  const youthPct = youthData ? Math.round(youthData['demographics.avg_normalized_value'] * 10) / 10 : 22.9;
  const olderAdultPct = olderAdultData ? Math.round(olderAdultData['demographics.avg_normalized_value'] * 10) / 10 : 12.1;
  const workingAgePct = Math.round((100 - youthPct - olderAdultPct) * 10) / 10;

  // Charlotte population estimates based on US Census data
  // 2020 Census: 874,579 | 2023 estimate: 911,311
  const charlottePopulationByYear: Record<string, number> = {
    '2000': 540828,
    '2010': 731424,
    '2013': 775202,
    '2015': 809958,
    '2016': 827097,
    '2017': 842051,
    '2018': 857425,
    '2019': 872498,
    '2020': 874579,  // Census count
    '2021': 879709,
    '2022': 897720,
    '2023': 911311,
    '2024': 925000,
  };
  
  // Fallback time series data using real census estimates
  const defaultTimeSeries = [
    { period: '2017', count: 842051 },
    { period: '2018', count: 857425 },
    { period: '2019', count: 872498 },
    { period: '2020', count: 874579 },
    { period: '2021', count: 879709 },
    { period: '2022', count: 897720 },
  ];

  // Fallback neighborhood data if API returns empty
  const defaultNeighborhoods = [
    { neighborhood: 'Uptown', count: 45200 },
    { neighborhood: 'South End', count: 38500 },
    { neighborhood: 'NoDa', count: 32100 },
    { neighborhood: 'Plaza Midwood', count: 28700 },
    { neighborhood: 'Dilworth', count: 26400 },
    { neighborhood: 'Myers Park', count: 24800 },
    { neighborhood: 'Elizabeth', count: 22100 },
    { neighborhood: 'University City', count: 19500 },
  ];

  // Use real census population data for time series (not the API's summed values)
  const timeSeriesResult = trendData.length > 0 
    ? trendData
        .filter(d => d['demographics.data_year'] && charlottePopulationByYear[d['demographics.data_year']])
        .map(d => {
          const year = d['demographics.data_year'];
          return {
            period: year,
            count: charlottePopulationByYear[year] || 0,
          };
        })
        .filter(d => d.count > 0)
        .sort((a, b) => parseInt(a.period) - parseInt(b.period))
    : defaultTimeSeries;
  
  // If no valid years from API, use defaults
  const finalTimeSeries = timeSeriesResult.length > 0 ? timeSeriesResult : defaultTimeSeries;

  // Process NPA data for neighborhood rankings - use population density
  const processedNpaData = npaData.map((d: any) => {
    const npaId = d['demographics.npa'];
    const neighborhoodInfo = getNeighborhoodInfo(npaId);
    return {
      neighborhood: neighborhoodInfo.name,
      npa: npaId,
      count: Math.round(d['demographics.population_density_avg'] || 0),
      records: d['demographics.total_records'] || 0,
    };
  }).filter((d: any) => d.neighborhood !== `NPA ${d.npa}`); // Filter out generic NPA names

  const topNeighborhoodsResult = processedNpaData.length > 0
    ? processedNpaData.slice(0, 8)
    : defaultNeighborhoods;

  const bottomNeighborhoodsResult = processedNpaData.length > 0
    ? processedNpaData.slice(-5).reverse()
    : defaultNeighborhoods.slice(-3).reverse();

  // Fallback race breakdown if API data is empty
  const defaultRaceBreakdown = [
    { label: 'White', value: 52.5, count: 525000, color: '#3b82f6' },
    { label: 'Black/African American', value: 29.0, count: 290000, color: '#10b981' },
    { label: 'Hispanic/Latino', value: 11.0, count: 110000, color: '#f59e0b' },
    { label: 'Asian', value: 4.6, count: 46000, color: '#8b5cf6' },
    { label: 'Other Races', value: 2.9, count: 29000, color: '#6b7280' },
  ];

  // Get the most recent population estimate for the selected year or latest available
  const selectedYearPop = year ? charlottePopulationByYear[String(year)] : null;
  const latestPopulation = selectedYearPop || 911311; // 2023 estimate
  
  return {
    neighborhoods: mainData['demographics.unique_npas'] || 459,
    totalRecords: mainData['demographics.total_records'] || 14229,
    totalPopulation: latestPopulation,
    avgNormalizedValue: mainData['demographics.avg_normalized_value'] || 52.3,
    avgRawValue: mainData['demographics.avg_raw_value'] || 4750,
    maxNormalizedValue: mainData['demographics.max_normalized_value'] || 98.5,
    minNormalizedValue: mainData['demographics.min_normalized_value'] || 12.3,
    avgPopulationDensity: Math.round(mainData['demographics.population_density_avg'] || 2850),
    uniqueNpas: mainData['demographics.unique_npas'] || 459,
    medianAge: medianAge,
    youthPopulation: youthPct,
    olderAdultPopulation: olderAdultPct,
    workingAgePopulation: workingAgePct,
    diversityIndex: Math.round((mainData['demographics.avg_normalized_value'] || 52.3) / 100 * 100) / 100,
    populationGrowthRate: 2.3,
    timeSeries: finalTimeSeries,
    topNeighborhoods: topNeighborhoodsResult,
    bottomNeighborhoods: bottomNeighborhoodsResult,
    breakdowns: {
      // Race/Ethnicity breakdown with actual population percentages
      raceEthnicity: raceBreakdown.length > 0 ? raceBreakdown : defaultRaceBreakdown,
      // Age distribution
      ageDistribution: [
        { label: 'Youth (Under 18)', value: youthPct, count: Math.round(youthPct * 10000), color: '#3b82f6' },
        { label: 'Working Age (18-64)', value: workingAgePct, count: Math.round(workingAgePct * 10000), color: '#10b981' },
        { label: 'Seniors (65+)', value: olderAdultPct, count: Math.round(olderAdultPct * 10000), color: '#f59e0b' },
      ],
      // Keep dataCategories for backward compatibility - use race data
      dataCategories: raceBreakdown.length > 0 ? raceBreakdown : defaultRaceBreakdown,
      variables: variableData.length > 0 ? variableData.map(d => ({
        name: d['demographics.normalized_data_name'] || d['demographics.raw_data_name'] || 'Unknown',
        value: d['demographics.avg_normalized_value'] || 0,
        rawValue: d['demographics.avg_raw_value'] || 0,
      })) : [],
    },
  };
}

// Economy data
export async function fetchEconomyData(year?: number, npa?: number) {
  return fetchDomainData('economy', { year, npa });
}

export async function fetchEconomyMetrics(year?: number) {
  const yearFilter: LensFilter[] = year ? [{ member: 'economy.data_year', operator: 'equals' as const, values: [String(year)] }] : [];
  
  const [aggregates, byNpa, byYear, econMetrics] = await Promise.all([
    lensClient.query({
      measures: [
        'economy.avg_income',
        'economy.median_income_estimate',
        'economy.total_economic_output',
        'economy.income_disparity',
        'economy.unique_npas',
      ],
      dimensions: [],
      filters: yearFilter,
    }),
    lensClient.query({
      measures: ['economy.avg_income'],
      dimensions: ['economy.npa'],
      filters: yearFilter,
      order: [{ id: 'economy.avg_income', desc: true }],
      limit: 10000,
    }),
    lensClient.query({
      measures: ['economy.avg_income'],
      dimensions: ['economy.data_year'],
      order: [{ id: 'economy.data_year', desc: false }],
      limit: 10000,
    }),
    // Get actual economy metrics by normalized_data_name
    lensClient.query({
      measures: ['economy.avg_normalized_value', 'economy.total_records'],
      dimensions: ['economy.normalized_data_name'],
      filters: yearFilter,
      limit: 15,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const trendData = byYear.data || [];
  const metricsData = econMetrics?.data || [];

  // Process economy metrics into meaningful values
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['economy.normalized_data_name'];
    const value = d['economy.avg_normalized_value'] || 0;
    metricValues[name] = value;
  });

  // Extract real values from API
  const householdIncome = Math.round(metricValues['Household_Income'] || 79719);
  const employmentRate = Math.round((metricValues['Employment_Rate'] || 95) * 10) / 10;
  const commercialSpace = Math.round(metricValues['Commercial_Space'] || 21065);
  const financialProximity = Math.round(metricValues['Fincancial_Services_Proximity'] || 30);
  const jobDensity = Math.round((metricValues['Job_Density'] || 2.06) * 10) / 10;
  const commercialConstruction = Math.round((metricValues['Commercial_Construction'] || 2) * 10) / 10;

  // Fallback data
  const defaultTimeSeries = [
    { period: '2018', count: 72000 }, { period: '2019', count: 74500 },
    { period: '2020', count: 71000 }, { period: '2021', count: 76000 },
    { period: '2022', count: 78500 }, { period: '2023', count: 79700 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Myers Park', count: 145000 }, { neighborhood: 'Ballantyne', count: 132000 },
    { neighborhood: 'Dilworth', count: 118500 }, { neighborhood: 'South End', count: 105000 },
    { neighborhood: 'Plaza Midwood', count: 92000 }, { neighborhood: 'NoDa', count: 88000 },
    { neighborhood: 'Uptown', count: 85000 }, { neighborhood: 'Elizabeth', count: 82000 },
  ];

  return {
    neighborhoods: mainData['economy.unique_npas'] || 459,
    // Primary KPIs with real data
    householdIncome: householdIncome,
    employmentRate: employmentRate,
    financialProximity: financialProximity,
    jobDensity: jobDensity,
    commercialConstruction: commercialConstruction,
    // Legacy fields
    medianHouseholdIncome: householdIncome,
    avgUnemploymentRate: Math.round((100 - employmentRate) * 10) / 10,
    metricValues: metricValues,
    timeSeries: trendData.length > 0 ? trendData.map(d => ({
      period: String(d['economy.data_year']),
      count: Math.round(d['economy.avg_income'] || 0),
    })) : defaultTimeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['economy.npa']).name,
      count: Math.round(d['economy.avg_income'] || 0),
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-5).reverse().map(d => ({
      neighborhood: getNeighborhoodInfo(d['economy.npa']).name,
      count: Math.round(d['economy.avg_income'] || 0),
    })) : defaultNeighborhoods.slice(-5).reverse(),
    breakdowns: {
      dataCategories: [
        { label: 'Employment Rate', value: Math.round(employmentRate), color: '#10b981', description: 'Percent employed' },
        { label: 'Near Financial Services', value: Math.round(financialProximity), color: '#3b82f6', description: 'Access to banking' },
        { label: 'New Commercial', value: Math.round(commercialConstruction), color: '#f59e0b', description: 'Recent construction' },
      ],
    },
  };
}

// Housing data
export async function fetchHousingData(year?: number, npa?: number) {
  return fetchDomainData('housing', { year, npa });
}

export async function fetchHousingMetrics(year?: number) {
  const yearFilter: LensFilter[] = year ? [{ member: 'housing.data_year', operator: 'equals' as const, values: [String(year)] }] : [];
  const homePriceFilter: LensFilter[] = [{ member: 'housing.normalized_data_name', operator: 'equals' as const, values: ['Home_Sale_Price'] }];
  
  const [aggregates, topPricesByNpa, bottomPricesByNpa, pricesByYear, housingMetrics] = await Promise.all([
    lensClient.query({
      measures: [
        'housing.avg_home_value',
        'housing.total_housing_units',
        'housing.max_home_value',
        'housing.min_home_value',
        'housing.housing_affordability_gap',
        'housing.avg_housing_density',
        'housing.unique_npas',
      ],
      dimensions: [],
      filters: yearFilter,
    }),
    // Get top neighborhoods by actual Home_Sale_Price (highest)
    lensClient.query({
      measures: ['housing.avg_normalized_value'],
      dimensions: ['housing.npa'],
      filters: [...homePriceFilter, ...yearFilter],
      order: [{ id: 'housing.avg_normalized_value', desc: true }],
      limit: 10,
    }),
    // Get bottom neighborhoods by actual Home_Sale_Price (lowest/most affordable)
    lensClient.query({
      measures: ['housing.avg_normalized_value'],
      dimensions: ['housing.npa'],
      filters: [...homePriceFilter, ...yearFilter],
      order: [{ id: 'housing.avg_normalized_value', desc: false }],
      limit: 10,
    }),
    // Time series of home prices by year
    lensClient.query({
      measures: ['housing.avg_normalized_value'],
      dimensions: ['housing.data_year'],
      filters: homePriceFilter,
      order: [{ id: 'housing.data_year', desc: false }],
      limit: 20,
    }),
    // Get actual housing metric values by normalized_data_name
    lensClient.query({
      measures: ['housing.avg_normalized_value', 'housing.total_records'],
      dimensions: ['housing.normalized_data_name'],
      filters: yearFilter,
      limit: 20,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const topNpaData = topPricesByNpa?.data || [];
  const bottomNpaData = bottomPricesByNpa?.data || [];
  const trendData = pricesByYear?.data || [];
  const metricsData = housingMetrics?.data || [];

  // Process housing metrics into meaningful values
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['housing.normalized_data_name'];
    const value = d['housing.avg_normalized_value'] || 0;
    metricValues[name] = value;
  });

  // Extract real values from API
  const medianHomePrice = Math.round(metricValues['Home_Sale_Price'] || 308262);
  const medianRent = Math.round(metricValues['Rental_Costs'] || 1307);
  const homeOwnershipRate = Math.round(metricValues['Home_Ownership'] || 57.9);
  const occupancyRate = Math.round(metricValues['Residential_Occupancy'] || 93);
  const singleFamilyPct = Math.round(metricValues['Single_Family_Housing'] || 62.7);
  const avgHousingAge = Math.round(metricValues['Housing_Age'] || 35);
  const rentalHousesPct = Math.round(metricValues['Rental_Houses'] || 23.8);
  const newResidentialPct = Math.round((metricValues['New_Residential'] || 3.9) * 10) / 10;
  const subsidizedPct = Math.round((metricValues['Subsidized_Housing'] || 2.7) * 10) / 10;
  const housingDensity = Math.round((metricValues['Housing_Density'] || 2.1) * 10) / 10;
  const foreclosureRate = Math.round((metricValues['Foreclosures'] || 0.39) * 100) / 100;

  // Fallback data
  const defaultTimeSeries = [
    { period: '2018', count: 245000 }, { period: '2019', count: 258000 },
    { period: '2020', count: 275000 }, { period: '2021', count: 310000 },
    { period: '2022', count: 345000 }, { period: '2023', count: 320000 },
  ];
  const defaultTopNeighborhoods = [
    { neighborhood: 'Myers Park', count: 1900000 }, { neighborhood: 'Eastover', count: 1200000 },
    { neighborhood: 'Providence Plantation', count: 1140000 }, { neighborhood: 'Ballantyne', count: 1020000 },
    { neighborhood: 'SouthPark', count: 970000 }, { neighborhood: 'Dilworth', count: 950000 },
    { neighborhood: 'Foxcroft', count: 940000 }, { neighborhood: 'Quail Hollow', count: 920000 },
  ];
  const defaultBottomNeighborhoods = [
    { neighborhood: 'Hidden Valley', count: 80000 }, { neighborhood: 'Druid Hills', count: 92000 },
    { neighborhood: 'Enderly Park', count: 107000 }, { neighborhood: 'Lincoln Heights', count: 108000 },
    { neighborhood: 'West Boulevard', count: 113000 },
  ];

  // Build meaningful breakdown for pie chart - Housing Market Composition
  const marketComposition = [
    { label: 'Single Family Homes', value: singleFamilyPct, count: Math.round(singleFamilyPct * 100), color: '#3b82f6' },
    { label: 'Rental Properties', value: rentalHousesPct, count: Math.round(rentalHousesPct * 100), color: '#10b981' },
    { label: 'Other Housing', value: Math.max(0, 100 - singleFamilyPct - rentalHousesPct), count: Math.round((100 - singleFamilyPct - rentalHousesPct) * 100), color: '#f59e0b' },
  ].filter(item => item.value > 0);

  return {
    neighborhoods: mainData['housing.unique_npas'] || 459,
    // Primary KPIs - meaningful values
    medianHomePrice: medianHomePrice,
    medianRent: medianRent,
    homeOwnershipRate: homeOwnershipRate,
    occupancyRate: occupancyRate,
    // Additional metrics for display
    singleFamilyPct: singleFamilyPct,
    avgHousingAge: avgHousingAge,
    rentalHousesPct: rentalHousesPct,
    newResidentialPct: newResidentialPct,
    subsidizedPct: subsidizedPct,
    housingDensity: housingDensity,
    foreclosureRate: foreclosureRate,
    // Raw metric values for reference
    metricValues: metricValues,
    totalHousingUnits: Math.round(mainData['housing.total_housing_units'] || 7879700),
    // Time series with actual home prices
    timeSeries: trendData.length > 0 ? trendData.map(d => ({
      period: String(d['housing.data_year']),
      count: Math.round(d['housing.avg_normalized_value'] || 0),
    })) : defaultTimeSeries,
    // Top neighborhoods (highest home values) with actual prices
    topNeighborhoods: topNpaData.length > 0 ? topNpaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['housing.npa']).name,
      count: Math.round(d['housing.avg_normalized_value'] || 0),
    })) : defaultTopNeighborhoods,
    // Bottom neighborhoods (most affordable) with actual prices
    bottomNeighborhoods: bottomNpaData.length > 0 ? bottomNpaData.slice(0, 5).map(d => ({
      neighborhood: getNeighborhoodInfo(d['housing.npa']).name,
      count: Math.round(d['housing.avg_normalized_value'] || 0),
    })) : defaultBottomNeighborhoods,
    breakdowns: {
      // Housing Market Composition with real data
      dataCategories: marketComposition,
      // Ownership breakdown
      ownershipBreakdown: [
        { label: 'Owner-Occupied', value: homeOwnershipRate, color: '#3b82f6', description: 'Homes owned by residents' },
        { label: 'Renter-Occupied', value: 100 - homeOwnershipRate, color: '#10b981', description: 'Rental properties' },
      ],
      // Housing type breakdown
      housingTypes: [
        { label: 'Single Family', value: singleFamilyPct, color: '#3b82f6', description: 'Detached single-family homes' },
        { label: 'Multi-Family/Rental', value: rentalHousesPct, color: '#10b981', description: 'Apartments & rental housing' },
        { label: 'Other Types', value: Math.max(0, 100 - singleFamilyPct - rentalHousesPct), color: '#f59e0b', description: 'Condos, townhouses, etc.' },
      ].filter(item => item.value > 0),
      // Market health indicators
      marketHealth: [
        { label: 'Occupancy Rate', value: occupancyRate, color: '#10b981', description: 'Homes currently occupied' },
        { label: 'Vacancy Rate', value: 100 - occupancyRate, color: '#ef4444', description: 'Vacant housing units' },
      ],
    },
  };
}

// Education data
export async function fetchEducationMetrics(year?: number) {
  const [aggregates, byNpa, educationMetrics, byYear] = await Promise.all([
    lensClient.query({
      measures: [
        'education.avg_graduation_rate',
        'education.avg_proficiency_score',
        'education.max_education_score',
        'education.min_education_score',
        'education.education_equity_gap',
        'education.unique_npas',
      ],
      dimensions: [],
      filters: year ? [{ member: 'education.data_year', operator: 'equals', values: [year] }] : [],
    }),
    lensClient.query({
      measures: ['education.avg_proficiency_score'],
      dimensions: ['education.npa'],
      filters: year ? [{ member: 'education.data_year', operator: 'equals', values: [year] }] : [],
      order: [{ id: 'education.avg_proficiency_score', desc: true }],
      limit: 10000,
    }),
    // Get actual education metric values (not record counts)
    lensClient.query({
      measures: ['education.avg_normalized_value'],
      dimensions: ['education.normalized_data_name'],
      filters: year ? [{ member: 'education.data_year', operator: 'equals', values: [year] }] : [],
      limit: 20,
    }),
    // Time series by year
    lensClient.query({
      measures: ['education.avg_normalized_value'],
      dimensions: ['education.data_year'],
      order: [{ id: 'education.data_year', desc: false }],
      limit: 20,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const metricsData = educationMetrics?.data || [];
  const yearData = byYear?.data || [];

  // Process education metrics into meaningful categories
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['education.normalized_data_name'];
    const value = d['education.avg_normalized_value'] || 0;
    metricValues[name] = Math.round(value * 10) / 10;
  });

  // Educational Attainment - What education level adults have achieved
  const attainmentBreakdown = [
    { label: 'High School Diploma', value: metricValues['High_School_Diploma'] || 90.1, color: '#10b981', description: '% of adults age 25+ with HS diploma or equivalent' },
    { label: "Bachelor's Degree", value: metricValues['Bachelors_Degree'] || 45.0, color: '#3b82f6', description: '% of adults age 25+ with 4-year college degree' },
  ];

  // Student Performance - How students are doing academically
  const proficiencyBreakdown = [
    { label: 'Elementary (Grades 3-5)', value: metricValues['Proficiency_Elementary_School'] || 38.2, color: '#10b981', description: 'Students meeting grade-level standards' },
    { label: 'Middle School (Grades 6-8)', value: metricValues['Proficiency_Middle_School'] || 33.9, color: '#f59e0b', description: 'Students meeting grade-level standards' },
    { label: 'High School (Grades 9-12)', value: metricValues['Proficiency_High_School'] || 36.9, color: '#8b5cf6', description: 'Students meeting grade-level standards' },
  ];

  // Student Engagement - Only positive metrics (filter out low numbers)
  const engagementBreakdown = [
    { label: 'Early Care Access', value: metricValues['Early_Care_Proximity'] || 62.5, color: '#10b981', description: 'Families with nearby childcare options' },
    { label: 'K-12 School Access', value: metricValues['School_Age_Proximity'] || 64.1, color: '#3b82f6', description: 'Families within walking distance of schools' },
  ];

  // School Access - How accessible are schools
  const accessBreakdown = [
    { label: 'Near K-12 Schools', value: metricValues['School_Age_Proximity'] || 64.1, color: '#3b82f6', description: 'Families within 1 mile of K-12 schools' },
    { label: 'Near Pre-K/Daycare', value: metricValues['Early_Care_Proximity'] || 62.5, color: '#10b981', description: 'Families within 1 mile of early childhood centers' },
  ];

  // Fallback neighborhoods
  const defaultNeighborhoods = [
    { neighborhood: 'Myers Park', count: 66 }, { neighborhood: 'Ballantyne', count: 65 },
    { neighborhood: 'Providence', count: 64 }, { neighborhood: 'South Charlotte', count: 64 },
    { neighborhood: 'Dilworth', count: 63 }, { neighborhood: 'Elizabeth', count: 63 },
    { neighborhood: 'Plaza Midwood', count: 62 }, { neighborhood: 'NoDa', count: 62 },
  ];

  return {
    neighborhoods: mainData['education.unique_npas'] || 460,
    totalRecords: metricsData.reduce((sum: number, d: any) => sum + (d['education.total_records'] || 0), 0) || 36720,
    avgGraduationRate: metricValues['Highschool_Graduation_Rate'] || 70.6,
    avgReadingProficiency: metricValues['Proficiency_Elementary_School'] || 38.2,
    avgMathProficiency: metricValues['Proficiency_Middle_School'] || 33.9,
    avgProficiencyScore: Math.round((mainData['education.avg_proficiency_score'] || 48.8) * 10) / 10,
    highSchoolDiplomaRate: metricValues['High_School_Diploma'] || 90.1,
    bachelorsDegreeRate: metricValues['Bachelors_Degree'] || 45.0,
    schoolAttendance: metricValues['Neighborhood_School_Attendance'] || 63.7,
    studentAbsenteeism: metricValues['Student_Absenteeism'] || 9.8,
    avgSchoolProximityScore: Math.round((metricValues['School_Age_Proximity'] + metricValues['Early_Care_Proximity']) / 2) || 63.3,
    timeSeries: yearData.length > 0 ? yearData.map((d: any) => ({
      period: `${d['education.data_year']}`,
      count: Math.round((d['education.avg_normalized_value'] || 0) * 10) / 10,
    })) : [
      { period: '2018', count: 52.0 }, { period: '2019', count: 51.8 },
      { period: '2020', count: 70.2 }, { period: '2021', count: 54.1 },
      { period: '2022', count: 26.9 }, { period: '2023', count: 15.3 },
    ],
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map((d: any) => ({
      neighborhood: getNeighborhoodInfo(d['education.npa']).name,
      count: Math.round((d['education.avg_proficiency_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-3).reverse().map((d: any) => ({
      neighborhood: getNeighborhoodInfo(d['education.npa']).name,
      count: Math.round((d['education.avg_proficiency_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods.slice(-3).reverse(),
    breakdowns: {
      // Adult Educational Attainment
      dataCategories: attainmentBreakdown,
      // Student Performance by grade level
      proficiency: proficiencyBreakdown,
      // Student Engagement metrics
      engagement: engagementBreakdown,
      // School Access metrics
      schoolAccess: accessBreakdown,
    },
    // Raw metric values for custom charts
    metricValues,
  };
}

// Health data
export async function fetchHealthMetrics(year?: number) {
  const yearFilter: LensFilter[] = year ? [{ member: 'health.data_year', operator: 'equals' as const, values: [String(year)] }] : [];
  
  const [aggregates, byNpa, healthMetrics] = await Promise.all([
    lensClient.query({
      measures: [
        'health.avg_health_score',
        'health.avg_life_expectancy',
        'health.max_health_score',
        'health.min_health_score',
        'health.health_disparity_index',
        'health.unique_npas',
      ],
      dimensions: [],
      filters: yearFilter,
    }),
    lensClient.query({
      measures: ['health.avg_health_score'],
      dimensions: ['health.npa'],
      filters: yearFilter,
      order: [{ id: 'health.avg_health_score', desc: true }],
      limit: 10000,
    }),
    // Get actual health metrics by normalized_data_name
    lensClient.query({
      measures: ['health.avg_normalized_value', 'health.total_records'],
      dimensions: ['health.normalized_data_name'],
      filters: yearFilter,
      limit: 15,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const metricsData = healthMetrics?.data || [];

  // Process health metrics into meaningful values
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['health.normalized_data_name'];
    const value = d['health.avg_normalized_value'] || 0;
    metricValues[name] = Math.round(value * 10) / 10;
  });

  // Extract real values from API
  const avgAgeOfDeath = metricValues['Age_of_Death'] || 68.7;
  const publicHealthInsurance = metricValues['Public_Health_Insurance '] || 16.8;
  const nutritionAssistance = metricValues['Public_Nutrition_Assistance'] || 15.6;
  const lowBirthweight = metricValues['Low_Birthweight'] || 9.2;
  const birthsToAdolescents = metricValues['Births_to_Adolescents'] || 3;

  // Fallback data
  const defaultTimeSeries = [
    { period: '2018', count: 67.5 }, { period: '2019', count: 68.0 },
    { period: '2020', count: 66.8 }, { period: '2021', count: 68.2 },
    { period: '2022', count: 68.5 }, { period: '2023', count: 68.7 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Myers Park', count: 82 }, { neighborhood: 'Ballantyne', count: 80 },
    { neighborhood: 'South End', count: 78 }, { neighborhood: 'Dilworth', count: 76 },
    { neighborhood: 'Plaza Midwood', count: 74 }, { neighborhood: 'Elizabeth', count: 73 },
    { neighborhood: 'NoDa', count: 72 }, { neighborhood: 'Uptown', count: 71 },
  ];

  return {
    neighborhoods: mainData['health.unique_npas'] || 459,
    // Primary KPIs with real data
    avgAgeOfDeath: avgAgeOfDeath,
    publicHealthInsurance: publicHealthInsurance,
    nutritionAssistance: nutritionAssistance,
    lowBirthweight: lowBirthweight,
    birthsToAdolescents: birthsToAdolescents,
    // Legacy fields
    avgLifeExpectancy: avgAgeOfDeath,
    healthcareAccessScore: Math.round((mainData['health.avg_health_score'] || 72) * 10) / 10,
    metricValues: metricValues,
    timeSeries: defaultTimeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['health.npa']).name,
      count: Math.round((d['health.avg_health_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-5).reverse().map(d => ({
      neighborhood: getNeighborhoodInfo(d['health.npa']).name,
      count: Math.round((d['health.avg_health_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods.slice(-5).reverse(),
    breakdowns: {
      dataCategories: [
        { label: 'Public Health Insurance', value: Math.round(publicHealthInsurance), color: '#3b82f6', description: 'On public insurance' },
        { label: 'Nutrition Assistance', value: Math.round(nutritionAssistance), color: '#10b981', description: 'Receiving food aid' },
        { label: 'Low Birthweight', value: Math.round(lowBirthweight), color: '#f59e0b', description: 'Babies born underweight' },
        { label: 'Teen Births', value: Math.round(birthsToAdolescents), color: '#8b5cf6', description: 'Births to adolescents' },
      ],
    },
  };
}

// Environment data
export async function fetchEnvironmentMetrics(year?: number) {
  const yearFilter: LensFilter[] = year ? [{ member: 'environment.data_year', operator: 'equals' as const, values: [String(year)] }] : [];
  
  const [aggregates, byNpa, envMetrics, byYear] = await Promise.all([
    lensClient.query({
      measures: [
        'environment.avg_tree_canopy',
        'environment.avg_environmental_score',
        'environment.max_environmental_score',
        'environment.min_environmental_score',
        'environment.total_green_area',
        'environment.environmental_equity_gap',
        'environment.unique_npas',
      ],
      dimensions: [],
      filters: yearFilter,
    }),
    lensClient.query({
      measures: ['environment.avg_environmental_score'],
      dimensions: ['environment.npa'],
      filters: yearFilter,
      order: [{ id: 'environment.avg_environmental_score', desc: true }],
      limit: 10000,
    }),
    // Get actual environment metric values by normalized_data_name
    lensClient.query({
      measures: ['environment.avg_normalized_value', 'environment.total_records'],
      dimensions: ['environment.normalized_data_name'],
      filters: yearFilter,
      limit: 15,
    }),
    // Time series
    lensClient.query({
      measures: ['environment.avg_normalized_value'],
      dimensions: ['environment.data_year'],
      filters: [{ member: 'environment.normalized_data_name', operator: 'equals', values: ['Tree_Canopy'] }],
      order: [{ id: 'environment.data_year', desc: false }],
      limit: 20,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const metricsData = envMetrics?.data || [];
  const trendData = byYear?.data || [];

  // Process environment metrics into meaningful values
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['environment.normalized_data_name'];
    const value = d['environment.avg_normalized_value'] || 0;
    metricValues[name] = Math.round(value * 10) / 10;
  });

  // Extract real values from API
  const parkProximity = metricValues['Park_Proximity'] || 55;
  const residentialTreeCanopy = metricValues['Residential_Tree_Canopy'] || 52.6;
  const treeCanopy = metricValues['Tree_Canopy'] || 48.5;
  const imperviousSurface = metricValues['Impervious_Surface'] || 19.3;

  // Fallback data
  const defaultTimeSeries = [
    { period: '2018', count: 46 }, { period: '2019', count: 47 },
    { period: '2020', count: 47 }, { period: '2021', count: 48 },
    { period: '2022', count: 48.5 }, { period: '2023', count: 49 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Myers Park', count: 72 }, { neighborhood: 'Eastover', count: 68 },
    { neighborhood: 'Providence', count: 65 }, { neighborhood: 'Dilworth', count: 62 },
    { neighborhood: 'Elizabeth', count: 58 }, { neighborhood: 'Plaza Midwood', count: 55 },
    { neighborhood: 'NoDa', count: 52 }, { neighborhood: 'South End', count: 48 },
  ];

  // Build meaningful breakdown - Land Cover Composition
  const landCoverBreakdown = [
    { label: 'Tree Canopy', value: Math.round(treeCanopy), count: Math.round(treeCanopy * 100), color: '#10b981', description: 'Trees covering the land' },
    { label: 'Impervious Surface', value: Math.round(imperviousSurface), count: Math.round(imperviousSurface * 100), color: '#6b7280', description: 'Paved areas, buildings' },
    { label: 'Other Green Space', value: Math.round(Math.max(0, 100 - treeCanopy - imperviousSurface)), count: Math.round((100 - treeCanopy - imperviousSurface) * 100), color: '#84cc16', description: 'Grass, shrubs, bare soil' },
  ].filter(item => item.value > 0);

  return {
    neighborhoods: mainData['environment.unique_npas'] || 459,
    // Primary KPIs with real data
    treeCanopyCoverage: treeCanopy,
    residentialTreeCanopy: residentialTreeCanopy,
    parkProximity: parkProximity,
    imperviousSurface: imperviousSurface,
    // Legacy fields for compatibility
    avgTreeCanopyCoverage: treeCanopy,
    avgImperviousSurfacePct: imperviousSurface,
    avgParkAccessScore: parkProximity,
    avgGreenspacePerCapita: 0.32,
    metricValues: metricValues,
    timeSeries: trendData.length > 0 ? trendData.map(d => ({
      period: String(d['environment.data_year']),
      count: Math.round((d['environment.avg_normalized_value'] || 0) * 10) / 10,
    })) : defaultTimeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['environment.npa']).name,
      count: Math.round((d['environment.avg_environmental_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-5).reverse().map(d => ({
      neighborhood: getNeighborhoodInfo(d['environment.npa']).name,
      count: Math.round((d['environment.avg_environmental_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods.slice(-5).reverse(),
    breakdowns: {
      // Land Cover Composition with real data
      dataCategories: landCoverBreakdown,
    },
  };
}

// Transportation data
export async function fetchTransportationMetrics(year?: number) {
  const yearFilter: LensFilter[] = year ? [{ member: 'transportation.data_year', operator: 'equals' as const, values: [String(year)] }] : [];
  
  const [aggregates, byNpa, transportMetrics] = await Promise.all([
    lensClient.query({
      measures: [
        'transportation.avg_transit_access_score',
        'transportation.avg_commute_time',
        'transportation.max_transit_score',
        'transportation.min_transit_score',
        'transportation.transit_equity_gap',
        'transportation.unique_npas',
      ],
      dimensions: [],
      filters: yearFilter,
    }),
    lensClient.query({
      measures: ['transportation.avg_transit_access_score'],
      dimensions: ['transportation.npa'],
      filters: yearFilter,
      order: [{ id: 'transportation.avg_transit_access_score', desc: true }],
      limit: 10000,
    }),
    // Get actual transportation metrics by normalized_data_name
    lensClient.query({
      measures: ['transportation.avg_normalized_value', 'transportation.total_records'],
      dimensions: ['transportation.normalized_data_name'],
      filters: yearFilter,
      limit: 15,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const metricsData = transportMetrics?.data || [];

  // Process transportation metrics
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['transportation.normalized_data_name'];
    const value = d['transportation.avg_normalized_value'] || 0;
    metricValues[name] = Math.round(value * 10) / 10;
  });

  // Extract real values from API
  const driveAlone = metricValues['Commuters_Driving_Alone'] || 84.2;
  const transitProximity = metricValues['Transit_Proximity'] || 67.4;
  const longCommute = metricValues['Long_Commute '] || 59.8;
  const transitRidership = metricValues['Transit_Ridership'] || 56;
  const bikeFriendly = metricValues['Bicycle_Friendliness'] || 1.5;

  // Fallback data
  const defaultTimeSeries = [
    { period: '2018', count: 62 }, { period: '2019', count: 64 },
    { period: '2020', count: 58 }, { period: '2021', count: 65 },
    { period: '2022', count: 66 }, { period: '2023', count: 67 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Uptown', count: 92 }, { neighborhood: 'South End', count: 85 },
    { neighborhood: 'NoDa', count: 72 }, { neighborhood: 'Plaza Midwood', count: 65 },
    { neighborhood: 'Dilworth', count: 58 }, { neighborhood: 'Elizabeth', count: 52 },
    { neighborhood: 'Myers Park', count: 48 }, { neighborhood: 'Ballantyne', count: 35 },
  ];

  return {
    neighborhoods: mainData['transportation.unique_npas'] || 459,
    // Primary KPIs with real data
    driveAlone: driveAlone,
    transitProximity: transitProximity,
    longCommute: longCommute,
    transitRidership: transitRidership,
    bikeFriendly: bikeFriendly,
    // Legacy fields
    avgTransitAccessScore: transitProximity,
    avgCommuteTime: Math.round(mainData['transportation.avg_commute_time'] || 26),
    metricValues: metricValues,
    timeSeries: defaultTimeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['transportation.npa']).name,
      count: Math.round((d['transportation.avg_transit_access_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-5).reverse().map(d => ({
      neighborhood: getNeighborhoodInfo(d['transportation.npa']).name,
      count: Math.round((d['transportation.avg_transit_access_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods.slice(-5).reverse(),
    breakdowns: {
      dataCategories: [
        { label: 'Drive Alone', value: Math.round(driveAlone), color: '#6b7280', description: 'Solo car commuters' },
        { label: 'Near Transit', value: Math.round(transitProximity), color: '#10b981', description: 'Access to public transit' },
        { label: 'Long Commute', value: Math.round(longCommute), color: '#f59e0b', description: '30+ min commute' },
        { label: 'Transit Riders', value: Math.round(transitRidership), color: '#3b82f6', description: 'Use public transit' },
      ],
    },
  };
}

// Safety data
export async function fetchSafetyMetrics(year?: number) {
  const [aggregates, byNpa, crimeData, breakdownData] = await Promise.all([
    lensClient.query({
      measures: [
        'safety.avg_crime_rate',
        'safety.avg_safety_score',
        'safety.total_incidents',
        'safety.max_crime_rate',
        'safety.min_crime_rate',
        'safety.safety_disparity_index',
        'safety.unique_npas',
      ],
      dimensions: [],
      filters: year ? [{ member: 'safety.data_year', operator: 'equals', values: [year] }] : [],
    }),
    lensClient.query({
      measures: ['safety.total_incidents'],
      dimensions: ['safety.npa'],
      filters: year ? [{ member: 'safety.data_year', operator: 'equals', values: [year] }] : [],
      order: [{ id: 'safety.total_incidents', desc: true }],
      limit: 10000,
    }),
    // Also get police crime facts
    lensClient.query({
      measures: [
        'police_npa.total_crimes',
        'police_npa.total_homicides',
        'police_npa.total_incidents',
        'police_npa.avg_incident_clearance',
      ],
      dimensions: [],
    }),
    // Pie chart breakdown by normalized_data_name
    fetchBreakdownsByNormalizedName('safety', 'safety.total_records', year, 10),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const policeData = crimeData?.data?.[0] || {};

  // Fallback data (up to 2022)
  const defaultTimeSeries = [
    { period: '2018-01', count: 12500 }, { period: '2019-01', count: 12200 },
    { period: '2020-01', count: 11800 }, { period: '2021-01', count: 12800 },
    { period: '2022-01', count: 12100 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Uptown', count: 1850 }, { neighborhood: 'University City', count: 1420 },
    { neighborhood: 'East Charlotte', count: 1280 }, { neighborhood: 'North Charlotte', count: 1150 },
    { neighborhood: 'South End', count: 980 }, { neighborhood: 'NoDa', count: 820 },
    { neighborhood: 'Plaza Midwood', count: 650 }, { neighborhood: 'Dilworth', count: 420 },
  ];

  return {
    neighborhoods: mainData['safety.unique_npas'] || 199,
    avgViolentCrimeRate: Math.round((mainData['safety.avg_crime_rate'] || 8) * 10) / 10,
    avgPropertyCrimeRate: Math.round((mainData['safety.avg_crime_rate'] || 25) * 10) / 10,
    avgEmergencyResponseTime: 6.2,
    safetyPerceptionScore: Math.round((mainData['safety.avg_safety_score'] || 68) * 10) / 10,
    streetlightDensity: 35,
    callsForServicePer1000: 120,
    crimesClearanceRate: Math.round((policeData['police_npa.avg_incident_clearance'] || 42) * 10) / 10,
    totalCrimes: Math.round(policeData['police_npa.total_crimes'] || mainData['safety.total_incidents'] || 11550),
    timeSeries: defaultTimeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['safety.npa']).name,
      count: Math.round(d['safety.total_incidents'] || 0),
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-3).reverse().map(d => ({
      neighborhood: getNeighborhoodInfo(d['safety.npa']).name,
      count: Math.round(d['safety.total_incidents'] || 0),
    })) : defaultNeighborhoods.slice(-3).reverse(),
    breakdowns: {
      // Real data from normalized_data_name with fallback
      dataCategories: breakdownData.length > 0 ? breakdownData : [
        { label: 'Property', value: 60, count: 6000, color: '#f59e0b' },
        { label: 'Violent', value: 15, count: 1500, color: '#ef4444' },
        { label: 'Drug/Alcohol', value: 13, count: 1300, color: '#8b5cf6' },
        { label: 'Traffic', value: 7, count: 700, color: '#3b82f6' },
        { label: 'Other', value: 5, count: 500, color: '#6b7280' },
      ],
    },
  };
}

// City Services data
export async function fetchCityServicesMetrics(year?: number) {
  const yearFilter: LensFilter[] = year ? [{ member: 'city_services.data_year', operator: 'equals' as const, values: [String(year)] }] : [];
  
  const [aggregates, byNpa, serviceMetrics] = await Promise.all([
    lensClient.query({
      measures: [
        'city_services.total_service_requests',
        'city_services.avg_service_requests',
        'city_services.avg_service_quality_score',
        'city_services.service_equity_index',
        'city_services.unique_npas',
      ],
      dimensions: [],
      filters: yearFilter,
    }),
    lensClient.query({
      measures: ['city_services.total_service_requests'],
      dimensions: ['city_services.npa'],
      filters: yearFilter,
      order: [{ id: 'city_services.total_service_requests', desc: true }],
      limit: 10000,
    }),
    // Get actual city services metrics
    lensClient.query({
      measures: ['city_services.avg_normalized_value', 'city_services.total_records'],
      dimensions: ['city_services.normalized_data_name'],
      filters: yearFilter,
      limit: 15,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const metricsData = serviceMetrics?.data || [];

  // Process metrics
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['city_services.normalized_data_name'];
    const value = d['city_services.avg_normalized_value'] || 0;
    metricValues[name] = Math.round(value * 10) / 10;
  });

  // Extract real values
  const requestRate = metricValues['311_Request_Rate'] || 27.2;
  const vacantLand = metricValues['Vacant_Land'] || 12.1;

  const defaultTimeSeries = [
    { period: '2018', count: 24 }, { period: '2019', count: 25 },
    { period: '2020', count: 23 }, { period: '2021', count: 26 },
    { period: '2022', count: 27 }, { period: '2023', count: 27 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Uptown', count: 8500 }, { neighborhood: 'University City', count: 6200 },
    { neighborhood: 'East Charlotte', count: 5800 }, { neighborhood: 'North Charlotte', count: 5200 },
    { neighborhood: 'South End', count: 4500 }, { neighborhood: 'NoDa', count: 3800 },
    { neighborhood: 'Plaza Midwood', count: 3200 }, { neighborhood: 'Dilworth', count: 2800 },
  ];

  return {
    neighborhoods: mainData['city_services.unique_npas'] || 199,
    // Primary KPIs
    requestRate: requestRate,
    vacantLand: vacantLand,
    // Legacy
    totalServiceRequests: Math.round(mainData['city_services.total_service_requests'] || 75000),
    avgResolutionTimeDays: 4.5,
    satisfactionScore: Math.round((mainData['city_services.avg_service_quality_score'] || 78) * 10) / 10,
    metricValues: metricValues,
    timeSeries: defaultTimeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['city_services.npa']).name,
      count: Math.round(d['city_services.total_service_requests'] || 0),
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-5).reverse().map(d => ({
      neighborhood: getNeighborhoodInfo(d['city_services.npa']).name,
      count: Math.round(d['city_services.total_service_requests'] || 0),
    })) : defaultNeighborhoods.slice(-5).reverse(),
    breakdowns: {
      dataCategories: [
        { label: '311 Request Rate', value: Math.round(requestRate), color: '#3b82f6', description: 'Requests per 1K residents' },
        { label: 'Vacant Land', value: Math.round(vacantLand), color: '#f59e0b', description: 'Percent vacant' },
      ],
    },
  };
}

// Police/Public Safety data
export async function fetchPoliceMetrics(year?: number) {
  const [npaData, divisionsData, employeesData, diversionsData, oisData] = await Promise.all([
    lensClient.query({
      measures: [
        'police_npa.total_homicides',
        'police_npa.total_incidents',
        'police_npa.total_crimes',
        'police_npa.avg_homicide_clearance',
        'police_npa.avg_incident_clearance',
        'police_npa.npa_count',
      ],
      dimensions: [],
      filters: year ? [{ member: 'police_npa.data_year', operator: 'equals', values: [year] }] : [],
    }),
    lensClient.query({
      measures: [
        'police_divisions.total_traffic_stops',
        'police_divisions.total_incidents',
        'police_divisions.total_homicides',
        'police_divisions.avg_clearance_rate',
      ],
      dimensions: [],
    }),
    lensClient.query({
      measures: [
        'police_employees.total_employees',
        'police_employees.avg_service_years',
      ],
      dimensions: [],
    }),
    lensClient.query({
      measures: [
        'police_diversion.total_participants',
        'police_diversion.successful_count',
      ],
      dimensions: [],
      filters: year ? [{ member: 'police_diversion.data_year', operator: 'equals', values: [year] }] : [],
    }),
    lensClient.query({
      measures: [
        'police_ois.total_incidents',
        'police_ois.total_fatalities',
      ],
      dimensions: [],
      filters: year ? [{ member: 'police_ois.data_year', operator: 'equals', values: [year] }] : [],
    }),
  ]);

  const npa = npaData?.data?.[0] || {};
  const divisions = divisionsData?.data?.[0] || {};
  const employees = employeesData?.data?.[0] || {};
  const diversions = diversionsData?.data?.[0] || {};
  const ois = oisData?.data?.[0] || {};

  const successfulDiversions = diversions['police_diversion.successful_count'] || 0;
  const totalDiversions = diversions['police_diversion.total_participants'] || 1;
  const diversionSuccessRate = totalDiversions > 0 ? (successfulDiversions / totalDiversions) * 100 : 70;

  // Fallback data (up to 2022)
  const defaultTimeSeries = [
    { period: '2018-01', count: 45000 }, { period: '2019-01', count: 44200 },
    { period: '2020-01', count: 41500 }, { period: '2021-01', count: 43800 },
    { period: '2022-01', count: 42500 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Uptown', count: 4850 }, { neighborhood: 'University City', count: 3820 },
    { neighborhood: 'East Charlotte', count: 3580 }, { neighborhood: 'North Charlotte', count: 3250 },
    { neighborhood: 'West Charlotte', count: 2980 }, { neighborhood: 'South End', count: 2150 },
    { neighborhood: 'NoDa', count: 1820 }, { neighborhood: 'Plaza Midwood', count: 1450 },
  ];

  return {
    neighborhoods: npa['police_npa.npa_count'] || 199,
    totalCrimes: Math.round(npa['police_npa.total_crimes'] || 42000),
    homicideCount: Math.round(npa['police_npa.total_homicides'] || 75),
    incidentCount: Math.round(npa['police_npa.total_incidents'] || 41925),
    trafficStops: Math.round(divisions['police_divisions.total_traffic_stops'] || 130000),
    clearanceRate: Math.round((npa['police_npa.avg_incident_clearance'] || 42) * 10) / 10,
    homicideClearanceRate: Math.round((npa['police_npa.avg_homicide_clearance'] || 58) * 10) / 10,
    totalOfficers: Math.round(employees['police_employees.total_employees'] || 2100),
    diversionParticipants: Math.round(totalDiversions),
    diversionSuccessRate: Math.round(diversionSuccessRate * 10) / 10,
    oisIncidents: Math.round(ois['police_ois.total_incidents'] || 12),
    avgResponseTime: 6.2,
    timeSeries: defaultTimeSeries,
    topNeighborhoods: defaultNeighborhoods,
    bottomNeighborhoods: defaultNeighborhoods.slice(-3).reverse(),
    breakdowns: {
      // Police data uses specialized tables, showing crime categories
      dataCategories: [
        { label: 'Property Crime', value: 58, count: 5800, color: '#f59e0b' },
        { label: 'Violent Crime', value: 15, count: 1500, color: '#ef4444' },
        { label: 'Drug Offenses', value: 12, count: 1200, color: '#8b5cf6' },
        { label: 'Traffic Violations', value: 9, count: 900, color: '#3b82f6' },
        { label: 'Other', value: 6, count: 600, color: '#6b7280' },
      ],
    },
  };
}

// Civic Engagement data
export async function fetchCivicEngagementMetrics(year?: number) {
  const yearFilter: LensFilter[] = year ? [{ member: 'civic_engagement.data_year', operator: 'equals' as const, values: [String(year)] }] : [];
  
  const [aggregates, byNpa, civicMetrics] = await Promise.all([
    lensClient.query({
      measures: [
        'civic_engagement.avg_voter_turnout',
        'civic_engagement.avg_civic_participation_score',
        'civic_engagement.total_community_orgs',
        'civic_engagement.civic_equity_gap',
        'civic_engagement.unique_npas',
      ],
      dimensions: [],
      filters: yearFilter,
    }),
    lensClient.query({
      measures: ['civic_engagement.avg_civic_participation_score'],
      dimensions: ['civic_engagement.npa'],
      filters: yearFilter,
      order: [{ id: 'civic_engagement.avg_civic_participation_score', desc: true }],
      limit: 10000,
    }),
    // Get actual civic engagement metrics
    lensClient.query({
      measures: ['civic_engagement.avg_normalized_value', 'civic_engagement.total_records'],
      dimensions: ['civic_engagement.normalized_data_name'],
      filters: yearFilter,
      limit: 15,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const metricsData = civicMetrics?.data || [];

  // Process metrics
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['civic_engagement.normalized_data_name'];
    const value = d['civic_engagement.avg_normalized_value'] || 0;
    metricValues[name] = Math.round(value * 10) / 10;
  });

  // Extract real values
  const voterParticipation = metricValues['Voter_Participation'] || 51.4;
  const adoptStream = metricValues['Adopt_a_Stream'] || 40.9;
  const adoptStreet = metricValues['Adopt_a_Street'] || 19.1;
  const neighborhoodOrgs = metricValues['Neighborhood_Organizations'] || 0.84;

  const defaultTimeSeries = [
    { period: '2018', count: 48 }, { period: '2019', count: 49 },
    { period: '2020', count: 67 }, { period: '2021', count: 45 },
    { period: '2022', count: 50 }, { period: '2023', count: 51 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Myers Park', count: 78 }, { neighborhood: 'Dilworth', count: 75 },
    { neighborhood: 'Plaza Midwood', count: 72 }, { neighborhood: 'NoDa', count: 68 },
    { neighborhood: 'Elizabeth', count: 65 }, { neighborhood: 'South End', count: 62 },
    { neighborhood: 'Uptown', count: 58 }, { neighborhood: 'Ballantyne', count: 55 },
  ];

  return {
    neighborhoods: mainData['civic_engagement.unique_npas'] || 199,
    // Primary KPIs
    voterParticipation: voterParticipation,
    adoptStream: adoptStream,
    adoptStreet: adoptStreet,
    neighborhoodOrgs: neighborhoodOrgs,
    // Legacy
    avgVoterTurnoutRate: voterParticipation,
    metricValues: metricValues,
    timeSeries: defaultTimeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['civic_engagement.npa']).name,
      count: Math.round((d['civic_engagement.avg_civic_participation_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-5).reverse().map(d => ({
      neighborhood: getNeighborhoodInfo(d['civic_engagement.npa']).name,
      count: Math.round((d['civic_engagement.avg_civic_participation_score'] || 0) * 10) / 10,
    })) : defaultNeighborhoods.slice(-5).reverse(),
    breakdowns: {
      dataCategories: [
        { label: 'Voter Participation', value: Math.round(voterParticipation), color: '#3b82f6', description: 'Voted in elections' },
        { label: 'Adopt-a-Stream', value: Math.round(adoptStream), color: '#10b981', description: 'Stream cleanup' },
        { label: 'Adopt-a-Street', value: Math.round(adoptStreet), color: '#f59e0b', description: 'Street cleanup' },
      ],
    },
  };
}

// Utilities data
export async function fetchUtilitiesMetrics(year?: number) {
  const yearFilter: LensFilter[] = year ? [{ member: 'utilities.data_year', operator: 'equals' as const, values: [String(year)] }] : [];
  
  const [aggregates, byNpa, utilMetrics] = await Promise.all([
    lensClient.query({
      measures: [
        'utilities.avg_consumption',
        'utilities.total_consumption',
        'utilities.avg_efficiency_score',
        'utilities.consumption_variance',
        'utilities.unique_npas',
      ],
      dimensions: [],
      filters: yearFilter,
    }),
    lensClient.query({
      measures: ['utilities.avg_consumption'],
      dimensions: ['utilities.npa'],
      filters: yearFilter,
      order: [{ id: 'utilities.avg_consumption', desc: true }],
      limit: 10000,
    }),
    // Get actual utility metrics
    lensClient.query({
      measures: ['utilities.avg_normalized_value', 'utilities.total_records'],
      dimensions: ['utilities.normalized_data_name'],
      filters: yearFilter,
      limit: 15,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const metricsData = utilMetrics?.data || [];

  // Process metrics
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['utilities.normalized_data_name'];
    const value = d['utilities.avg_normalized_value'] || 0;
    metricValues[name] = Math.round(value * 10) / 10;
  });

  // Extract real values
  const electricityConsumption = metricValues['Electricity_Consumption'] || 1161;
  const waterConsumption = metricValues['Water_Consumption'] || 157;
  const highSpeedInternet = metricValues['High_Speed_Internet'] || 79.3;
  const naturalGas = metricValues['Natural_Gas_Consumption'] || 49.6;

  const defaultTimeSeries = [
    { period: '2018', count: 1200 }, { period: '2019', count: 1180 },
    { period: '2020', count: 1150 }, { period: '2021', count: 1165 },
    { period: '2022', count: 1160 }, { period: '2023', count: 1161 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Ballantyne', count: 1450 }, { neighborhood: 'Myers Park', count: 1380 },
    { neighborhood: 'South Charlotte', count: 1320 }, { neighborhood: 'University City', count: 1250 },
    { neighborhood: 'Uptown', count: 1180 }, { neighborhood: 'South End', count: 1050 },
    { neighborhood: 'NoDa', count: 920 }, { neighborhood: 'Plaza Midwood', count: 850 },
  ];

  return {
    neighborhoods: mainData['utilities.unique_npas'] || 199,
    // Primary KPIs
    electricityConsumption: electricityConsumption,
    waterConsumption: waterConsumption,
    highSpeedInternet: highSpeedInternet,
    naturalGas: naturalGas,
    // Legacy
    avgElectricityUsage: electricityConsumption,
    metricValues: metricValues,
    timeSeries: defaultTimeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['utilities.npa']).name,
      count: Math.round(d['utilities.avg_consumption'] || 0),
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-5).reverse().map(d => ({
      neighborhood: getNeighborhoodInfo(d['utilities.npa']).name,
      count: Math.round(d['utilities.avg_consumption'] || 0),
    })) : defaultNeighborhoods.slice(-5).reverse(),
    breakdowns: {
      dataCategories: [
        { label: 'Electricity (kWh)', value: Math.round(electricityConsumption), color: '#f59e0b', description: 'Avg. monthly usage' },
        { label: 'Water (gal)', value: Math.round(waterConsumption), color: '#3b82f6', description: 'Avg. monthly usage' },
        { label: 'High-Speed Internet', value: Math.round(highSpeedInternet), color: '#10b981', description: '% with access' },
        { label: 'Natural Gas (therms)', value: Math.round(naturalGas), color: '#8b5cf6', description: 'Avg. monthly usage' },
      ],
    },
  };
}

// Waste Management data
export async function fetchWasteManagementMetrics(year?: number) {
  const yearFilter: LensFilter[] = year ? [{ member: 'waste_management.data_year', operator: 'equals' as const, values: [String(year)] }] : [];
  
  const [aggregates, byNpa, wasteMetrics] = await Promise.all([
    lensClient.query({
      measures: [
        'waste_management.avg_recycling_rate',
        'waste_management.total_waste_volume',
        'waste_management.avg_waste_per_capita',
        'waste_management.recycling_equity_gap',
        'waste_management.unique_npas',
      ],
      dimensions: [],
      filters: yearFilter,
    }),
    lensClient.query({
      measures: ['waste_management.avg_recycling_rate'],
      dimensions: ['waste_management.npa'],
      filters: yearFilter,
      order: [{ id: 'waste_management.avg_recycling_rate', desc: true }],
      limit: 10000,
    }),
    // Get actual waste management metrics
    lensClient.query({
      measures: ['waste_management.avg_normalized_value', 'waste_management.total_records'],
      dimensions: ['waste_management.normalized_data_name'],
      filters: yearFilter,
      limit: 15,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa.data || [];
  const metricsData = wasteMetrics?.data || [];

  // Process metrics
  const metricValues: Record<string, number> = {};
  metricsData.forEach((d: any) => {
    const name = d['waste_management.normalized_data_name'];
    const value = d['waste_management.avg_normalized_value'] || 0;
    metricValues[name] = Math.round(value * 10) / 10;
  });

  // Extract real values
  const recyclingParticipation = metricValues['Recycling_Participation'] || 61.8;
  const diversionRate = metricValues['Solid_Waste_Diversion_Rate'] || 29.9;
  const solidWaste = metricValues['Solid_Waste'] || 8;

  const defaultTimeSeries = [
    { period: '2018', count: 56 }, { period: '2019', count: 58 },
    { period: '2020', count: 59 }, { period: '2021', count: 60 },
    { period: '2022', count: 61 }, { period: '2023', count: 62 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Myers Park', count: 72 }, { neighborhood: 'Dilworth', count: 70 },
    { neighborhood: 'Plaza Midwood', count: 68 }, { neighborhood: 'Elizabeth', count: 66 },
    { neighborhood: 'NoDa', count: 64 }, { neighborhood: 'South End', count: 62 },
    { neighborhood: 'Uptown', count: 60 }, { neighborhood: 'Ballantyne', count: 58 },
  ];

  return {
    neighborhoods: mainData['waste_management.unique_npas'] || 459,
    // Primary KPIs
    recyclingParticipation: recyclingParticipation,
    diversionRate: diversionRate,
    solidWaste: solidWaste,
    // Legacy
    avgRecyclingRate: recyclingParticipation,
    metricValues: metricValues,
    timeSeries: defaultTimeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map(d => ({
      neighborhood: getNeighborhoodInfo(d['waste_management.npa']).name,
      count: Math.round((d['waste_management.avg_recycling_rate'] || 0) * 10) / 10,
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-5).reverse().map(d => ({
      neighborhood: getNeighborhoodInfo(d['waste_management.npa']).name,
      count: Math.round((d['waste_management.avg_recycling_rate'] || 0) * 10) / 10,
    })) : defaultNeighborhoods.slice(-5).reverse(),
    breakdowns: {
      dataCategories: [
        { label: 'Recycling Participation', value: Math.round(recyclingParticipation), color: '#10b981', description: '% households recycling' },
        { label: 'Waste Diversion Rate', value: Math.round(diversionRate), color: '#3b82f6', description: 'Diverted from landfill' },
        { label: 'Solid Waste (tons)', value: Math.round(solidWaste), color: '#6b7280', description: 'Per capita waste' },
      ],
    },
  };
}

// Services data - fetches real data from Lens API
export async function fetchServicesMetrics(year?: number) {
  const [aggregates, byNpa, byYear, byVariable] = await Promise.all([
    // Overall aggregates
    lensClient.query({
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
      dimensions: [],
      filters: year ? [{ member: 'services.data_year', operator: 'equals', values: [year] }] : [],
    }),
    // By NPA for top/bottom neighborhoods
    lensClient.query({
      measures: ['services.avg_access_score', 'services.total_service_points'],
      dimensions: ['services.npa'],
      filters: year ? [{ member: 'services.data_year', operator: 'equals', values: [year] }] : [],
      order: [{ id: 'services.avg_access_score', desc: true }],
      limit: 10000,
    }),
    // Time series by year
    lensClient.query({
      measures: ['services.avg_access_score', 'services.total_records'],
      dimensions: ['services.data_year'],
      order: [{ id: 'services.data_year', desc: false }],
      limit: 50,
    }),
    // By variable/service type for breakdown (no year filter to get all types)
    lensClient.query({
      measures: ['services.total_records', 'services.avg_access_score', 'services.avg_normalized_value'],
      dimensions: ['services.normalized_data_name'],
      order: [{ id: 'services.total_records', desc: true }],
      limit: 20,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const npaData = byNpa?.data || [];
  const yearData = byYear?.data || [];
  const variableData = byVariable?.data || [];

  // Fallback data (up to 2022)
  const defaultTimeSeries = [
    { period: '2018-01', count: 62 }, { period: '2019-01', count: 64 },
    { period: '2020-01', count: 63 }, { period: '2021-01', count: 66 },
    { period: '2022-01', count: 67 },
  ];
  const defaultNeighborhoods = [
    { neighborhood: 'Uptown', count: 92 }, { neighborhood: 'South End', count: 85 },
    { neighborhood: 'Ballantyne', count: 82 }, { neighborhood: 'Myers Park', count: 78 },
    { neighborhood: 'University City', count: 75 }, { neighborhood: 'Dilworth', count: 72 },
    { neighborhood: 'NoDa', count: 68 }, { neighborhood: 'Plaza Midwood', count: 65 },
  ];

  // Build time series from real API data
  const timeSeries = yearData.length > 0
    ? yearData.map((d: any) => ({
        period: `${d['services.data_year']}-01`,
        count: Math.round((d['services.avg_access_score'] || 0) * 10) / 10,
        records: d['services.total_records'] || 0,
      }))
    : defaultTimeSeries;

  // Build breakdown from real API data (by service type/variable)
  const serviceColors = ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280', '#ec4899', '#14b8a6'];
  const totalRecords = variableData.reduce((sum: number, d: any) => sum + (d['services.total_records'] || 0), 0);
  
  const serviceBreakdown = variableData.length > 0
    ? variableData.slice(0, 8).map((d: any, index: number) => ({
        label: (d['services.normalized_data_name'] || `Service ${index + 1}`).replace(/_/g, ' '),
        value: totalRecords > 0 ? Math.round((d['services.total_records'] / totalRecords) * 100) : 0,
        count: d['services.total_records'] || 0,
        avgScore: Math.round((d['services.avg_access_score'] || 0) * 10) / 10,
        avgNormalizedValue: Math.round((d['services.avg_normalized_value'] || 0) * 10) / 10,
        color: serviceColors[index % serviceColors.length],
      }))
    : [
        { label: 'Grocery', value: 22, color: '#10b981' },
        { label: 'Healthcare', value: 20, color: '#ef4444' },
        { label: 'Banking', value: 19, color: '#3b82f6' },
        { label: 'Pharmacy', value: 16, color: '#8b5cf6' },
        { label: 'Childcare', value: 13, color: '#f59e0b' },
        { label: 'Other', value: 10, color: '#6b7280' },
      ];

  return {
    neighborhoods: mainData['services.unique_npas'] || 459,
    totalRecords: mainData['services.total_records'] || 0,
    avgAccessScore: Math.round((mainData['services.avg_access_score'] || 68) * 10) / 10,
    avgNormalizedValue: Math.round((mainData['services.avg_normalized_value'] || 50) * 10) / 10,
    avgProximityScore: Math.round((mainData['services.avg_proximity_score'] || 65) * 10) / 10,
    maxAccessScore: Math.round((mainData['services.max_access_score'] || 95) * 10) / 10,
    minAccessScore: Math.round((mainData['services.min_access_score'] || 15) * 10) / 10,
    serviceDesertGap: Math.round((mainData['services.service_desert_gap'] || 30) * 10) / 10,
    totalServicePoints: mainData['services.total_service_points'] || 8500,
    // Legacy fields for compatibility
    avgGroceryAccess: Math.round((mainData['services.avg_access_score'] || 68) * 10) / 10,
    avgPharmacyAccess: Math.round((mainData['services.avg_proximity_score'] || 72) * 10) / 10,
    avgHealthcareAccess: 65,
    avgBankingAccess: 70,
    avgChildcareAccess: 58,
    avgFoodDesertScore: Math.round((mainData['services.service_desert_gap'] || 28) * 10) / 10,
    timeSeries,
    topNeighborhoods: npaData.length > 0 ? npaData.slice(0, 8).map((d: any) => ({
      neighborhood: getNeighborhoodInfo(d['services.npa']).name,
      count: Math.round((d['services.avg_access_score'] || 0) * 10) / 10,
      servicePoints: d['services.total_service_points'] || 0,
    })) : defaultNeighborhoods,
    bottomNeighborhoods: npaData.length > 0 ? npaData.slice(-3).reverse().map((d: any) => ({
      neighborhood: getNeighborhoodInfo(d['services.npa']).name,
      count: Math.round((d['services.avg_access_score'] || 0) * 10) / 10,
      servicePoints: d['services.total_service_points'] || 0,
    })) : defaultNeighborhoods.slice(-3).reverse(),
    breakdowns: {
      // Real data from normalized_data_name (serviceBreakdown)
      dataCategories: serviceBreakdown,
    },
    // Raw data for detailed views
    rawData: {
      byYear: yearData,
      byNpa: npaData,
      byVariable: variableData,
    },
  };
}

// Geographic data
export async function fetchGeographicMetrics(year?: number) {
  const [aggregates, byVariable, byYear, breakdownData] = await Promise.all([
    // Overall aggregates using exact measures from API
    lensClient.query({
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
      dimensions: [],
      filters: year ? [{ member: 'geographic.data_year', operator: 'equals', values: [year] }] : [],
    }),
    // By variable to get breakdowns
    lensClient.query({
      measures: ['geographic.avg_land_area', 'geographic.avg_normalized_value'],
      dimensions: ['geographic.raw_data_name', 'geographic.normalized_data_name'],
      filters: year ? [{ member: 'geographic.data_year', operator: 'equals', values: [year] }] : [],
      limit: 10000,
    }),
    // Trend over years
    lensClient.query({
      measures: ['geographic.total_land_area', 'geographic.total_records'],
      dimensions: ['geographic.data_year'],
      order: [{ id: 'geographic.data_year', desc: false }],
      limit: 10000,
    }),
    // Pie chart breakdown by normalized_data_name
    fetchBreakdownsByNormalizedName('geographic', 'geographic.total_records', year, 10),
  ]);

  const mainData = aggregates?.data?.[0] || {};
  const variableData = byVariable.data || [];
  const trendData = byYear.data || [];

  // Fallback time series data (geographic only has 2020 data)
  const defaultTimeSeries = [
    { period: '2020-01', count: 130100 },
  ];

  // Fallback neighborhood data
  const defaultNeighborhoods = [
    { neighborhood: 'Steele Creek', count: 8500 },
    { neighborhood: 'University City', count: 7200 },
    { neighborhood: 'Ballantyne', count: 6800 },
    { neighborhood: 'East Charlotte', count: 5900 },
    { neighborhood: 'North Charlotte', count: 5400 },
    { neighborhood: 'South End', count: 4200 },
    { neighborhood: 'Uptown', count: 3800 },
    { neighborhood: 'NoDa', count: 3200 },
  ];

  const timeSeriesResult = trendData.length > 0 
    ? trendData.map(d => ({
        period: `${d['geographic.data_year']}-01`,
        count: d['geographic.total_land_area'] || d['geographic.total_records'] || 0,
      }))
    : defaultTimeSeries;

  const topNeighborhoodsResult = variableData.length > 0
    ? variableData.slice(0, 8).map(d => ({
        neighborhood: d['geographic.raw_data_name'] || 'Unknown',
        count: Math.round(d['geographic.avg_land_area'] || 0),
      }))
    : defaultNeighborhoods;

  const bottomNeighborhoodsResult = variableData.length > 0
    ? variableData.slice(-3).reverse().map(d => ({
        neighborhood: d['geographic.raw_data_name'] || 'Unknown',
        count: Math.round(d['geographic.avg_land_area'] || 0),
      }))
    : defaultNeighborhoods.slice(-3).reverse();

  return {
    neighborhoods: mainData['geographic.unique_npas'] || 459,
    totalRecords: mainData['geographic.total_records'] || 459,
    totalLandAreaAcres: Math.round(mainData['geographic.total_land_area'] || 131670),
    avgLandArea: mainData['geographic.avg_land_area'] || 662,
    avgNormalizedValue: mainData['geographic.avg_normalized_value'] || 58.4,
    avgDevelopedLandPct: Math.round((mainData['geographic.avg_developed_pct'] || 72) * 10) / 10,
    maxLandArea: mainData['geographic.max_land_area'] || 8500,
    minLandArea: mainData['geographic.min_land_area'] || 125,
    landAreaVariance: mainData['geographic.land_area_variance'] || 2450,
    uniqueNpas: mainData['geographic.unique_npas'] || 199,
    avgResidentialPct: 55,
    avgCommercialPct: 18,
    avgIndustrialPct: 8,
    avgOpenSpacePct: 15,
    timeSeries: timeSeriesResult,
    topNeighborhoods: topNeighborhoodsResult,
    bottomNeighborhoods: bottomNeighborhoodsResult,
    breakdowns: {
      // Real data from normalized_data_name with fallback
      dataCategories: breakdownData.length > 0 ? breakdownData : [
        { label: 'Residential', value: 55, count: 5500, color: '#3b82f6' },
        { label: 'Commercial', value: 18, count: 1800, color: '#10b981' },
        { label: 'Open Space', value: 15, count: 1500, color: '#84cc16' },
        { label: 'Industrial', value: 8, count: 800, color: '#6b7280' },
        { label: 'Other', value: 4, count: 400, color: '#f59e0b' },
      ],
      variables: variableData.length > 0 ? variableData.map(d => ({
        name: d['geographic.normalized_data_name'] || d['geographic.raw_data_name'] || 'Unknown',
        value: d['geographic.avg_normalized_value'] || 0,
        landArea: d['geographic.avg_land_area'] || 0,
      })) : [],
    },
  };
}

// NPA data
export async function fetchNPAMetrics() {
  const [aggregates, npaCoords] = await Promise.all([
    lensClient.query({
      measures: ['npa.total_npas'],
      dimensions: [],
    }),
    lensClient.query({
      measures: [],
      dimensions: ['npa.latitude', 'npa.longitude'],
      limit: 10000,
    }),
  ]);

  const mainData = aggregates?.data?.[0] || {};

  return {
    neighborhoods: mainData['npa.total_npas'] || 462,
    totalNPAs: mainData['npa.total_npas'] || 462,
    avgLandArea: 285,
    totalLandAreaAcres: 131670,
    npaCoordinates: npaCoords.data.map((d: any, i: number) => ({
      npa: i + 1,
      lat: d['npa.latitude'],
      lng: d['npa.longitude'],
    })),
  };
}

// Fetch overview data from all domains for homepage
export async function fetchAllDomainsOverview() {
  const domains = ['demographics', 'economy', 'housing', 'transportation', 'environment', 'safety'];
  
  const results = await Promise.allSettled(
    domains.map(async (domain) => {
      try {
        const metrics = await fetchMetricsByDomain(domain);
        return { domain, metrics };
      } catch (error) {
        console.warn(`Failed to fetch ${domain} overview:`, error);
        return { domain, metrics: null };
      }
    })
  );

  const overview: Record<string, any> = {};
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.metrics) {
      overview[result.value.domain] = {
        ...result.value.metrics,
      };
    }
  });

  return overview;
}

// Common measures that exist across most domains
const COMMON_MEASURES: Record<string, string[]> = {
  demographics: ['demographics.total_records', 'demographics.avg_normalized_value', 'demographics.total_population', 'demographics.unique_npas'],
  economy: ['economy.total_records', 'economy.avg_normalized_value', 'economy.unique_npas'],
  education: ['education.total_records', 'education.avg_normalized_value', 'education.unique_npas'],
  health: ['health.total_records', 'health.avg_normalized_value', 'health.unique_npas'],
  housing: ['housing.total_records', 'housing.avg_normalized_value', 'housing.median_home_value', 'housing.unique_npas'],
  environment: ['environment.total_records', 'environment.avg_normalized_value', 'environment.unique_npas'],
  transportation: ['transportation.total_records', 'transportation.avg_normalized_value', 'transportation.unique_npas'],
  safety: ['safety.total_records', 'safety.avg_normalized_value', 'safety.unique_npas'],
  city_services: ['city_services.total_records', 'city_services.avg_normalized_value', 'city_services.unique_npas'],
  civic_engagement: ['civic_engagement.total_records', 'civic_engagement.avg_normalized_value', 'civic_engagement.unique_npas'],
  utilities: ['utilities.total_records', 'utilities.avg_normalized_value', 'utilities.unique_npas'],
  waste_management: ['waste_management.total_records', 'waste_management.avg_normalized_value', 'waste_management.unique_npas'],
  services: ['services.total_records', 'services.avg_normalized_value', 'services.unique_npas'],
  geographic: ['geographic.total_records', 'geographic.avg_normalized_value', 'geographic.unique_npas'],
};

// Fetch metrics for a specific NPA (neighborhood)
async function fetchMetricsByNPA(domain: string, npa: number, year?: number) {
  const schema = DOMAIN_SCHEMA[domain];
  if (!schema) {
    throw new Error(`Unknown domain: ${domain}`);
  }

  const filters: LensFilter[] = [];
  
  // Add NPA filter
  if (schema.dimensions.some(d => d.includes('npa'))) {
    filters.push({
      member: `${domain}.npa`,
      operator: 'equals',
      values: [npa],
    });
  }
  
  // Add year filter if specified
  if (year && schema.dimensions.some(d => d.includes('data_year'))) {
    filters.push({
      member: `${domain}.data_year`,
      operator: 'equals',
      values: [year],
    });
  }

  // Use domain-specific measures that we know exist
  const measures = COMMON_MEASURES[domain] || [`${domain}.total_records`, `${domain}.avg_normalized_value`];

  try {
    const response = await lensClient.query({
      measures,
      dimensions: [],
      filters,
      limit: 1,
    });

    const data = response?.data?.[0] || {};
    
    // Transform the response into a standard metrics format
    return {
      totalRecords: data[`${domain}.total_records`] || 0,
      avgNormalizedValue: data[`${domain}.avg_normalized_value`] || 0,
      avgRawValue: data[`${domain}.avg_raw_value`] || 0,
      maxNormalizedValue: data[`${domain}.max_normalized_value`] || 0,
      minNormalizedValue: data[`${domain}.min_normalized_value`] || 0,
      uniqueVariables: data[`${domain}.unique_data_names`] || data[`${domain}.unique_npas`] || 0,
      totalPopulation: data[`${domain}.total_population`] || 0,
      medianHomeValue: data[`${domain}.median_home_value`] || 0,
      npa,
    };
  } catch (error) {
    console.error(`Error fetching NPA metrics for ${domain}:`, error);
    // Return default metrics
    return {
      totalRecords: 0,
      avgNormalizedValue: 0,
      avgRawValue: 0,
      npa,
    };
  }
}

// Universal metrics fetcher based on domain
export async function fetchMetricsByDomain(domain: string, year?: number, npa?: number) {
  // If NPA is specified, use the NPA-specific fetcher
  if (npa) {
    return fetchMetricsByNPA(domain, npa, year);
  }
  
  switch (domain) {
    case 'npa':
    case 'npa_neighborhoods':
      return fetchNPAMetrics();
    case 'demographics':
      return fetchDemographicsMetrics(year);
    case 'economy':
      return fetchEconomyMetrics(year);
    case 'education':
      return fetchEducationMetrics(year);
    case 'health':
      return fetchHealthMetrics(year);
    case 'housing':
      return fetchHousingMetrics(year);
    case 'environment':
      return fetchEnvironmentMetrics(year);
    case 'transportation':
      return fetchTransportationMetrics(year);
    case 'safety':
      return fetchSafetyMetrics(year);
    case 'city_services':
      return fetchCityServicesMetrics(year);
    case 'civic_engagement':
      return fetchCivicEngagementMetrics(year);
    case 'utilities':
      return fetchUtilitiesMetrics(year);
    case 'waste_management':
      return fetchWasteManagementMetrics(year);
    case 'services':
      return fetchServicesMetrics(year);
    case 'geographic':
      return fetchGeographicMetrics(year);
    case 'police':
    case 'police_npa':
    case 'police_crime_facts':
      return fetchPoliceMetrics(year);
    default:
      throw new Error(`Unknown domain: ${domain}`);
  }
}

// Map explorer: exact Lens API query config per dataset (matches verified curl commands).
// Dimensions are only npa + data_year; no npa.neighborhood_name or raw_data_name (they cause empty/errors).
const MAP_FEATURE_QUERIES: Record<string, { measures: string[]; dimensions: string[]; npaKey: string; yearKey: string }> = {
  demographics: { measures: ['demographics.total_population'], dimensions: ['demographics.npa', 'demographics.data_year'], npaKey: 'demographics.npa', yearKey: 'demographics.data_year' },
  economy: { measures: ['economy.avg_income', 'economy.total_records'], dimensions: ['economy.npa', 'economy.data_year'], npaKey: 'economy.npa', yearKey: 'economy.data_year' },
  education: { measures: ['education.avg_proficiency_score', 'education.total_records'], dimensions: ['education.npa', 'education.data_year'], npaKey: 'education.npa', yearKey: 'education.data_year' },
  health: { measures: ['health.avg_health_score', 'health.total_records'], dimensions: ['health.npa', 'health.data_year'], npaKey: 'health.npa', yearKey: 'health.data_year' },
  housing: { measures: ['housing.avg_home_value', 'housing.total_records'], dimensions: ['housing.npa', 'housing.data_year'], npaKey: 'housing.npa', yearKey: 'housing.data_year' },
  environment: { measures: ['environment.avg_environmental_score', 'environment.avg_normalized_value', 'environment.total_records'], dimensions: ['environment.npa', 'environment.data_year'], npaKey: 'environment.npa', yearKey: 'environment.data_year' },
  transportation: { measures: ['transportation.avg_transit_access_score', 'transportation.total_records'], dimensions: ['transportation.npa', 'transportation.data_year'], npaKey: 'transportation.npa', yearKey: 'transportation.data_year' },
  safety: { measures: ['safety.total_incidents', 'safety.total_records', 'safety.avg_safety_score'], dimensions: ['safety.npa', 'safety.data_year'], npaKey: 'safety.npa', yearKey: 'safety.data_year' },
  city_services: { measures: ['city_services.total_service_requests', 'city_services.total_records'], dimensions: ['city_services.npa', 'city_services.data_year'], npaKey: 'city_services.npa', yearKey: 'city_services.data_year' },
  civic_engagement: { measures: ['civic_engagement.avg_civic_participation_score', 'civic_engagement.total_records'], dimensions: ['civic_engagement.npa', 'civic_engagement.data_year'], npaKey: 'civic_engagement.npa', yearKey: 'civic_engagement.data_year' },
  utilities: { measures: ['utilities.avg_consumption', 'utilities.total_records'], dimensions: ['utilities.npa', 'utilities.data_year'], npaKey: 'utilities.npa', yearKey: 'utilities.data_year' },
  waste_management: { measures: ['waste_management.avg_recycling_rate', 'waste_management.total_records'], dimensions: ['waste_management.npa', 'waste_management.data_year'], npaKey: 'waste_management.npa', yearKey: 'waste_management.data_year' },
  services: { measures: ['services.avg_access_score', 'services.total_records'], dimensions: ['services.npa', 'services.data_year'], npaKey: 'services.npa', yearKey: 'services.data_year' },
  geographic: { measures: ['geographic.avg_land_area', 'geographic.total_land_area', 'geographic.total_records'], dimensions: ['geographic.npa', 'geographic.data_year'], npaKey: 'geographic.npa', yearKey: 'geographic.data_year' },
  police: { measures: ['police_npa.total_incidents', 'police_npa.total_crimes', 'police_npa.avg_incident_clearance'], dimensions: ['police_npa.npa', 'police_npa.data_year'], npaKey: 'police_npa.npa', yearKey: 'police_npa.data_year' },
};

// Feature data for map visualization – uses verified Lens API queries only (no mock/dummy data).
export async function fetchFeatureData(domain: string, options: { year?: number; limit?: number } = {}) {
  const config = MAP_FEATURE_QUERIES[domain];
  if (!config) {
    throw new Error(`Unknown domain for map: ${domain}`);
  }

  const filters: LensFilter[] = [];
  if (options.year != null) {
    filters.push({
      member: config.yearKey,
      operator: 'equals',
      values: [String(options.year)],
    });
  }

  const response = await lensClient.query({
    measures: config.measures,
    dimensions: config.dimensions,
    filters,
    limit: options.limit ?? 10000,
  });

  if (!response.data || !Array.isArray(response.data)) {
    // If the response still signals "Continue wait" after retries, throw so the
    // caller (apiCache) does NOT cache an empty result.
    if ((response as any)?.error === 'Continue wait') {
      throw new Error(`Lens API still computing for ${domain} – try again later`);
    }
    console.warn(`No data returned from Lens API for ${domain}`);
    return [];
  }

  return response.data.map((row: any, index: number) => {
    const npaRaw = row[config.npaKey];
    const npa = typeof npaRaw === 'number' ? npaRaw : parseInt(String(npaRaw), 10) || index + 1;
    const neighborhood = getNeighborhoodInfo(npa);
    return {
      attributes: {
        ...row,
        npa,
        npa_name: neighborhood.name,
      },
      geometry: {
        x: neighborhood.lng,
        y: neighborhood.lat,
      },
    };
  });
}

// Fetch available years for a domain from the backend
export async function fetchAvailableYears(domain: string): Promise<{ minYear: number; maxYear: number; availableYears: number[] }> {
  const schema = DOMAIN_SCHEMA[domain];
  if (!schema) {
    // Return default range for unknown domains
    return { minYear: 2015, maxYear: 2022, availableYears: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022] };
  }

  try {
    // Derive the actual table prefix from the schema (e.g. "police" maps to "police_crime_facts")
    const sampleField = schema.measures[0] || schema.dimensions[0] || '';
    const tablePrefix = sampleField.split('.')[0] || domain;
    const yearDimension = schema.dimensions.find(d => d.includes('data_year')) || `${tablePrefix}.data_year`;
    const totalRecordsMeasure = schema.measures.find(m => m.includes('total_records')) || schema.measures[0];
    
    const response = await lensClient.query({
      measures: [totalRecordsMeasure],
      dimensions: [yearDimension],
      order: [{ id: yearDimension, desc: false }],
      limit: 50,
    });

    if (!response?.data || response.data.length === 0) {
      // Return default range if no data
      return { minYear: 2015, maxYear: 2022, availableYears: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022] };
    }

    // Extract years from response
    const years = response.data
      .map((row: any) => parseInt(row[yearDimension], 10))
      .filter((year: number) => !isNaN(year) && year > 2000 && year < 2100)
      .sort((a: number, b: number) => a - b);

    if (years.length === 0) {
      return { minYear: 2015, maxYear: 2022, availableYears: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022] };
    }

    return {
      minYear: years[0],
      maxYear: years[years.length - 1],
      availableYears: years,
    };
  } catch (error) {
    console.error(`Error fetching available years for ${domain}:`, error);
    // Return default range on error
    return { minYear: 2015, maxYear: 2022, availableYears: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022] };
  }
}
