// Mock data for Charlotte, NC area (coordinates around 35.2271, -80.8431)
// Based on Neighborhood Profile Areas (NPA) from city-portal-360 semantic model

// Charlotte NPA neighborhoods for realistic mock data
const CHARLOTTE_NEIGHBORHOODS = [
  { name: 'Uptown', npa: 1, lat: 35.2271, lng: -80.8431 },
  { name: 'South End', npa: 2, lat: 35.2100, lng: -80.8550 },
  { name: 'NoDa', npa: 3, lat: 35.2500, lng: -80.8150 },
  { name: 'Plaza Midwood', npa: 4, lat: 35.2200, lng: -80.8100 },
  { name: 'Dilworth', npa: 5, lat: 35.2050, lng: -80.8500 },
  { name: 'Myers Park', npa: 6, lat: 35.1900, lng: -80.8300 },
  { name: 'Elizabeth', npa: 7, lat: 35.2150, lng: -80.8300 },
  { name: 'West End', npa: 8, lat: 35.2300, lng: -80.8600 },
  { name: 'East Charlotte', npa: 9, lat: 35.2100, lng: -80.7800 },
  { name: 'North Charlotte', npa: 10, lat: 35.2700, lng: -80.8300 },
  { name: 'Ballantyne', npa: 11, lat: 35.0550, lng: -80.8500 },
  { name: 'Steele Creek', npa: 12, lat: 35.1200, lng: -80.9500 },
  { name: 'University City', npa: 13, lat: 35.3100, lng: -80.7500 },
  { name: 'Eastover', npa: 14, lat: 35.1850, lng: -80.8150 },
  { name: 'Wesley Heights', npa: 15, lat: 35.2350, lng: -80.8700 },
  { name: 'Sedgefield', npa: 16, lat: 35.1950, lng: -80.8650 },
  { name: 'Cotswold', npa: 17, lat: 35.1800, lng: -80.8000 },
  { name: 'Montford', npa: 18, lat: 35.1700, lng: -80.8400 },
  { name: 'Cherry', npa: 19, lat: 35.2000, lng: -80.8400 },
  { name: 'Belmont', npa: 20, lat: 35.2400, lng: -80.8250 },
];

export function generateMockData(datasetId: string, count: number = 50) {
  const mockFeatures = [];

  for (let i = 0; i < count; i++) {
    const neighborhood = CHARLOTTE_NEIGHBORHOODS[i % CHARLOTTE_NEIGHBORHOODS.length];
    // Add small random offset to coordinates
    const lat = neighborhood.lat + (Math.random() - 0.5) * 0.02;
    const lng = neighborhood.lng + (Math.random() - 0.5) * 0.02;

    const feature: any = {
      attributes: {},
      geometry: {
        x: lng,
        y: lat,
      },
    };

    // Generate domain-specific attributes based on dataset
    switch (datasetId) {
      case 'npa_neighborhoods':
        feature.attributes = generateNPAAttributes(neighborhood, i);
        break;
      case 'demographics':
        feature.attributes = generateDemographicsAttributes(neighborhood, i);
        break;
      case 'economy':
        feature.attributes = generateEconomyAttributes(neighborhood, i);
        break;
      case 'education':
        feature.attributes = generateEducationAttributes(neighborhood, i);
        break;
      case 'health':
        feature.attributes = generateHealthAttributes(neighborhood, i);
        break;
      case 'housing':
        feature.attributes = generateHousingAttributes(neighborhood, i);
        break;
      case 'environment':
        feature.attributes = generateEnvironmentAttributes(neighborhood, i);
        break;
      case 'transportation':
        feature.attributes = generateTransportationAttributes(neighborhood, i);
        break;
      case 'safety':
        feature.attributes = generateSafetyAttributes(neighborhood, i);
        break;
      case 'city_services':
        feature.attributes = generateCityServicesAttributes(neighborhood, i);
        break;
      case 'civic_engagement':
        feature.attributes = generateCivicEngagementAttributes(neighborhood, i);
        break;
      case 'utilities':
        feature.attributes = generateUtilitiesAttributes(neighborhood, i);
        break;
      case 'waste_management':
        feature.attributes = generateWasteManagementAttributes(neighborhood, i);
        break;
      case 'services':
        feature.attributes = generateServicesAttributes(neighborhood, i);
        break;
      case 'geographic':
        feature.attributes = generateGeographicAttributes(neighborhood, i);
        break;
      case 'police':
        feature.attributes = generatePoliceAttributes(neighborhood, i);
        break;
      default:
        feature.attributes = generateGenericAttributes(neighborhood, i, datasetId);
    }

    mockFeatures.push(feature);
  }

  return mockFeatures;
}

function generateNPAAttributes(neighborhood: any, index: number) {
  return {
    npa_id: neighborhood.npa + index * 20,
    npa_name: neighborhood.name,
    latitude: neighborhood.lat,
    longitude: neighborhood.lng,
    total_population: Math.floor(Math.random() * 15000) + 2000,
    land_area_acres: Math.floor(Math.random() * 500) + 100,
  };
}

function generateDemographicsAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    total_population: Math.floor(Math.random() * 15000) + 2000,
    population_density: Math.floor(Math.random() * 8000) + 1000,
    median_age: Math.floor(Math.random() * 20) + 28,
    diversity_index: (Math.random() * 0.5 + 0.3).toFixed(2),
    youth_population_pct: (Math.random() * 15 + 15).toFixed(1),
    senior_population_pct: (Math.random() * 15 + 8).toFixed(1),
    household_count: Math.floor(Math.random() * 5000) + 800,
    avg_household_size: (Math.random() * 1.5 + 2).toFixed(1),
    raw_data_name: 'Population Demographics',
    normalized_data_name: 'Population Per Square Mile',
    domain_name: 'demographics',
  };
}

function generateEconomyAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    median_household_income: Math.floor(Math.random() * 80000) + 35000,
    unemployment_rate: (Math.random() * 6 + 2).toFixed(1),
    employment_rate: (Math.random() * 10 + 85).toFixed(1),
    business_count: Math.floor(Math.random() * 500) + 50,
    job_density: Math.floor(Math.random() * 3000) + 200,
    poverty_rate: (Math.random() * 20 + 5).toFixed(1),
    commercial_sq_ft: Math.floor(Math.random() * 500000) + 50000,
    raw_data_name: 'Economic Indicators',
    normalized_data_name: 'Income Per Capita',
    domain_name: 'economy',
  };
}

function generateEducationAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    graduation_rate: (Math.random() * 25 + 70).toFixed(1),
    reading_proficiency: (Math.random() * 30 + 55).toFixed(1),
    math_proficiency: (Math.random() * 30 + 50).toFixed(1),
    school_proximity_score: (Math.random() * 40 + 60).toFixed(1),
    college_enrollment_rate: (Math.random() * 35 + 40).toFixed(1),
    bachelors_degree_pct: (Math.random() * 40 + 20).toFixed(1),
    student_count: Math.floor(Math.random() * 3000) + 500,
    schools_count: Math.floor(Math.random() * 8) + 1,
    raw_data_name: 'Education Metrics',
    normalized_data_name: 'Graduation Rate',
    domain_name: 'education',
  };
}

function generateHealthAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    life_expectancy: (Math.random() * 10 + 74).toFixed(1),
    infant_mortality_rate: (Math.random() * 8 + 3).toFixed(1),
    low_birth_weight_pct: (Math.random() * 8 + 5).toFixed(1),
    healthcare_access_score: (Math.random() * 30 + 60).toFixed(1),
    health_insurance_coverage: (Math.random() * 15 + 80).toFixed(1),
    preventable_hospitalization_rate: (Math.random() * 50 + 30).toFixed(1),
    food_access_score: (Math.random() * 40 + 50).toFixed(1),
    raw_data_name: 'Health Metrics',
    normalized_data_name: 'Health Index Score',
    domain_name: 'health',
  };
}

function generateHousingAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    median_home_value: Math.floor(Math.random() * 400000) + 150000,
    median_rent: Math.floor(Math.random() * 1000) + 800,
    homeownership_rate: (Math.random() * 40 + 35).toFixed(1),
    housing_units_count: Math.floor(Math.random() * 5000) + 800,
    vacancy_rate: (Math.random() * 8 + 3).toFixed(1),
    housing_cost_burden_pct: (Math.random() * 25 + 20).toFixed(1),
    new_construction_permits: Math.floor(Math.random() * 100) + 10,
    code_violations_per_1000: (Math.random() * 15 + 5).toFixed(1),
    raw_data_name: 'Housing Metrics',
    normalized_data_name: 'Housing Affordability Index',
    domain_name: 'housing',
  };
}

function generateEnvironmentAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    tree_canopy_coverage: (Math.random() * 35 + 25).toFixed(1),
    impervious_surface_pct: (Math.random() * 40 + 20).toFixed(1),
    park_access_score: (Math.random() * 40 + 50).toFixed(1),
    greenspace_per_capita: (Math.random() * 0.5 + 0.1).toFixed(2),
    air_quality_index: Math.floor(Math.random() * 50) + 30,
    urban_heat_index: (Math.random() * 5 + 1).toFixed(1),
    flood_risk_score: (Math.random() * 50 + 10).toFixed(1),
    raw_data_name: 'Environmental Metrics',
    normalized_data_name: 'Environmental Quality Index',
    domain_name: 'environment',
  };
}

function generateTransportationAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    transit_access_score: (Math.random() * 50 + 30).toFixed(1),
    avg_commute_time: Math.floor(Math.random() * 25) + 15,
    public_transit_usage_pct: (Math.random() * 15 + 3).toFixed(1),
    walkability_score: Math.floor(Math.random() * 50) + 30,
    bike_lane_miles: (Math.random() * 10 + 1).toFixed(1),
    vehicle_ownership_rate: (Math.random() * 20 + 75).toFixed(1),
    traffic_congestion_index: (Math.random() * 40 + 30).toFixed(1),
    sidewalk_coverage_pct: (Math.random() * 40 + 50).toFixed(1),
    raw_data_name: 'Transportation Metrics',
    normalized_data_name: 'Transit Accessibility Score',
    domain_name: 'transportation',
  };
}

function generateSafetyAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    violent_crime_rate: (Math.random() * 15 + 2).toFixed(1),
    property_crime_rate: (Math.random() * 30 + 10).toFixed(1),
    emergency_response_time: (Math.random() * 5 + 4).toFixed(1),
    safety_perception_score: (Math.random() * 30 + 60).toFixed(1),
    streetlight_density: Math.floor(Math.random() * 50) + 20,
    calls_for_service_per_1000: Math.floor(Math.random() * 200) + 50,
    crime_clearance_rate: (Math.random() * 30 + 30).toFixed(1),
    raw_data_name: 'Safety Metrics',
    normalized_data_name: 'Safety Index Score',
    domain_name: 'safety',
  };
}

function generateCityServicesAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    service_requests_per_1000: Math.floor(Math.random() * 150) + 30,
    avg_resolution_time: (Math.random() * 10 + 3).toFixed(1),
    satisfaction_score: (Math.random() * 25 + 65).toFixed(1),
    code_enforcement_cases: Math.floor(Math.random() * 100) + 10,
    permit_applications: Math.floor(Math.random() * 200) + 20,
    zoning_compliance_rate: (Math.random() * 15 + 80).toFixed(1),
    service_equity_index: (Math.random() * 30 + 60).toFixed(1),
    raw_data_name: 'City Services Metrics',
    normalized_data_name: 'Service Quality Index',
    domain_name: 'city_services',
  };
}

function generateCivicEngagementAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    voter_turnout_rate: (Math.random() * 35 + 40).toFixed(1),
    voter_registration_rate: (Math.random() * 20 + 70).toFixed(1),
    community_orgs_count: Math.floor(Math.random() * 20) + 3,
    nonprofit_density: (Math.random() * 5 + 1).toFixed(1),
    volunteer_hours_per_capita: (Math.random() * 30 + 10).toFixed(1),
    public_meeting_attendance: Math.floor(Math.random() * 200) + 20,
    civic_participation_index: (Math.random() * 40 + 40).toFixed(1),
    raw_data_name: 'Civic Engagement Metrics',
    normalized_data_name: 'Civic Participation Index',
    domain_name: 'civic_engagement',
  };
}

function generateUtilitiesAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    water_consumption_per_capita: Math.floor(Math.random() * 50) + 60,
    electricity_usage_kwh: Math.floor(Math.random() * 500) + 800,
    natural_gas_usage: Math.floor(Math.random() * 100) + 50,
    broadband_access_pct: (Math.random() * 15 + 80).toFixed(1),
    renewable_energy_adoption: (Math.random() * 15 + 5).toFixed(1),
    utility_cost_burden: (Math.random() * 5 + 3).toFixed(1),
    energy_efficiency_score: (Math.random() * 30 + 50).toFixed(1),
    raw_data_name: 'Utility Metrics',
    normalized_data_name: 'Utility Efficiency Index',
    domain_name: 'utilities',
  };
}

function generateWasteManagementAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    waste_per_capita_lbs: Math.floor(Math.random() * 500) + 800,
    recycling_rate: (Math.random() * 30 + 20).toFixed(1),
    contamination_rate: (Math.random() * 15 + 10).toFixed(1),
    composting_participation: (Math.random() * 20 + 5).toFixed(1),
    illegal_dumping_incidents: Math.floor(Math.random() * 30) + 5,
    collection_efficiency: (Math.random() * 15 + 80).toFixed(1),
    landfill_diversion_rate: (Math.random() * 25 + 30).toFixed(1),
    raw_data_name: 'Waste Management Metrics',
    normalized_data_name: 'Recycling Rate',
    domain_name: 'waste_management',
  };
}

function generateServicesAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    grocery_store_access: (Math.random() * 40 + 50).toFixed(1),
    pharmacy_access: (Math.random() * 30 + 60).toFixed(1),
    healthcare_facility_access: (Math.random() * 40 + 50).toFixed(1),
    banking_access: (Math.random() * 35 + 55).toFixed(1),
    childcare_access: (Math.random() * 40 + 40).toFixed(1),
    library_proximity: (Math.random() * 5 + 1).toFixed(1),
    recreation_center_access: (Math.random() * 40 + 50).toFixed(1),
    food_desert_score: (Math.random() * 50 + 10).toFixed(1),
    raw_data_name: 'Services Access Metrics',
    normalized_data_name: 'Services Accessibility Index',
    domain_name: 'services',
  };
}

function generateGeographicAttributes(neighborhood: any, index: number) {
  const dataYear = 2024;
  return {
    variable_id: index + 1,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    total_land_area_acres: Math.floor(Math.random() * 500) + 100,
    developed_land_pct: (Math.random() * 40 + 50).toFixed(1),
    residential_land_pct: (Math.random() * 30 + 40).toFixed(1),
    commercial_land_pct: (Math.random() * 25 + 10).toFixed(1),
    industrial_land_pct: (Math.random() * 15 + 2).toFixed(1),
    open_space_pct: (Math.random() * 20 + 5).toFixed(1),
    water_area_acres: (Math.random() * 20 + 1).toFixed(1),
    raw_data_name: 'Geographic Metrics',
    normalized_data_name: 'Land Use Distribution',
    domain_name: 'geographic',
  };
}

function generatePoliceAttributes(neighborhood: any, index: number) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  const dataMonth = Math.floor(Math.random() * 12) + 1;
  const crimeTypes = ['Property', 'Violent', 'Drug/Alcohol', 'Traffic', 'Other'];
  const clearanceStatuses = ['Cleared by Arrest', 'Cleared by Exception', 'Open', 'Unfounded'];
  const divisions = ['Metro', 'North', 'South', 'East', 'West', 'Central', 'Freedom', 'Hickory Grove', 'Independence', 'Providence', 'Steele Creek', 'University City', 'Westover'];
  const weapons = ['Firearm', 'Knife', 'Hands/Fists', 'Blunt Object', 'Other', 'None'];
  
  return {
    record_id: index + 1,
    report_id: `CMPD-${dataYear}-${String(index + 1).padStart(6, '0')}`,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    data_month: dataMonth,
    division: divisions[Math.floor(Math.random() * divisions.length)],
    crime_type: crimeTypes[Math.floor(Math.random() * crimeTypes.length)],
    clearance_status: clearanceStatuses[Math.floor(Math.random() * clearanceStatuses.length)],
    weapon: weapons[Math.floor(Math.random() * weapons.length)],
    victim_age: Math.floor(Math.random() * 50) + 18,
    victim_gender: Math.random() > 0.5 ? 'Male' : 'Female',
    victim_race: ['White', 'Black', 'Hispanic', 'Asian', 'Other'][Math.floor(Math.random() * 5)],
    incident_count: Math.floor(Math.random() * 50) + 1,
    homicide_count: Math.floor(Math.random() * 3),
    traffic_stop_count: Math.floor(Math.random() * 200) + 50,
    search_count: Math.floor(Math.random() * 50) + 5,
    arrest_count: Math.floor(Math.random() * 30) + 2,
    clearance_rate: (Math.random() * 40 + 30).toFixed(1),
    response_time_minutes: (Math.random() * 8 + 4).toFixed(1),
    calls_for_service: Math.floor(Math.random() * 500) + 100,
    officer_count: Math.floor(Math.random() * 20) + 5,
    diversion_participants: Math.floor(Math.random() * 30) + 5,
    diversion_success_rate: (Math.random() * 30 + 60).toFixed(1),
    ois_incidents: Math.floor(Math.random() * 2),
    raw_data_name: 'Police Crime Facts',
    normalized_data_name: 'Crime Rate',
    domain_name: 'police',
  };
}

function generateGenericAttributes(neighborhood: any, index: number, datasetId: string) {
  const dataYear = 2024 - Math.floor(Math.random() * 3);
  return {
    id: `${datasetId}-${index + 1}`,
    npa: neighborhood.npa,
    npa_name: neighborhood.name,
    data_year: dataYear,
    raw_value: Math.floor(Math.random() * 1000) + 100,
    normalized_value: (Math.random() * 100).toFixed(2),
    description: `Data point ${index + 1} for ${neighborhood.name}`,
    domain_name: datasetId,
  };
}
