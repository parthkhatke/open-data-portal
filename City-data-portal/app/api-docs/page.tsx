'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Code, Copy, Check, Database, Key, Globe, Terminal } from 'lucide-react';
import { domainConfig, DomainType } from '../context/CivicContext';

// Lens API URL
const LENS_API_URL = process.env.NEXT_PUBLIC_LENS_API_URL || 'https://known-racer.mydataos.com/lens2/api/public:city-portal-360/v2/load';

// Domain API configurations
const domainApiConfigs: Record<string, { measures: string[]; dimensions: string[]; description: string }> = {
  demographics: {
    measures: [
      'demographics.avg_normalized_value',
      'demographics.avg_raw_value',
      'demographics.population_density_avg',
      'demographics.total_population',
      'demographics.total_records',
      'demographics.unique_npas',
    ],
    dimensions: ['demographics.data_year', 'demographics.normalized_data_name', 'demographics.npa'],
    description: 'Population characteristics, diversity metrics, and demographic trends.',
  },
  housing: {
    measures: [
      'housing.avg_home_value',
      'housing.total_housing_units',
      'housing.max_home_value',
      'housing.min_home_value',
      'housing.avg_housing_density',
      'housing.unique_npas',
    ],
    dimensions: ['housing.npa', 'housing.data_year'],
    description: 'Housing market data including home values and development metrics.',
  },
  economy: {
    measures: [
      'economy.avg_income',
      'economy.median_income_estimate',
      'economy.total_economic_output',
      'economy.unique_npas',
    ],
    dimensions: ['economy.npa', 'economy.data_year'],
    description: 'Economic indicators, employment data, and business activity.',
  },
  education: {
    measures: [
      'education.avg_graduation_rate',
      'education.avg_proficiency_score',
      'education.max_education_score',
      'education.unique_npas',
    ],
    dimensions: ['education.npa', 'education.data_year'],
    description: 'School performance, graduation rates, and educational outcomes.',
  },
  health: {
    measures: [
      'health.avg_health_score',
      'health.avg_life_expectancy',
      'health.max_health_score',
      'health.unique_npas',
    ],
    dimensions: ['health.npa', 'health.data_year'],
    description: 'Public health metrics and healthcare access indicators.',
  },
  environment: {
    measures: [
      'environment.avg_tree_canopy',
      'environment.avg_environmental_score',
      'environment.total_green_area',
      'environment.unique_npas',
    ],
    dimensions: ['environment.npa', 'environment.data_year'],
    description: 'Tree canopy, air quality, and environmental sustainability.',
  },
  transportation: {
    measures: [
      'transportation.avg_transit_access_score',
      'transportation.avg_commute_time',
      'transportation.unique_npas',
    ],
    dimensions: ['transportation.npa', 'transportation.data_year'],
    description: 'Traffic patterns, transit usage, and transportation infrastructure.',
  },
  safety: {
    measures: [
      'safety.avg_crime_rate',
      'safety.avg_safety_score',
      'safety.total_incidents',
      'safety.unique_npas',
    ],
    dimensions: ['safety.npa', 'safety.data_year'],
    description: 'Public safety statistics and emergency response metrics.',
  },
  police: {
    measures: [
      'police_npa.total_homicides',
      'police_npa.total_incidents',
      'police_npa.total_crimes',
      'police_npa.avg_homicide_clearance',
      'police_npa.npa_count',
    ],
    dimensions: ['police_npa.data_year'],
    description: 'CMPD crime statistics and law enforcement data.',
  },
};

function generateCurlCommand(datasetId: string): string {
  const config = domainApiConfigs[datasetId];
  if (!config) {
    return `curl -X POST "${LENS_API_URL}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -d '{
  "query": {
    "measures": [],
    "dimensions": [],
    "limit": 1000
  }
}'`;
  }

  const queryBody = {
    query: {
      measures: config.measures,
      dimensions: config.dimensions,
      limit: 1000,
    }
  };

  return `curl -X POST "${LENS_API_URL}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -d '${JSON.stringify(queryBody, null, 2)}'`;
}

function ApiDocsContent() {
  const searchParams = useSearchParams();
  const datasetId = searchParams.get('dataset') || 'demographics';
  const [copied, setCopied] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(datasetId);

  const config = domainApiConfigs[selectedDataset];
  const domainType = selectedDataset as DomainType;
  const domainStyle = domainConfig[domainType] || domainConfig.economy;
  const curlCommand = generateCurlCommand(selectedDataset);

  useEffect(() => {
    if (datasetId && domainApiConfigs[datasetId]) {
      setSelectedDataset(datasetId);
    }
  }, [datasetId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-civic-white">
      {/* Header */}
      <section className="bg-civic-cream border-b border-civic-sand">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/datasets"
              className="inline-flex items-center gap-2 text-civic-stone hover:text-civic-charcoal transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Datasets
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-civic flex items-center justify-center"
              style={{ backgroundColor: `${domainStyle.color}15` }}
            >
              <Code className="w-5 h-5" style={{ color: domainStyle.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold text-civic-ink">API Documentation</h1>
              <p className="text-civic-stone text-sm">Connect to Charlotte city data programmatically</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-civic-full mx-auto px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Dataset Selection */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-civic-xl border border-civic-sand/50 p-4 sticky top-24"
            >
              <h3 className="font-display font-semibold text-civic-ink mb-3 text-sm">Select Dataset</h3>
              <div className="space-y-1">
                {Object.keys(domainApiConfigs).map((id) => {
                  const style = domainConfig[id as DomainType] || domainConfig.economy;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedDataset(id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedDataset === id
                          ? 'bg-civic-ink text-white'
                          : 'text-civic-charcoal hover:bg-civic-cream'
                      }`}
                    >
                      <span className="capitalize">{id.replace(/_/g, ' ')}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-civic-xl border border-civic-sand/50 p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-civic-stone" />
                <h2 className="font-display text-lg font-semibold text-civic-ink capitalize">
                  {selectedDataset.replace(/_/g, ' ')} API
                </h2>
              </div>
              <p className="text-civic-charcoal mb-4">{config?.description || 'Access city data through our REST API.'}</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-civic-cream/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-civic-stone" />
                    <span className="text-xs text-civic-stone uppercase tracking-wider">Measures</span>
                  </div>
                  <p className="font-semibold text-civic-ink">{config?.measures.length || 0} available</p>
                </div>
                <div className="bg-civic-cream/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Terminal className="w-4 h-4 text-civic-stone" />
                    <span className="text-xs text-civic-stone uppercase tracking-wider">Dimensions</span>
                  </div>
                  <p className="font-semibold text-civic-ink">{config?.dimensions.length || 0} available</p>
                </div>
              </div>
            </motion.div>

            {/* Authentication */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="bg-white rounded-civic-xl border border-civic-sand/50 p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <Key className="w-5 h-5 text-civic-stone" />
                <h2 className="font-display text-lg font-semibold text-civic-ink">Authentication</h2>
              </div>
              <p className="text-civic-charcoal mb-3">
                All API requests require a Bearer token for authentication. Include the token in the Authorization header.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Replace <code className="bg-amber-100 px-1 rounded">&lt;YOUR_API_KEY&gt;</code> with your DataOS Bearer token.
                  Contact the data team to request API access.
                </p>
              </div>
            </motion.div>

            {/* API Example */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-civic-xl border border-civic-sand/50 overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-civic-sand/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-civic-stone" />
                  <h2 className="font-display text-lg font-semibold text-civic-ink">cURL Example</h2>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-civic-cream hover:bg-civic-sand transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 bg-civic-ink overflow-x-auto">
                <pre className="text-sm text-civic-cream font-mono whitespace-pre-wrap">
                  <code>{curlCommand}</code>
                </pre>
              </div>
            </motion.div>

            {/* Available Measures */}
            {config && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="bg-white rounded-civic-xl border border-civic-sand/50 p-5"
              >
                <h2 className="font-display text-lg font-semibold text-civic-ink mb-4">Available Measures</h2>
                <div className="flex flex-wrap gap-2">
                  {config.measures.map((measure) => (
                    <span
                      key={measure}
                      className="px-3 py-1.5 bg-civic-cream rounded-full text-xs font-mono text-civic-charcoal"
                    >
                      {measure}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Available Dimensions */}
            {config && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-civic-xl border border-civic-sand/50 p-5"
              >
                <h2 className="font-display text-lg font-semibold text-civic-ink mb-4">Available Dimensions</h2>
                <div className="flex flex-wrap gap-2">
                  {config.dimensions.map((dimension) => (
                    <span
                      key={dimension}
                      className="px-3 py-1.5 bg-blue-50 rounded-full text-xs font-mono text-blue-700"
                    >
                      {dimension}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Back to Dataset */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex gap-4"
            >
              <Link
                href={`/datasets/${selectedDataset}`}
                className="btn-civic-secondary flex items-center gap-2 py-2.5"
              >
                <Database className="w-4 h-4" />
                View Dataset Details
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function ApiDocsLoading() {
  return (
    <div className="min-h-screen bg-civic-white flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-10 h-10 bg-civic-sand rounded-civic"></div>
        <div className="h-4 w-32 bg-civic-sand rounded"></div>
      </div>
    </div>
  );
}

// Export with Suspense boundary to fix static generation
export default function ApiDocsPage() {
  return (
    <Suspense fallback={<ApiDocsLoading />}>
      <ApiDocsContent />
    </Suspense>
  );
}
