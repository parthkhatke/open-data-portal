// Mock metrics data for dashboards
// Based on Neighborhood Profile Areas (NPA) from city-portal-360 semantic model

const NEIGHBORHOODS = [
  'Uptown', 'South End', 'NoDa', 'Plaza Midwood', 'Dilworth',
  'Myers Park', 'Elizabeth', 'West End', 'East Charlotte', 'North Charlotte',
  'Ballantyne', 'Steele Creek', 'University City', 'Eastover', 'Wesley Heights',
  'Sedgefield', 'Cotswold', 'Montford', 'Cherry', 'Belmont'
];

const CURRENT_YEAR = new Date().getFullYear();
const BASE_YEAR = 2015;

// Calculate a year factor for adjusting metrics based on selected year
function getYearFactor(year: number, growthRate: number = 0.03) {
  const yearsDiff = year - BASE_YEAR;
  return Math.pow(1 + growthRate, yearsDiff);
}

export function generateMockMetrics(datasetId: string, year: number = CURRENT_YEAR) {
  // Clamp year to valid range
  const selectedYear = Math.max(BASE_YEAR, Math.min(CURRENT_YEAR, year));
  
  switch (datasetId) {
    case 'npa_neighborhoods':
      return generateNPAMetrics(selectedYear);
    case 'demographics':
      return generateDemographicsMetrics(selectedYear);
    case 'economy':
      return generateEconomyMetrics(selectedYear);
    case 'education':
      return generateEducationMetrics(selectedYear);
    case 'health':
      return generateHealthMetrics(selectedYear);
    case 'housing':
      return generateHousingMetrics(selectedYear);
    case 'environment':
      return generateEnvironmentMetrics(selectedYear);
    case 'transportation':
      return generateTransportationMetrics(selectedYear);
    case 'safety':
      return generateSafetyMetrics(selectedYear);
    case 'city_services':
      return generateCityServicesMetrics(selectedYear);
    case 'civic_engagement':
      return generateCivicEngagementMetrics(selectedYear);
    case 'utilities':
      return generateUtilitiesMetrics(selectedYear);
    case 'waste_management':
      return generateWasteManagementMetrics(selectedYear);
    case 'services':
      return generateServicesMetrics(selectedYear);
    case 'geographic':
      return generateGeographicMetrics(selectedYear);
    case 'police':
      return generatePoliceMetrics(selectedYear);
    default:
      return generateDefaultMetrics(selectedYear);
  }
}

function generateNPAMetrics(year: number) {
  const factor = getYearFactor(year, 0.01);
  return {
    totalCount: 462,
    totalNPAs: 462,
    avgLandArea: 285,
    totalLandAreaAcres: 131670,
    topNeighborhoods: NEIGHBORHOODS.slice(0, 8).map((name, i) => ({
      neighborhood: name,
      count: Math.floor((500 - i * 30) * factor),
    })),
    bottomNeighborhoods: NEIGHBORHOODS.slice(-3).map((name, i) => ({
      neighborhood: name,
      count: Math.floor((120 - i * 20) * factor),
    })),
  };
}

function generateDemographicsMetrics(year: number) {
  const factor = getYearFactor(year, 0.025); // 2.5% population growth
  const basePopulation = 750000;
  return {
    totalCount: 462,
    totalPopulation: Math.floor(basePopulation * factor),
    avgPopulationDensity: Math.floor(2400 * factor),
    medianAge: 33 + (year - BASE_YEAR) * 0.1,
    diversityIndex: Math.min(0.75, 0.58 + (year - BASE_YEAR) * 0.01),
    populationGrowthRate: 2.3 + (year - 2020) * 0.1,
    timeSeries: generateYearlyTimeSeries(year, 5, basePopulation, 20000),
    topNeighborhoods: [
      { neighborhood: 'Uptown', count: Math.floor(12000 * factor) },
      { neighborhood: 'South End', count: Math.floor(10500 * factor) },
      { neighborhood: 'University City', count: Math.floor(9800 * factor) },
      { neighborhood: 'Ballantyne', count: Math.floor(8500 * factor) },
      { neighborhood: 'NoDa', count: Math.floor(8200 * factor) },
      { neighborhood: 'East Charlotte', count: Math.floor(7800 * factor) },
      { neighborhood: 'Plaza Midwood', count: Math.floor(7200 * factor) },
      { neighborhood: 'Dilworth', count: Math.floor(6800 * factor) },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'Eastover', count: Math.floor(2000 * factor) },
      { neighborhood: 'Wesley Heights', count: Math.floor(2200 * factor) },
      { neighborhood: 'Cherry', count: Math.floor(2400 * factor) },
    ],
    breakdowns: {
      ageGroups: [
        { label: 'Under 18', value: 21.5 - (year - 2020) * 0.2, color: '#3b82f6' },
        { label: '18-34', value: 28.3, color: '#10b981' },
        { label: '35-54', value: 26.8, color: '#f59e0b' },
        { label: '55-64', value: 12.4 + (year - 2020) * 0.1, color: '#8b5cf6' },
        { label: '65+', value: 11.0 + (year - 2020) * 0.1, color: '#ef4444' },
      ],
    },
  };
}

function generateEconomyMetrics(year: number) {
  const incomeFactor = getYearFactor(year, 0.035); // 3.5% income growth
  const baseIncome = 52000;
  return {
    totalCount: 462,
    medianHouseholdIncome: Math.floor(baseIncome * incomeFactor),
    avgUnemploymentRate: Math.max(3.2, 5.5 - (year - 2015) * 0.15),
    totalBusinesses: Math.floor(35000 * getYearFactor(year, 0.02)),
    avgJobDensity: Math.floor(1500 * getYearFactor(year, 0.025)),
    povertyRate: Math.max(9, 14 - (year - 2015) * 0.2),
    incomeGrowthRate: 3.0 + (year - 2020) * 0.2,
    timeSeries: generateYearlyTimeSeries(year, 5, baseIncome, 1800),
    topNeighborhoods: [
      { neighborhood: 'Myers Park', count: Math.floor(115000 * incomeFactor) },
      { neighborhood: 'Eastover', count: Math.floor(110000 * incomeFactor) },
      { neighborhood: 'Ballantyne', count: Math.floor(98000 * incomeFactor) },
      { neighborhood: 'Dilworth', count: Math.floor(88000 * incomeFactor) },
      { neighborhood: 'South End', count: Math.floor(78000 * incomeFactor) },
      { neighborhood: 'Cotswold', count: Math.floor(75000 * incomeFactor) },
      { neighborhood: 'Plaza Midwood', count: Math.floor(72000 * incomeFactor) },
      { neighborhood: 'Sedgefield', count: Math.floor(68000 * incomeFactor) },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'West End', count: Math.floor(28000 * incomeFactor) },
      { neighborhood: 'North Charlotte', count: Math.floor(30000 * incomeFactor) },
      { neighborhood: 'East Charlotte', count: Math.floor(32000 * incomeFactor) },
    ],
    breakdowns: {
      incomeDistribution: [
        { label: '<$25K', value: Math.max(10, 18 - (year - 2015) * 0.3), color: '#ef4444' },
        { label: '$25K-$50K', value: 22.8, color: '#f59e0b' },
        { label: '$50K-$75K', value: 24.5, color: '#10b981' },
        { label: '$75K-$100K', value: 18.3 + (year - 2015) * 0.15, color: '#3b82f6' },
        { label: '>$100K', value: 15 + (year - 2015) * 0.4, color: '#8b5cf6' },
      ],
    },
  };
}

function generateEducationMetrics(year: number) {
  const improvementFactor = (year - 2015) * 0.8;
  return {
    totalCount: 462,
    avgGraduationRate: Math.min(95, 82 + improvementFactor),
    avgReadingProficiency: Math.min(80, 60 + improvementFactor),
    avgMathProficiency: Math.min(75, 55 + improvementFactor),
    avgSchoolProximityScore: 72.4,
    collegeEnrollmentRate: Math.min(70, 52 + improvementFactor * 0.5),
    bachelorsDegreeRate: Math.min(55, 35 + improvementFactor * 0.6),
    timeSeries: generateYearlyTimeSeries(year, 5, 82, 1.2),
    topNeighborhoods: [
      { neighborhood: 'Myers Park', count: Math.min(99, 92 + improvementFactor * 0.4) },
      { neighborhood: 'Ballantyne', count: Math.min(98, 91 + improvementFactor * 0.4) },
      { neighborhood: 'Dilworth', count: Math.min(97, 90 + improvementFactor * 0.4) },
      { neighborhood: 'South End', count: Math.min(96, 89 + improvementFactor * 0.4) },
      { neighborhood: 'Eastover', count: Math.min(95, 88 + improvementFactor * 0.4) },
      { neighborhood: 'Cotswold', count: Math.min(94, 87 + improvementFactor * 0.4) },
      { neighborhood: 'Plaza Midwood', count: Math.min(93, 86 + improvementFactor * 0.4) },
      { neighborhood: 'Sedgefield', count: Math.min(92, 85 + improvementFactor * 0.4) },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'West End', count: Math.min(82, 68 + improvementFactor * 0.5) },
      { neighborhood: 'North Charlotte', count: Math.min(84, 70 + improvementFactor * 0.5) },
      { neighborhood: 'East Charlotte', count: Math.min(86, 72 + improvementFactor * 0.5) },
    ],
    breakdowns: {
      educationLevels: [
        { label: 'Less than HS', value: Math.max(5, 12 - (year - 2015) * 0.3), color: '#ef4444' },
        { label: 'High School', value: 24.2, color: '#f59e0b' },
        { label: 'Some College', value: 24.8, color: '#10b981' },
        { label: "Bachelor's", value: 24 + (year - 2015) * 0.4, color: '#3b82f6' },
        { label: 'Graduate+', value: 10 + (year - 2015) * 0.3, color: '#8b5cf6' },
      ],
    },
  };
}

function generateHealthMetrics(year: number) {
  const healthImprovement = (year - 2015) * 0.15;
  return {
    totalCount: 462,
    avgLifeExpectancy: 76.5 + healthImprovement,
    avgInfantMortalityRate: Math.max(4.5, 7.5 - healthImprovement * 0.3),
    avgLowBirthWeightPct: Math.max(6.5, 10 - healthImprovement * 0.3),
    healthcareAccessScore: Math.min(85, 65 + healthImprovement * 1.5),
    healthInsuranceCoverage: Math.min(95, 82 + (year - 2015) * 0.6),
    foodAccessScore: Math.min(80, 60 + healthImprovement * 1.2),
    timeSeries: generateYearlyTimeSeries(year, 5, 76.5, 0.3),
    topNeighborhoods: [
      { neighborhood: 'Myers Park', count: 82 + healthImprovement },
      { neighborhood: 'Eastover', count: 81.5 + healthImprovement },
      { neighborhood: 'Ballantyne', count: 81 + healthImprovement },
      { neighborhood: 'Dilworth', count: 80 + healthImprovement },
      { neighborhood: 'Cotswold', count: 79 + healthImprovement },
      { neighborhood: 'Sedgefield', count: 78.5 + healthImprovement },
      { neighborhood: 'South End', count: 78 + healthImprovement },
      { neighborhood: 'Plaza Midwood', count: 77.5 + healthImprovement },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'West End', count: 71 + healthImprovement * 0.8 },
      { neighborhood: 'North Charlotte', count: 72 + healthImprovement * 0.8 },
      { neighborhood: 'East Charlotte', count: 73 + healthImprovement * 0.8 },
    ],
    breakdowns: {
      healthIndicators: [
        { label: 'Excellent', value: 15 + (year - 2015) * 0.3, color: '#10b981' },
        { label: 'Very Good', value: 32.2, color: '#3b82f6' },
        { label: 'Good', value: 28.8, color: '#f59e0b' },
        { label: 'Fair', value: Math.max(10, 16 - (year - 2015) * 0.3), color: '#ef4444' },
        { label: 'Poor', value: Math.max(4, 8 - (year - 2015) * 0.2), color: '#dc2626' },
      ],
    },
  };
}

function generateHousingMetrics(year: number) {
  const housingFactor = getYearFactor(year, 0.06); // 6% housing price growth
  const baseHomeValue = 220000;
  const baseRent = 950;
  return {
    totalCount: 462,
    medianHomeValue: Math.floor(baseHomeValue * housingFactor),
    medianRent: Math.floor(baseRent * housingFactor),
    homeownershipRate: Math.max(48, 56 - (year - 2015) * 0.3),
    totalHousingUnits: Math.floor(350000 * getYearFactor(year, 0.02)),
    vacancyRate: Math.max(5, 8 - (year - 2018) * 0.3),
    housingCostBurdenPct: 28 + (year - 2015) * 0.4,
    newConstructionPermits: Math.floor(8000 * getYearFactor(year, 0.03)),
    timeSeries: generateYearlyTimeSeries(year, 5, baseHomeValue, 15000),
    topNeighborhoods: [
      { neighborhood: 'Myers Park', count: Math.floor(520000 * housingFactor) },
      { neighborhood: 'Eastover', count: Math.floor(480000 * housingFactor) },
      { neighborhood: 'Dilworth', count: Math.floor(420000 * housingFactor) },
      { neighborhood: 'South End', count: Math.floor(350000 * housingFactor) },
      { neighborhood: 'Cotswold', count: Math.floor(320000 * housingFactor) },
      { neighborhood: 'Ballantyne', count: Math.floor(300000 * housingFactor) },
      { neighborhood: 'Plaza Midwood', count: Math.floor(285000 * housingFactor) },
      { neighborhood: 'Sedgefield', count: Math.floor(270000 * housingFactor) },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'West End', count: Math.floor(120000 * housingFactor) },
      { neighborhood: 'North Charlotte', count: Math.floor(130000 * housingFactor) },
      { neighborhood: 'East Charlotte', count: Math.floor(140000 * housingFactor) },
    ],
    breakdowns: {
      housingTypes: [
        { label: 'Single Family', value: Math.max(48, 58 - (year - 2015) * 0.5), color: '#3b82f6' },
        { label: 'Townhouse', value: 10 + (year - 2015) * 0.2, color: '#10b981' },
        { label: 'Apartment', value: 24 + (year - 2015) * 0.3, color: '#f59e0b' },
        { label: 'Condo', value: 3 + (year - 2015) * 0.1, color: '#8b5cf6' },
        { label: 'Other', value: 2.0, color: '#6b7280' },
      ],
    },
  };
}

function generateEnvironmentMetrics(year: number) {
  const canopyBase = 42;
  const canopyGrowth = (year - 2015) * 0.5;
  return {
    totalCount: 462,
    avgTreeCanopyCoverage: Math.min(55, canopyBase + canopyGrowth),
    avgImperviousSurfacePct: 32 + (year - 2015) * 0.3,
    avgParkAccessScore: Math.min(80, 60 + (year - 2015) * 0.8),
    avgGreenspacePerCapita: Math.max(0.25, 0.38 - (year - 2015) * 0.01),
    avgAirQualityIndex: Math.max(35, 50 - (year - 2015) * 0.8),
    avgUrbanHeatIndex: 2.2 + (year - 2015) * 0.06,
    timeSeries: generateYearlyTimeSeries(year, 5, canopyBase, 0.8),
    topNeighborhoods: [
      { neighborhood: 'Myers Park', count: 64 + canopyGrowth * 0.4 },
      { neighborhood: 'Eastover', count: 61 + canopyGrowth * 0.4 },
      { neighborhood: 'Dilworth', count: 58 + canopyGrowth * 0.4 },
      { neighborhood: 'Wesley Heights', count: 55 + canopyGrowth * 0.3 },
      { neighborhood: 'Sedgefield', count: 52 + canopyGrowth * 0.3 },
      { neighborhood: 'Cotswold', count: 50 + canopyGrowth * 0.3 },
      { neighborhood: 'Plaza Midwood', count: 48 + canopyGrowth * 0.3 },
      { neighborhood: 'Elizabeth', count: 46 + canopyGrowth * 0.3 },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'Uptown', count: 15 + canopyGrowth * 0.2 },
      { neighborhood: 'South End', count: 18 + canopyGrowth * 0.2 },
      { neighborhood: 'NoDa', count: 24 + canopyGrowth * 0.2 },
    ],
    breakdowns: {
      landCover: [
        { label: 'Tree Canopy', value: canopyBase + canopyGrowth, color: '#10b981' },
        { label: 'Grass/Shrub', value: 18.2 - (year - 2015) * 0.1, color: '#84cc16' },
        { label: 'Impervious', value: 28 + (year - 2015) * 0.2, color: '#6b7280' },
        { label: 'Water', value: 2.8, color: '#3b82f6' },
        { label: 'Bare Soil', value: Math.max(1.5, 4 - (year - 2015) * 0.15), color: '#d97706' },
      ],
    },
  };
}

function generateTransportationMetrics(year: number) {
  const transitFactor = getYearFactor(year, 0.04);
  return {
    totalCount: 462,
    avgTransitAccessScore: Math.min(70, 42 + (year - 2015) * 1.0),
    avgCommuteTime: 24 + (year - 2015) * 0.25,
    publicTransitUsagePct: Math.min(8, 3.2 + (year - 2015) * 0.15),
    avgWalkabilityScore: Math.min(60, 38 + (year - 2015) * 0.7),
    totalBikeLaneMiles: Math.floor(45 + (year - 2015) * 4),
    vehicleOwnershipRate: Math.max(88, 95 - (year - 2015) * 0.3),
    trafficCongestionIndex: 42 + (year - 2015) * 0.6,
    timeSeries: generateYearlyTimeSeries(year, 5, 24, 0.4),
    topNeighborhoods: [
      { neighborhood: 'Uptown', count: 85 + (year - 2015) * 0.7 },
      { neighborhood: 'South End', count: 78 + (year - 2015) * 0.7 },
      { neighborhood: 'NoDa', count: 65 + (year - 2015) * 0.6 },
      { neighborhood: 'Plaza Midwood', count: 60 + (year - 2015) * 0.5 },
      { neighborhood: 'Dilworth', count: 58 + (year - 2015) * 0.5 },
      { neighborhood: 'Elizabeth', count: 55 + (year - 2015) * 0.5 },
      { neighborhood: 'Myers Park', count: 52 + (year - 2015) * 0.4 },
      { neighborhood: 'Cherry', count: 48 + (year - 2015) * 0.4 },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'Steele Creek', count: 18 + (year - 2015) * 0.3 },
      { neighborhood: 'Ballantyne', count: 22 + (year - 2015) * 0.4 },
      { neighborhood: 'University City', count: 28 + (year - 2015) * 0.4 },
    ],
    breakdowns: {
      commuteModes: [
        { label: 'Drive Alone', value: Math.max(70, 82 - (year - 2015) * 0.6), color: '#ef4444' },
        { label: 'Carpool', value: 8.2, color: '#f59e0b' },
        { label: 'Public Transit', value: 3 + (year - 2015) * 0.15, color: '#10b981' },
        { label: 'Walk/Bike', value: 2.5 + (year - 2015) * 0.1, color: '#3b82f6' },
        { label: 'Work from Home', value: 2 + (year - 2018) * 0.5, color: '#8b5cf6' },
      ],
    },
  };
}

function generateSafetyMetrics(year: number) {
  // Crime tends to decrease over time with proper intervention
  const crimeReduction = (year - 2015) * 0.02;
  const baseCrime = 1400;
  return {
    totalCount: 462,
    avgViolentCrimeRate: Math.max(6, 10 - crimeReduction * 15),
    avgPropertyCrimeRate: Math.max(22, 35 - crimeReduction * 50),
    avgEmergencyResponseTime: Math.max(5.5, 7.5 - (year - 2015) * 0.1),
    safetyPerceptionScore: Math.min(80, 60 + (year - 2015) * 0.8),
    streetlightDensity: 30 + (year - 2015) * 0.5,
    callsForServicePer1000: Math.max(100, 145 - (year - 2015) * 2),
    crimesClearanceRate: Math.min(55, 38 + (year - 2015) * 0.4),
    timeSeries: generateMonthlyTimeSeries(year, 6, baseCrime, 200),
    topNeighborhoods: [
      { neighborhood: 'Uptown', count: Math.floor(580 * (1 - crimeReduction)) },
      { neighborhood: 'West End', count: Math.floor(520 * (1 - crimeReduction)) },
      { neighborhood: 'East Charlotte', count: Math.floor(480 * (1 - crimeReduction)) },
      { neighborhood: 'North Charlotte', count: Math.floor(450 * (1 - crimeReduction)) },
      { neighborhood: 'South End', count: Math.floor(400 * (1 - crimeReduction)) },
      { neighborhood: 'NoDa', count: Math.floor(370 * (1 - crimeReduction)) },
      { neighborhood: 'Plaza Midwood', count: Math.floor(340 * (1 - crimeReduction)) },
      { neighborhood: 'University City', count: Math.floor(320 * (1 - crimeReduction)) },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'Ballantyne', count: Math.floor(95 * (1 - crimeReduction * 0.5)) },
      { neighborhood: 'Myers Park', count: Math.floor(100 * (1 - crimeReduction * 0.5)) },
      { neighborhood: 'Eastover', count: Math.floor(105 * (1 - crimeReduction * 0.5)) },
    ],
    breakdowns: {
      crimeTypes: [
        { label: 'Property', value: 62.5, color: '#f59e0b' },
        { label: 'Violent', value: Math.max(12, 18 - (year - 2015) * 0.3), color: '#ef4444' },
        { label: 'Drug/Alcohol', value: 12.8, color: '#8b5cf6' },
        { label: 'Traffic', value: 6.5, color: '#3b82f6' },
        { label: 'Other', value: 3.0, color: '#6b7280' },
      ],
    },
  };
}

function generateCityServicesMetrics(year: number) {
  const serviceFactor = getYearFactor(year, 0.03);
  const baseRequests = 65000;
  return {
    totalCount: 462,
    totalServiceRequests: Math.floor(baseRequests * serviceFactor),
    avgResolutionTimeDays: Math.max(3.5, 7 - (year - 2015) * 0.2),
    satisfactionScore: Math.min(88, 70 + (year - 2015) * 0.8),
    codeEnforcementCases: Math.floor(10000 * serviceFactor),
    permitApplications: Math.floor(14000 * serviceFactor),
    zoningComplianceRate: Math.min(96, 88 + (year - 2015) * 0.4),
    serviceEquityIndex: Math.min(85, 65 + (year - 2015) * 0.7),
    timeSeries: generateMonthlyTimeSeries(year, 6, Math.floor(baseRequests / 6), 1500),
    topNeighborhoods: [
      { neighborhood: 'Uptown', count: Math.floor(4000 * serviceFactor) },
      { neighborhood: 'South End', count: Math.floor(3400 * serviceFactor) },
      { neighborhood: 'NoDa', count: Math.floor(2900 * serviceFactor) },
      { neighborhood: 'Plaza Midwood', count: Math.floor(2600 * serviceFactor) },
      { neighborhood: 'Dilworth', count: Math.floor(2200 * serviceFactor) },
      { neighborhood: 'West End', count: Math.floor(2000 * serviceFactor) },
      { neighborhood: 'Elizabeth', count: Math.floor(1800 * serviceFactor) },
      { neighborhood: 'Myers Park', count: Math.floor(1600 * serviceFactor) },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'Eastover', count: Math.floor(400 * serviceFactor) },
      { neighborhood: 'Wesley Heights', count: Math.floor(450 * serviceFactor) },
      { neighborhood: 'Cherry', count: Math.floor(500 * serviceFactor) },
    ],
    breakdowns: {
      requestTypes: [
        { label: 'Street/Road', value: 28.5, color: '#3b82f6' },
        { label: 'Trash/Recycling', value: 22.2, color: '#10b981' },
        { label: 'Code Violation', value: 18.5, color: '#f59e0b' },
        { label: 'Water/Sewer', value: 15.8, color: '#8b5cf6' },
        { label: 'Other', value: 15.0, color: '#6b7280' },
      ],
    },
  };
}

function generateCivicEngagementMetrics(year: number) {
  // Civic engagement varies by election years
  const isElectionYear = year % 2 === 0;
  const baseVoterTurnout = isElectionYear ? (year % 4 === 0 ? 62 : 45) : 25;
  return {
    totalCount: 462,
    avgVoterTurnoutRate: baseVoterTurnout + (year - 2015) * 0.5,
    voterRegistrationRate: Math.min(90, 75 + (year - 2015) * 0.7),
    totalCommunityOrgs: Math.floor(950 + (year - 2015) * 30),
    nonprofitDensity: 2.2 + (year - 2015) * 0.06,
    volunteerHoursPerCapita: 14 + (year - 2015) * 0.4,
    publicMeetingAttendance: Math.floor(3200 + (year - 2015) * 130),
    civicParticipationIndex: Math.min(75, 55 + (year - 2015) * 0.7),
    timeSeries: generateYearlyTimeSeries(year, 5, 50, 3),
    topNeighborhoods: [
      { neighborhood: 'Myers Park', count: 72 + (year - 2015) * 0.6 },
      { neighborhood: 'Dilworth', count: 69 + (year - 2015) * 0.6 },
      { neighborhood: 'Eastover', count: 67 + (year - 2015) * 0.5 },
      { neighborhood: 'Ballantyne', count: 65 + (year - 2015) * 0.5 },
      { neighborhood: 'South End', count: 62 + (year - 2015) * 0.6 },
      { neighborhood: 'Plaza Midwood', count: 60 + (year - 2015) * 0.5 },
      { neighborhood: 'NoDa', count: 58 + (year - 2015) * 0.5 },
      { neighborhood: 'Elizabeth', count: 56 + (year - 2015) * 0.5 },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'West End', count: 35 + (year - 2015) * 0.3 },
      { neighborhood: 'North Charlotte', count: 38 + (year - 2015) * 0.3 },
      { neighborhood: 'East Charlotte', count: 42 + (year - 2015) * 0.4 },
    ],
    breakdowns: {
      engagementTypes: [
        { label: 'Voting', value: 42.5, color: '#3b82f6' },
        { label: 'Volunteering', value: 22 + (year - 2015) * 0.3, color: '#10b981' },
        { label: 'Community Mtgs', value: 15.8, color: '#f59e0b' },
        { label: 'Nonprofit Work', value: 10.5, color: '#8b5cf6' },
        { label: 'Other', value: 6.0, color: '#6b7280' },
      ],
    },
  };
}

function generateUtilitiesMetrics(year: number) {
  const efficiencyFactor = (year - 2015) * 0.01;
  return {
    totalCount: 462,
    avgWaterConsumption: Math.max(65, 85 - (year - 2015) * 1.0),
    avgElectricityUsage: Math.max(900, 1150 - (year - 2015) * 12),
    avgNaturalGasUsage: Math.max(55, 72 - (year - 2015) * 0.8),
    broadbandAccessPct: Math.min(98, 78 + (year - 2015) * 1.4),
    renewableEnergyAdoption: Math.min(35, 5 + (year - 2015) * 1.5),
    utilityEfficiencyScore: Math.min(85, 58 + (year - 2015) * 1.0),
    timeSeries: generateYearlyTimeSeries(year, 5, 1100, -15),
    topNeighborhoods: [
      { neighborhood: 'Ballantyne', count: Math.floor(1400 * (1 - efficiencyFactor)) },
      { neighborhood: 'Myers Park', count: Math.floor(1320 * (1 - efficiencyFactor)) },
      { neighborhood: 'Eastover', count: Math.floor(1260 * (1 - efficiencyFactor)) },
      { neighborhood: 'Dilworth', count: Math.floor(1180 * (1 - efficiencyFactor)) },
      { neighborhood: 'South End', count: Math.floor(1100 * (1 - efficiencyFactor)) },
      { neighborhood: 'Cotswold', count: Math.floor(1050 * (1 - efficiencyFactor)) },
      { neighborhood: 'University City', count: Math.floor(1000 * (1 - efficiencyFactor)) },
      { neighborhood: 'Sedgefield', count: Math.floor(980 * (1 - efficiencyFactor)) },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'Uptown', count: Math.floor(750 * (1 - efficiencyFactor)) },
      { neighborhood: 'NoDa', count: Math.floor(800 * (1 - efficiencyFactor)) },
      { neighborhood: 'Cherry', count: Math.floor(850 * (1 - efficiencyFactor)) },
    ],
    breakdowns: {
      utilityTypes: [
        { label: 'Electricity', value: 58.5, color: '#f59e0b' },
        { label: 'Water', value: 22.2, color: '#3b82f6' },
        { label: 'Natural Gas', value: 12.8, color: '#8b5cf6' },
        { label: 'Internet', value: 4.5, color: '#10b981' },
        { label: 'Other', value: 2.0, color: '#6b7280' },
      ],
    },
  };
}

function generateWasteManagementMetrics(year: number) {
  const recyclingGrowth = (year - 2015) * 1.2;
  return {
    totalCount: 462,
    avgWastePerCapita: Math.max(850, 1150 - (year - 2015) * 18),
    avgRecyclingRate: Math.min(50, 22 + recyclingGrowth),
    contaminationRate: Math.max(12, 25 - (year - 2015) * 0.6),
    compostingParticipation: Math.min(30, 5 + (year - 2015) * 1.0),
    illegalDumpingIncidents: Math.max(400, 1000 - (year - 2015) * 35),
    landfillDiversionRate: Math.min(55, 28 + recyclingGrowth * 0.8),
    timeSeries: generateYearlyTimeSeries(year, 5, 22, 2),
    topNeighborhoods: [
      { neighborhood: 'Myers Park', count: 40 + recyclingGrowth * 0.7 },
      { neighborhood: 'Dilworth', count: 38 + recyclingGrowth * 0.7 },
      { neighborhood: 'Eastover', count: 36 + recyclingGrowth * 0.6 },
      { neighborhood: 'South End', count: 34 + recyclingGrowth * 0.6 },
      { neighborhood: 'Plaza Midwood', count: 32 + recyclingGrowth * 0.5 },
      { neighborhood: 'Ballantyne', count: 30 + recyclingGrowth * 0.5 },
      { neighborhood: 'NoDa', count: 28 + recyclingGrowth * 0.5 },
      { neighborhood: 'Elizabeth', count: 26 + recyclingGrowth * 0.5 },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'West End', count: 14 + recyclingGrowth * 0.3 },
      { neighborhood: 'North Charlotte', count: 16 + recyclingGrowth * 0.3 },
      { neighborhood: 'East Charlotte', count: 18 + recyclingGrowth * 0.4 },
    ],
    breakdowns: {
      wasteTypes: [
        { label: 'Landfill', value: Math.max(40, 58 - recyclingGrowth * 0.8), color: '#6b7280' },
        { label: 'Recycling', value: 22 + recyclingGrowth, color: '#10b981' },
        { label: 'Composting', value: 5 + (year - 2015) * 0.3, color: '#84cc16' },
        { label: 'Hazardous', value: 3.5, color: '#ef4444' },
        { label: 'Other', value: 3.0, color: '#f59e0b' },
      ],
    },
  };
}

function generateServicesMetrics(year: number) {
  const accessImprovement = (year - 2015) * 0.8;
  return {
    totalCount: 462,
    avgGroceryAccess: Math.min(82, 60 + accessImprovement),
    avgPharmacyAccess: Math.min(85, 65 + accessImprovement),
    avgHealthcareAccess: Math.min(80, 58 + accessImprovement),
    avgBankingAccess: Math.min(82, 62 + accessImprovement),
    avgChildcareAccess: Math.min(72, 50 + accessImprovement),
    avgFoodDesertScore: Math.max(18, 38 - accessImprovement),
    topNeighborhoods: [
      { neighborhood: 'Uptown', count: 88 + accessImprovement * 0.3 },
      { neighborhood: 'South End', count: 84 + accessImprovement * 0.4 },
      { neighborhood: 'Dilworth', count: 78 + accessImprovement * 0.4 },
      { neighborhood: 'Myers Park', count: 74 + accessImprovement * 0.4 },
      { neighborhood: 'Plaza Midwood', count: 70 + accessImprovement * 0.5 },
      { neighborhood: 'NoDa', count: 68 + accessImprovement * 0.5 },
      { neighborhood: 'Elizabeth', count: 66 + accessImprovement * 0.4 },
      { neighborhood: 'Cotswold', count: 64 + accessImprovement * 0.4 },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'Steele Creek', count: 38 + accessImprovement * 0.4 },
      { neighborhood: 'West End', count: 40 + accessImprovement * 0.4 },
      { neighborhood: 'North Charlotte', count: 44 + accessImprovement * 0.5 },
    ],
    breakdowns: {
      serviceTypes: [
        { label: 'Grocery', value: 22.5, color: '#10b981' },
        { label: 'Healthcare', value: 20.2, color: '#ef4444' },
        { label: 'Banking', value: 18.5, color: '#3b82f6' },
        { label: 'Pharmacy', value: 15.8, color: '#8b5cf6' },
        { label: 'Childcare', value: 12.5, color: '#f59e0b' },
        { label: 'Other', value: 10.5, color: '#6b7280' },
      ],
    },
  };
}

function generateGeographicMetrics(year: number) {
  const developmentGrowth = (year - 2015) * 0.3;
  return {
    totalCount: 462,
    totalLandAreaAcres: 131670,
    avgDevelopedLandPct: Math.min(85, 65 + developmentGrowth * 2.5),
    avgResidentialPct: Math.min(60, 50 + developmentGrowth),
    avgCommercialPct: Math.min(22, 15 + developmentGrowth * 0.6),
    avgIndustrialPct: Math.max(6, 10 - developmentGrowth * 0.3),
    avgOpenSpacePct: Math.max(10, 20 - developmentGrowth),
    topNeighborhoods: [
      { neighborhood: 'Steele Creek', count: 2850 },
      { neighborhood: 'Ballantyne', count: 2450 },
      { neighborhood: 'University City', count: 2150 },
      { neighborhood: 'East Charlotte', count: 1850 },
      { neighborhood: 'North Charlotte', count: 1650 },
      { neighborhood: 'West End', count: 1450 },
      { neighborhood: 'Myers Park', count: 1250 },
      { neighborhood: 'Dilworth', count: 850 },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'Uptown', count: 285 },
      { neighborhood: 'Cherry', count: 320 },
      { neighborhood: 'Elizabeth', count: 385 },
    ],
    breakdowns: {
      landUse: [
        { label: 'Residential', value: 50 + developmentGrowth, color: '#3b82f6' },
        { label: 'Commercial', value: 15 + developmentGrowth * 0.6, color: '#10b981' },
        { label: 'Open Space', value: Math.max(10, 20 - developmentGrowth), color: '#84cc16' },
        { label: 'Industrial', value: Math.max(6, 10 - developmentGrowth * 0.3), color: '#6b7280' },
        { label: 'Other', value: 2.6, color: '#f59e0b' },
      ],
    },
  };
}

function generatePoliceMetrics(year: number) {
  // Police crime trends - generally decreasing with effective policing
  const crimeReduction = (year - 2015) * 0.015;
  const baseCrimes = 45000;
  const baseHomicides = 85;
  
  return {
    totalCount: 462,
    totalCrimes: Math.floor(baseCrimes * (1 - crimeReduction)),
    homicideCount: Math.floor(baseHomicides * (1 - crimeReduction * 0.8)),
    incidentCount: Math.floor((baseCrimes - baseHomicides) * (1 - crimeReduction)),
    trafficStops: Math.floor(125000 * (1 + (year - 2015) * 0.01)),
    clearanceRate: Math.min(55, 38 + (year - 2015) * 0.8),
    homicideClearanceRate: Math.min(70, 52 + (year - 2015) * 1.0),
    totalOfficers: Math.floor(2000 + (year - 2015) * 25),
    diversionParticipants: Math.floor(850 + (year - 2015) * 45),
    diversionSuccessRate: Math.min(78, 62 + (year - 2015) * 1.2),
    oisIncidents: Math.max(8, 18 - (year - 2015) * 0.6),
    avgResponseTime: Math.max(5.2, 7.5 - (year - 2015) * 0.12),
    timeSeries: generateYearlyTimeSeries(year, 5, baseCrimes, -800),
    topNeighborhoods: [
      { neighborhood: 'Uptown', count: Math.floor(4200 * (1 - crimeReduction)) },
      { neighborhood: 'West End', count: Math.floor(3800 * (1 - crimeReduction)) },
      { neighborhood: 'East Charlotte', count: Math.floor(3500 * (1 - crimeReduction)) },
      { neighborhood: 'North Charlotte', count: Math.floor(3200 * (1 - crimeReduction)) },
      { neighborhood: 'South End', count: Math.floor(2800 * (1 - crimeReduction)) },
      { neighborhood: 'University City', count: Math.floor(2500 * (1 - crimeReduction)) },
      { neighborhood: 'NoDa', count: Math.floor(2200 * (1 - crimeReduction)) },
      { neighborhood: 'Plaza Midwood', count: Math.floor(1900 * (1 - crimeReduction)) },
    ],
    bottomNeighborhoods: [
      { neighborhood: 'Eastover', count: Math.floor(320 * (1 - crimeReduction * 0.5)) },
      { neighborhood: 'Myers Park', count: Math.floor(380 * (1 - crimeReduction * 0.5)) },
      { neighborhood: 'Ballantyne', count: Math.floor(450 * (1 - crimeReduction * 0.5)) },
    ],
    breakdowns: {
      crimeCategories: [
        { label: 'Property Crime', value: 58.5 - (year - 2015) * 0.3, color: '#f59e0b' },
        { label: 'Violent Crime', value: Math.max(12, 18 - (year - 2015) * 0.4), color: '#ef4444' },
        { label: 'Drug Offenses', value: 12.5, color: '#8b5cf6' },
        { label: 'Traffic Violations', value: 8.5 + (year - 2015) * 0.2, color: '#3b82f6' },
        { label: 'Other', value: 8.0, color: '#6b7280' },
      ],
      officerDemographics: [
        { label: 'White', value: 58.2 - (year - 2015) * 0.5, color: '#3b82f6' },
        { label: 'Black', value: 25.5 + (year - 2015) * 0.3, color: '#10b981' },
        { label: 'Hispanic', value: 10.2 + (year - 2015) * 0.15, color: '#f59e0b' },
        { label: 'Asian', value: 3.5 + (year - 2015) * 0.05, color: '#8b5cf6' },
        { label: 'Other', value: 2.6, color: '#6b7280' },
      ],
      divisionActivity: [
        { label: 'Metro', value: 22.5, color: '#1e3a8a' },
        { label: 'North', value: 18.2, color: '#3b82f6' },
        { label: 'South', value: 16.5, color: '#10b981' },
        { label: 'East', value: 15.8, color: '#f59e0b' },
        { label: 'West', value: 14.5, color: '#8b5cf6' },
        { label: 'Central', value: 12.5, color: '#ef4444' },
      ],
    },
  };
}

function generateDefaultMetrics(year: number) {
  const factor = getYearFactor(year, 0.02);
  return {
    totalCount: Math.floor(4000 * factor),
    timeSeries: generateMonthlyTimeSeries(year, 6, 500, 100),
    topNeighborhoods: NEIGHBORHOODS.slice(0, 8).map((name, i) => ({
      neighborhood: name,
      count: Math.floor((200 - i * 15) * factor),
    })),
    bottomNeighborhoods: NEIGHBORHOODS.slice(-3).map((name, i) => ({
      neighborhood: name,
      count: Math.floor((60 - i * 10) * factor),
    })),
  };
}

// Helper function to generate monthly time series ending at selected year
function generateMonthlyTimeSeries(year: number, months: number, baseValue: number, variance: number) {
  return Array.from({ length: months }, (_, i) => {
    const monthIndex = (12 - months + i) % 12;
    const displayYear = monthIndex < (12 - months) ? year : year;
    return {
      period: `${displayYear}-${String(monthIndex + 1).padStart(2, '0')}`,
      count: Math.floor(baseValue + (i - months / 2) * (variance / months) + (Math.random() - 0.5) * variance * 0.3),
    };
  });
}

// Helper function to generate yearly time series ending at selected year
function generateYearlyTimeSeries(year: number, years: number, baseValue: number, growthPerYear: number) {
  return Array.from({ length: years }, (_, i) => {
    const dataYear = year - years + 1 + i;
    const yearOffset = dataYear - BASE_YEAR;
    return {
      period: `${dataYear}-01`,
      count: Math.floor(baseValue + yearOffset * growthPerYear + (Math.random() - 0.5) * Math.abs(growthPerYear)),
    };
  });
}
