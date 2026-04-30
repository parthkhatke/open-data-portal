/**
 * Business-friendly label for the primary metric shown on the map per dataset.
 * Used in Map Explorer popup and Feature Details panel.
 */
export function getValueLabelForDataset(datasetId: string): string {
  const labels: Record<string, string> = {
    demographics: 'Population',
    economy: 'Median household income',
    education: 'Proficiency score',
    health: 'Health score',
    housing: 'Median home value',
    environment: 'Environmental score',
    transportation: 'Transit access score',
    safety: 'Incidents',
    city_services: 'Service requests',
    civic_engagement: 'Civic participation score',
    utilities: 'Consumption score',
    waste_management: 'Recycling rate (%)',
    services: 'Service access score',
    geographic: 'Land area (acres)',
    police: 'Incidents',
  };
  return labels[datasetId] ?? 'Value';
}
