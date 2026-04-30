'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { DomainType, domainConfig, useCivic } from '../context/CivicContext';
// import TimelineSlider from '../components/TimelineSlider';

interface DashboardConfig {
  id: string;
  domain: DomainType;
  datasetId: string;
  href: string;
  description: string;
  metricKey: string;
  metricLabel: string;
  metricFormat: 'number' | 'currency' | 'percent' | 'time' | 'raw';
}

const dashboardConfigs: DashboardConfig[] = [
  // Priority dashboards: Demographics, Police, Transportation, Environment, Public Safety, Health
  {
    id: 'demographics',
    domain: 'demographics',
    datasetId: 'demographics',
    href: '/dashboards/demographics',
    description: 'Population demographics including age distribution, race, ethnicity, household composition, and population density by neighborhood.',
    metricKey: 'totalPopulation',
    metricLabel: 'Total Population',
    metricFormat: 'number',
  },
  {
    id: 'police',
    domain: 'police',
    datasetId: 'police',
    href: '/dashboards/police',
    description: 'CMPD crime statistics, officer-involved incidents, traffic stops, juvenile diversion programs, and division-level metrics.',
    metricKey: 'clearanceRate',
    metricLabel: 'Clearance Rate',
    metricFormat: 'percent',
  },
  {
    id: 'transportation',
    domain: 'transportation',
    datasetId: 'transportation',
    href: '/dashboards/transportation',
    description: 'Transportation metrics including transit access, commute patterns, walkability, and connectivity.',
    metricKey: 'avgCommuteTime',
    metricLabel: 'Avg Commute',
    metricFormat: 'time',
  },
  {
    id: 'environment',
    domain: 'environment',
    datasetId: 'environment',
    href: '/dashboards/environment',
    description: 'Environmental metrics including tree canopy coverage, impervious surfaces, park access, and air quality.',
    metricKey: 'avgTreeCanopyCoverage',
    metricLabel: 'Tree Canopy',
    metricFormat: 'percent',
  },
  {
    id: 'safety',
    domain: 'safety',
    datasetId: 'safety',
    href: '/dashboards/safety',
    description: 'Public safety metrics including crime rates, emergency response times, and safety scores.',
    metricKey: 'crimesClearanceRate',
    metricLabel: 'Clearance Rate',
    metricFormat: 'percent',
  },
  {
    id: 'health',
    domain: 'health',
    datasetId: 'health',
    href: '/dashboards/health',
    description: 'Health metrics including birth outcomes, mortality rates, healthcare access, and public health assistance.',
    metricKey: 'avgLifeExpectancy',
    metricLabel: 'Life Expectancy',
    metricFormat: 'raw',
  },
  // Remaining dashboards
  {
    id: 'economy',
    domain: 'economy',
    datasetId: 'economy',
    href: '/dashboards/economy',
    description: 'Economic indicators including median household income, employment rates, business density, and commercial activity.',
    metricKey: 'medianHouseholdIncome',
    metricLabel: 'Median Income',
    metricFormat: 'currency',
  },
  {
    id: 'education',
    domain: 'education',
    datasetId: 'education',
    href: '/dashboards/education',
    description: 'Education metrics including graduation rates, test proficiency, school proximity, and educational attainment.',
    metricKey: 'avgGraduationRate',
    metricLabel: 'Graduation Rate',
    metricFormat: 'percent',
  },
  {
    id: 'housing',
    domain: 'housing',
    datasetId: 'housing',
    href: '/dashboards/housing',
    description: 'Housing metrics including density, age of housing stock, ownership rates, median prices, and code violations.',
    metricKey: 'medianHomeValue',
    metricLabel: 'Median Home Value',
    metricFormat: 'currency',
  },
  {
    id: 'city-services',
    domain: 'city_services',
    datasetId: 'city_services',
    href: '/dashboards/city-services',
    description: 'City services metrics including 311 request volume, response times, and land use patterns.',
    metricKey: 'totalServiceRequests',
    metricLabel: 'Service Requests',
    metricFormat: 'number',
  },
  {
    id: 'civic-engagement',
    domain: 'civic_engagement',
    datasetId: 'civic_engagement',
    href: '/dashboards/civic-engagement',
    description: 'Civic engagement metrics including voter participation, community organizations, and public meeting attendance.',
    metricKey: 'avgVoterTurnoutRate',
    metricLabel: 'Voter Turnout',
    metricFormat: 'percent',
  },
  {
    id: 'utilities',
    domain: 'utilities',
    datasetId: 'utilities',
    href: '/dashboards/utilities',
    description: 'Utility consumption metrics including water, electricity, natural gas, and internet connectivity.',
    metricKey: 'broadbandAccessPct',
    metricLabel: 'Broadband Access',
    metricFormat: 'percent',
  },
  {
    id: 'waste-management',
    domain: 'waste_management',
    datasetId: 'waste_management',
    href: '/dashboards/waste-management',
    description: 'Waste management metrics including solid waste volume, recycling participation, and composting rates.',
    metricKey: 'avgRecyclingRate',
    metricLabel: 'Recycling Rate',
    metricFormat: 'percent',
  },
  {
    id: 'geographic',
    domain: 'geographic',
    datasetId: 'geographic',
    href: '/dashboards/geographic',
    description: 'Land area and geographic measurements for neighborhoods including total acreage and zoning distribution.',
    metricKey: 'totalLandAreaAcres',
    metricLabel: 'Total Land Area',
    metricFormat: 'number',
  },
];

// Format metric value based on type
function formatMetricValue(value: number | undefined, format: string): string {
  if (value === undefined || value === null) return '—';
  
  switch (format) {
    case 'number':
      return value >= 1000000 
        ? `${(value / 1000000).toFixed(1)}M`
        : value >= 1000 
          ? `${(value / 1000).toFixed(0)}K`
          : value.toLocaleString();
    case 'currency':
      return value >= 1000000
        ? `$${(value / 1000000).toFixed(1)}M`
        : value >= 1000
          ? `$${(value / 1000).toFixed(0)}K`
          : `$${value.toLocaleString()}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'time':
      return `${value.toFixed(1)} min`;
    default:
      return typeof value === 'number' ? value.toFixed(1) : String(value);
  }
}

export default function DashboardsPage() {
  const { getCachedData, setCachedData } = useCivic();
  const DEFAULT_YEAR = 2022;
  const CACHE_KEY = 'dashboards-index';

  // Initialize from cache if available
  const cached = getCachedData(CACHE_KEY);
  const [metricsData, setMetricsData] = useState<Record<string, any>>(cached || {});
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    // Skip fetch if we already have cached data
    if (getCachedData(CACHE_KEY)) return;

    const fetchAllMetrics = async () => {
      setLoading(true);
      const basePath = '/city-data-portal';
      
      try {
        const fetchPromises = dashboardConfigs.map(async (config) => {
          try {
            const response = await fetch(`${basePath}/api/metrics/${config.datasetId}?year=${DEFAULT_YEAR}`);
            if (response.ok) {
              const data = await response.json();
              return { id: config.id, metrics: data.metrics };
            }
          } catch (err) {
            console.error(`Error fetching ${config.id}:`, err);
          }
          return { id: config.id, metrics: null };
        });

        const results = await Promise.all(fetchPromises);
        
        const metricsMap: Record<string, any> = {};
        results.forEach((result) => {
          if (result.metrics) {
            metricsMap[result.id] = result.metrics;
          }
        });
        
        setMetricsData(metricsMap);
        setCachedData(CACHE_KEY, metricsMap);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-civic-white">
      {/* Header */}
      <section className="bg-civic-cream/30 border-b border-civic-sand/50 py-6 lg:py-8">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="data-label mb-3 block">Civic Intelligence</span>
            <h1 className="heading-civic-display mb-4">Dashboards</h1>
            <p className="body-civic-large text-civic-stone max-w-2xl mb-8">
              Comprehensive views into Charlotte's civic domains. Each dashboard provides 
              curated metrics, visualizations, and insights updated with the latest available data.
            </p>
            
            {/* Timeline - commented out
            <div className="max-w-xl">
              <TimelineSlider showControls showLabels />
            </div>
            */}
          </motion.div>
        </div>
      </section>

      {/* Featured Police Dashboard */}
      <section className="py-8 lg:py-12 border-b border-civic-sand/50" style={{ background: 'linear-gradient(135deg, #1E3A8A08 0%, #1E3A8A03 100%)' }}>
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <Link href="/dashboards/police" className="block group">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-civic-xl bg-white border-2 border-[#1E3A8A]/20 hover:border-[#1E3A8A]/40 hover:shadow-civic-lg transition-all p-8 lg:p-10"
            >
              {/* Accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1E3A8A]" />
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 pl-4">
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-16 h-16 rounded-civic-lg flex items-center justify-center text-3xl" style={{ backgroundColor: '#1E3A8A15' }}>
                    👮
                  </div>
                  <div>
                    <span className="text-[#1E3A8A] text-sm font-medium uppercase tracking-wider">Featured Dashboard</span>
                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-civic-ink mt-1">Charlotte-Mecklenburg Police</h2>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-civic-charcoal text-lg leading-relaxed">
                    Comprehensive law enforcement analytics including crime trends, division performance, 
                    officer demographics, juvenile diversion programs, and officer-involved incidents.
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#1E3A8A]">2,311</div>
                    <div className="text-civic-stone text-sm">Officers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">991</div>
                    <div className="text-civic-stone text-sm">Homicides Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">69%</div>
                    <div className="text-civic-stone text-sm">Diversion Success</div>
                  </div>
                  <ArrowRight className="w-8 h-8 text-[#1E3A8A] group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Dashboard Grid */}
      <section className="section-civic">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <div className="grid gap-4">
            {dashboardConfigs.filter(d => d.id !== 'police').map((dashboard, index) => {
              const config = domainConfig[dashboard.domain];
              const metrics = metricsData[dashboard.id];
              const metricValue = metrics?.[dashboard.metricKey];
              const formattedValue = formatMetricValue(metricValue, dashboard.metricFormat);
              
              // Determine trend based on year (simplified - could be enhanced with previous year comparison)
              const trend: 'up' | 'down' | 'neutral' = dashboard.metricFormat === 'percent' && metricValue > 50 ? 'up' : 
                           dashboard.metricFormat === 'time' ? 'neutral' : 
                           dashboard.metricFormat === 'percent' && metricValue < 30 ? 'down' : 'up';
              
              return (
                <motion.article
                  key={dashboard.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Link href={dashboard.href} className="block group">
                    <div 
                      className="relative overflow-hidden bg-white rounded-civic-xl border border-civic-sand/50 hover:border-civic-stone/30 hover:shadow-civic-lg transition-all duration-rail-slow"
                    >
                      {/* Domain accent */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: config.color }}
                      />

                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-8 pl-10">
                        {/* Icon and Title */}
                        <div className="flex items-center gap-4 lg:w-64 flex-shrink-0">
                          <div 
                            className="w-14 h-14 rounded-civic-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${config.color}15` }}
                          >
                            {config.icon}
                          </div>
                          <div>
                            <h2 className="font-display text-xl font-semibold text-civic-ink group-hover:text-domain-transport-600 transition-colors">
                              {config.label}
                            </h2>
                            <div className="flex items-center gap-1 text-civic-small text-civic-stone mt-0.5">
                              <Clock className="w-3 h-3" />
                              {DEFAULT_YEAR} Data
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="flex-1 text-civic-charcoal text-sm leading-relaxed">
                          {dashboard.description}
                        </p>

                        {/* Key Metric */}
                        <div className="lg:w-48 flex-shrink-0 lg:text-right">
                          <div className="flex items-center lg:justify-end gap-2">
                            {loading ? (
                              <div className="w-16 h-8 bg-civic-sand/30 rounded animate-pulse" />
                            ) : (
                              <>
                                {trend === 'up' && (
                                  <TrendingUp className="w-5 h-5 text-domain-environment-500" />
                                )}
                                {trend === 'down' && (
                                  <TrendingDown className="w-5 h-5 text-domain-environment-500" />
                                )}
                                <span 
                                  className="font-display text-2xl font-semibold"
                                  style={{ color: config.color }}
                                >
                                  {formattedValue}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="text-civic-small text-civic-stone">{dashboard.metricLabel}</span>
                        </div>

                        {/* Arrow */}
                        <div className="hidden lg:flex items-center justify-center w-10 h-10 flex-shrink-0">
                          <ArrowRight 
                            className="w-5 h-5 text-civic-stone group-hover:text-civic-ink group-hover:translate-x-1 transition-all duration-rail"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="section-civic bg-civic-cream/30 border-t border-civic-sand/50">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <h2 className="heading-civic-section mb-8">Quick Access</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/datasets"
              className="p-6 bg-white rounded-civic-lg border border-civic-sand/50 hover:border-civic-stone/30 hover:shadow-civic transition-all duration-rail group"
            >
              <h3 className="font-display font-semibold text-civic-ink mb-2 group-hover:text-domain-transport-600 transition-colors">
                Data Catalog
              </h3>
              <p className="text-civic-caption text-civic-stone">
                Browse all available datasets
              </p>
            </Link>

            <Link
              href="/explore/map"
              className="p-6 bg-white rounded-civic-lg border border-civic-sand/50 hover:border-civic-stone/30 hover:shadow-civic transition-all duration-rail group"
            >
              <h3 className="font-display font-semibold text-civic-ink mb-2 group-hover:text-domain-transport-600 transition-colors">
                Map Explorer
              </h3>
              <p className="text-civic-caption text-civic-stone">
                Visualize data geographically
              </p>
            </Link>

            <Link
              href="/reports"
              className="p-6 bg-white rounded-civic-lg border border-civic-sand/50 hover:border-civic-stone/30 hover:shadow-civic transition-all duration-rail group"
            >
              <h3 className="font-display font-semibold text-civic-ink mb-2 group-hover:text-domain-transport-600 transition-colors">
                Reports
              </h3>
              <p className="text-civic-caption text-civic-stone">
                Pre-built civic analyses
              </p>
            </Link>

            <Link
              href="api-docs?dataset=demographics"
              className="p-6 bg-white rounded-civic-lg border border-civic-sand/50 hover:border-civic-stone/30 hover:shadow-civic transition-all duration-rail group"
            >
              <h3 className="font-display font-semibold text-civic-ink mb-2 group-hover:text-domain-transport-600 transition-colors">
                API Access
              </h3>
              <p className="text-civic-caption text-civic-stone">
                Build with Charlotte data
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
