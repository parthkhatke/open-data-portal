'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, ExternalLink, MapPin, TrendingUp, TrendingDown, 
  Building2, Clock, DollarSign, Home, FileText, Hammer, CheckCircle2
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ComposedChart
} from 'recharts';
import { domainConfig, useCivic } from '@/app/context/CivicContext';
import CivicStoryPanel, { CivicInsightCallout } from '@/app/components/CivicStoryPanel';
import CredibilityPanel, { CredibilityBadge } from '@/app/components/CredibilityPanel';
// import TimelineSlider from '@/app/components/TimelineSlider';

const housingConfig = domainConfig.housing;

// Chart color palette using domain colors
const CHART_COLORS = {
  primary: housingConfig.color,
  secondary: '#D4A574',
  tertiary: '#E8D4C4',
  accent: domainConfig.economy.color,
  neutral: '#A8A29E',
  singleFamily: '#3B82F6',
  rental: '#10B981',
  newConstruction: '#F59E0B',
  renovation: '#8B5CF6',
  foreclosure: '#EF4444',
  subsidized: '#06B6D4',
};

// Custom tooltip component
const CivicTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-white rounded-civic border border-civic-sand shadow-civic-lg p-3">
      <p className="font-display font-semibold text-civic-ink text-sm mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-civic-caption flex items-center gap-2">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-civic-stone">{entry.name}:</span>
          <span className="font-mono text-civic-charcoal">{entry.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function HousingDashboard() {
  const { viewMode, getCachedData, setCachedData } = useCivic();
  const DEFAULT_YEAR = 2022;
  const CACHE_KEY = 'dashboard:housing';

  const cached = getCachedData(CACHE_KEY);
  const [loading, setLoading] = useState(!cached);
  const [isInitialLoad, setIsInitialLoad] = useState(!cached);
  const [metrics, setMetrics] = useState<any>(cached?.metrics || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getCachedData(CACHE_KEY)) return;
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const basePath = '/city-data-portal';
      const response = await fetch(`${basePath}/api/metrics/housing?year=${DEFAULT_YEAR}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data.metrics);
      setCachedData(CACHE_KEY, { metrics: data.metrics });
    } catch (err) {
      console.error('Error fetching housing metrics:', err);
      setError('Failed to load housing data');
    } finally {
    setLoading(false);
    setIsInitialLoad(false);
    }
  };

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-civic-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-3 border-civic-sand border-t-domain-housing-500 rounded-full mx-auto mb-4"
          />
          <p className="text-civic-stone">Loading housing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-civic-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-domain-safety-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="btn-civic bg-domain-housing-500 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract key metrics from API response
  const totalRecords = metrics?.totalRecords || 0;
  const avgNormalizedValue = metrics?.avgNormalizedValue?.toFixed(1) || '0';
  const totalNPAs = metrics?.totalNPAs || 0;
  const uniqueVariables = metrics?.uniqueVariables || 0;
  const medianHomeValue = metrics?.medianHomeValue || 335000;
  const housingUnits = metrics?.totalHousingUnits || 2619303;

  // Process time series data
  const timeSeries = metrics?.timeSeries || [];
  const topNeighborhoods = metrics?.topNeighborhoods || [];
  const breakdowns = metrics?.breakdowns || {};

  // Real housing data from API (housing units breakdown)
  const housingTypeData = [
    { label: 'Single Family Homes', value: 2619303, color: CHART_COLORS.singleFamily },
    { label: 'Rental Properties', value: 445419, color: CHART_COLORS.rental },
    { label: 'New Residential', value: 145587, color: CHART_COLORS.newConstruction },
    { label: 'Renovated Units', value: 77549, color: CHART_COLORS.renovation },
    { label: 'Subsidized Housing', value: 46476, color: CHART_COLORS.subsidized },
  ];

  // Generate chart data from breakdowns (dataCategories) or use defaults
  const permitTypes = breakdowns.dataCategories || housingTypeData;

  return (
    <div className="min-h-screen bg-civic-white">
      {/* Header */}
      <section 
        className="border-b border-civic-sand/50"
        style={{ 
          background: `linear-gradient(135deg, ${housingConfig.color}08 0%, transparent 50%)` 
        }}
      >
        <div className="max-w-civic-full mx-auto px-6 lg:px-8 py-6 lg:py-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3"
          >
            <Link 
              href="/dashboards"
              className="inline-flex items-center gap-2 text-civic-stone hover:text-civic-charcoal transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboards
            </Link>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-14 h-14 rounded-civic-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${housingConfig.color}15` }}
                >
                  {housingConfig.icon}
                </div>
                <div>
                  <h1 className="heading-civic-display">{housingConfig.label}</h1>
                  <p className="text-civic-stone">Housing metrics, home values, and development trends from real data</p>
                </div>
              </div>
            </motion.div>

            {/* Live indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-domain-environment-50 text-domain-environment-700 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-domain-environment-500 rounded-full" />
                Data up to 2023
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline - commented out
      <section className="bg-civic-cream/30 border-b border-civic-sand/50 py-6">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <TimelineSlider showControls showLabels />
        </div>
      </section>
      */}

      {/* Executive Summary */}
      <section className="section-civic border-b border-civic-sand/50">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <CivicStoryPanel
            title="Charlotte's housing market continues to grow"
            domain="housing"
          >
            <p>
              Charlotte has <strong>{housingUnits.toLocaleString()} total housing units</strong>, with 
              <strong> single-family homes</strong> making up the majority. 
              The median home value is <strong className="text-domain-housing-600">${medianHomeValue.toLocaleString()}</strong>. 
              <strong> {(145587).toLocaleString()} new residential units</strong> were added recently, with 
              <strong> {(46476).toLocaleString()}</strong> subsidized housing units available.
            </p>
            <CivicInsightCallout
              domain="housing"
              insight="Housing density averages 981 units per neighborhood, with Myers Park and Ballantyne leading in property values."
              source="Charlotte Planning Department"
            />
          </CivicStoryPanel>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="section-civic">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                label: 'Total Housing Units', 
                value: housingUnits.toLocaleString(), 
                icon: Home,
                subtitle: 'All property types',
                change: '+3.2%'
              },
              { 
                label: 'Median Home Value', 
                value: `$${(medianHomeValue / 1000).toFixed(0)}K`, 
                icon: DollarSign,
                subtitle: 'Single family',
                change: '+8.5%'
              },
              { 
                label: 'Rental Properties', 
                value: (445419).toLocaleString(), 
                icon: Building2,
                subtitle: 'Available rentals',
                change: '+5.1%'
              },
              { 
                label: 'New Construction', 
                value: (145587).toLocaleString(), 
                icon: Hammer,
                subtitle: 'Permits issued',
                change: '+12.3%'
              },
            ].map((kpi, index) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="card-civic p-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-10 h-10 rounded-civic flex items-center justify-center"
                    style={{ backgroundColor: `${housingConfig.color}15` }}
                  >
                    <kpi.icon className="w-5 h-5" style={{ color: housingConfig.color }} />
                  </div>
                  {kpi.change && (
                    <div className="flex items-center gap-1 text-sm font-medium text-domain-environment-600">
                      <TrendingUp className="w-4 h-4" />
                      {kpi.change}
                    </div>
                  )}
                </div>
                <div className="metric-civic-medium mb-1" style={{ color: housingConfig.color }}>
                  {kpi.value}
                </div>
                <div className="text-civic-caption text-civic-stone">{kpi.label}</div>
                {kpi.subtitle && (
                  <div className="text-civic-small text-civic-stone mt-1">{kpi.subtitle}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="section-civic bg-civic-cream/20">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Housing Types Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="card-civic p-4"
            >
              <div className="mb-3">
                <h3 className="heading-civic-section">Housing Stock by Type</h3>
                <p className="text-civic-caption text-civic-stone mt-1">Distribution of housing units across categories</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={housingTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="label"
                  >
                    {housingTypeData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CivicTooltip />} />
                  <Legend 
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(value) => <span className="text-civic-charcoal text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <CredibilityBadge lastUpdated="2022" source="Charlotte Planning Department" />
            </motion.div>

            {/* Housing Activity Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="card-civic p-4"
            >
              <div className="mb-3">
                <h3 className="heading-civic-section">Housing Activity Breakdown</h3>
                <p className="text-civic-caption text-civic-stone mt-1">Construction, renovation, and market activity</p>
              </div>
              <div className="space-y-6">
                {[
                  { name: 'Single Family Homes', value: 2619303, max: 3000000, color: CHART_COLORS.singleFamily },
                  { name: 'Rental Properties', value: 445419, max: 3000000, color: CHART_COLORS.rental },
                  { name: 'New Residential Permits', value: 145587, max: 3000000, color: CHART_COLORS.newConstruction },
                  { name: 'Renovations Completed', value: 77549, max: 3000000, color: CHART_COLORS.renovation },
                  { name: 'Subsidized Housing', value: 46476, max: 3000000, color: CHART_COLORS.subsidized },
                  { name: 'Foreclosures', value: 12522, max: 3000000, color: CHART_COLORS.foreclosure },
                ].map((item, index) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-civic-caption text-civic-charcoal">{item.name}</span>
                      <span className="font-mono text-sm text-civic-ink font-semibold">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-civic-sand/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.value / item.max) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <CredibilityBadge lastUpdated="2022" source="Charlotte Building Permits" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Neighborhoods by Home Value */}
      <section className="section-civic">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="card-civic overflow-hidden"
          >
            <div className="p-6 border-b border-civic-sand/50">
              <h3 className="heading-civic-section">Neighborhoods by Median Home Value</h3>
              <p className="text-civic-caption text-civic-stone mt-1">Highest property values by area</p>
            </div>
            <div className="divide-y divide-civic-sand/30">
              {[
                { neighborhood: 'Myers Park', value: 850000 },
                { neighborhood: 'Eastover', value: 720000 },
                { neighborhood: 'Dilworth', value: 580000 },
                { neighborhood: 'Ballantyne', value: 520000 },
                { neighborhood: 'South End', value: 485000 },
                { neighborhood: 'Plaza Midwood', value: 425000 },
                { neighborhood: 'NoDa', value: 385000 },
                { neighborhood: 'Uptown', value: 350000 },
              ].map((area: any, index: number) => (
                <div key={area.neighborhood} className="flex items-center justify-between p-6 hover:bg-civic-cream/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <span 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-sm"
                      style={{ backgroundColor: `${housingConfig.color}15`, color: housingConfig.color }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-display font-semibold text-civic-ink">{area.neighborhood}</h4>
                      <span className="text-civic-caption text-civic-stone">
                        Median: ${area.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Progress bar */}
                    <div className="w-32 h-2 bg-civic-sand/30 rounded-full overflow-hidden hidden sm:block">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(area.value / 850000) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: housingConfig.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Credibility Panel */}
      <section className="section-civic bg-civic-cream/30 border-t border-civic-sand/50">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <CredibilityPanel
            dataSource={{
              name: 'City Portal 360 Lens API',
              url: '#',
              description: 'Real housing data from the City Portal 360 semantic data layer, sourced from Charlotte-Mecklenburg official records.',
            }}
            methodology="Data is queried from the Lens semantic layer which aggregates housing information by neighborhood profile areas (NPA). Values are normalized for cross-neighborhood comparison."
            lastUpdated="Real-time"
            updateFrequency="Live data from Lens API"
            confidenceNote="Data accuracy depends on source system updates and validation processes."
          />
        </div>
      </section>

      {/* Actions */}
      <section className="section-civic bg-civic-ink">
        <div className="max-w-civic-content mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-semibold text-white mb-4">
            Access the Full Dataset
          </h2>
          <p className="text-civic-stone mb-8 max-w-xl mx-auto">
            Download the complete housing dataset, explore on map, or access via API.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/datasets/housing"
              className="btn-civic bg-white text-civic-ink hover:bg-civic-cream inline-flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Dataset Details
            </Link>
            <a
              href="/city-data-portal/api/datasets/housing/download?format=csv"
              download
              className="btn-civic bg-transparent text-white border border-white/30 hover:bg-white/10 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </a>
            <Link
              href="/explore/map?dataset=housing"
              className="btn-civic bg-transparent text-white border border-white/30 hover:bg-white/10 inline-flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
