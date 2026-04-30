// Natural Language Processing for query intent detection
// This simulates LLM-like capabilities for understanding user queries

interface QueryIntent {
  type: 'dashboard' | 'dataset' | 'map' | 'neighborhood' | 'comparison' | 'trend' | 'metric';
  theme?: string;
  dataset?: string;
  neighborhood?: string;
  timeRange?: string;
  metric?: string;
  action?: string;
  confidence: number;
}

const neighborhoods = [
  'uptown', 'south end', 'noda', 'plaza midwood', 'dilworth', 'myers park',
  'elizabeth', 'west end', 'east charlotte', 'north charlotte', 'south charlotte',
  'university city', 'ballantyne', 'steele creek', 'huntersville'
];

const themes = {
  'public safety': ['public-safety', 'cmpd_incidents'],
  'safety': ['public-safety', 'cmpd_incidents'],
  'crime': ['public-safety', 'cmpd_incidents'],
  'police': ['public-safety', 'cmpd_incidents'],
  'incidents': ['public-safety', 'cmpd_incidents'],
  
  'city services': ['city-services', 'service_requests_311'],
  '311': ['city-services', 'service_requests_311'],
  'service': ['city-services', 'service_requests_311'],
  'service request': ['city-services', 'service_requests_311'],
  
  'housing': ['housing-development', 'building_permits'],
  'development': ['housing-development', 'building_permits'],
  'permits': ['housing-development', 'building_permits'],
  'building': ['housing-development', 'building_permits'],
  
  'transportation': ['transportation', 'traffic_accidents'],
  'traffic': ['transportation', 'traffic_accidents'],
  'accidents': ['transportation', 'traffic_accidents'],
  
  'environment': ['environment', 'tree_canopy'],
  'tree': ['environment', 'tree_canopy'],
  'canopy': ['environment', 'tree_canopy'],
};

const timePatterns = {
  'last year': { start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), end: new Date() },
  'this year': { start: new Date(new Date().getFullYear(), 0, 1), end: new Date() },
  'last month': { start: new Date(new Date().setMonth(new Date().getMonth() - 1)), end: new Date() },
  'this month': { start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: new Date() },
  'last 6 months': { start: new Date(new Date().setMonth(new Date().getMonth() - 6)), end: new Date() },
  'last 12 months': { start: new Date(new Date().setMonth(new Date().getMonth() - 12)), end: new Date() },
};

export function processNaturalLanguageQuery(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();
  let intent: QueryIntent = {
    type: 'dashboard',
    confidence: 0.5,
  };

  // Detect neighborhood
  const foundNeighborhood = neighborhoods.find(n => lowerQuery.includes(n));
  if (foundNeighborhood) {
    intent.neighborhood = foundNeighborhood;
    intent.type = 'neighborhood';
    intent.confidence += 0.2;
  }

  // Detect theme/dataset
  for (const [keyword, [theme, dataset]] of Object.entries(themes)) {
    if (lowerQuery.includes(keyword)) {
      intent.theme = theme;
      intent.dataset = dataset;
      intent.confidence += 0.3;
      break;
    }
  }

  // Detect time range
  for (const [pattern, range] of Object.entries(timePatterns)) {
    if (lowerQuery.includes(pattern)) {
      intent.timeRange = pattern;
      intent.confidence += 0.1;
      break;
    }
  }

  // Detect action/type
  if (lowerQuery.includes('trend') || lowerQuery.includes('trends')) {
    intent.type = 'trend';
    intent.action = 'trend';
    intent.confidence += 0.2;
  } else if (lowerQuery.includes('show') || lowerQuery.includes('display') || lowerQuery.includes('view')) {
    intent.action = 'show';
    intent.confidence += 0.1;
  } else if (lowerQuery.includes('compare') || lowerQuery.includes('comparison')) {
    intent.type = 'comparison';
    intent.confidence += 0.2;
  } else if (lowerQuery.includes('which') || lowerQuery.includes('where') || lowerQuery.includes('slowest') || lowerQuery.includes('fastest')) {
    intent.type = 'metric';
    intent.confidence += 0.2;
  }

  // Detect metric keywords
  if (lowerQuery.includes('response') || lowerQuery.includes('response time')) {
    intent.metric = 'response_time';
    intent.confidence += 0.2;
  } else if (lowerQuery.includes('rate') || lowerQuery.includes('crime rate')) {
    intent.metric = 'crime_rate';
    intent.confidence += 0.2;
  }

  // If no specific intent detected, default to dashboard search
  if (intent.confidence < 0.5) {
    intent.type = 'dashboard';
  }

  return intent;
}

export function generateResponse(intent: QueryIntent): {
  message: string;
  links: Array<{ label: string; href: string }>;
} {
  const links: Array<{ label: string; href: string }> = [];
  let message = '';

  if (intent.type === 'neighborhood' && intent.neighborhood) {
    const slug = intent.neighborhood.replace(/\s+/g, '-');
    links.push({
      label: `View ${intent.neighborhood} Neighborhood`,
      href: `/neighborhoods/${slug}`,
    });
    message = `I found information about ${intent.neighborhood}.`;
  }

  if (intent.theme) {
    links.push({
      label: `View ${intent.theme.replace('-', ' ')} Dashboard`,
      href: `/dashboards/${intent.theme}`,
    });
    message += ` Here's the ${intent.theme.replace('-', ' ')} dashboard.`;
  }

  if (intent.dataset) {
    links.push({
      label: `View Dataset`,
      href: `/datasets/${intent.dataset}`,
    });
    if (intent.neighborhood) {
      links.push({
        label: `View on Map`,
        href: `/explore/map?dataset=${intent.dataset}&neighborhood=${intent.neighborhood}`,
      });
    } else {
      links.push({
        label: `View on Map`,
        href: `/explore/map?dataset=${intent.dataset}`,
      });
    }
  }

  if (intent.type === 'trend' && intent.theme) {
    message = `Showing trends for ${intent.theme.replace('-', ' ')}${intent.timeRange ? ` (${intent.timeRange})` : ''}.`;
  }

  if (intent.type === 'metric' && intent.metric === 'response_time') {
    message = 'Here are neighborhoods with 311 response time data.';
    links.push({
      label: 'City Services Dashboard',
      href: '/dashboards/city-services',
    });
  }

  if (!message) {
    message = 'I found some relevant results for your query.';
  }

  return { message, links };
}

