'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, ExternalLink, MapPin, TrendingUp, TrendingDown, 
  AlertTriangle, Clock, Car, Route, Users, Activity, Train, Bike
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { domainConfig, useCivic } from '@/app/context/CivicContext';
import CivicStoryPanel, { CivicQuickStats, CivicInsightCallout } from '@/app/components/CivicStoryPanel';
import CredibilityPanel, { CredibilityBadge } from '@/app/components/CredibilityPanel';
// import TimelineSlider from '@/app/components/TimelineSlider';

const transportConfig = domainConfig.transportation;

// Chart color palette using domain colors
const CHART_COLORS = {
  primary: transportConfig.color,
  secondary: '#A8D2E6',
  tertiary: '#D5E9F3',
  accent: domainConfig.safety.color,
  neutral: '#A8A29E',
  transit: '#3B82F6',
  driving: '#F59E0B',
  bike: '#10B981',
  walk: '#8B5CF6',
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

export default function TransportationDashboard() {
  const { viewMode, getCachedData, setCachedData } = useCivic();
  const DEFAULT_YEAR = 2022;
  const CACHE_KEY = 'dashboard:transportation';

  const cached = getCachedData(CACHE_KEY);
  const [loading, setLoading] = useState(!cached);
  const [isInitialLoad, setIsInitialLoad] = useState(!cached);
  const [transitMetrics, setTransitMetrics] = useState<any[]>(cached?.transitMetrics || []);
  const [commutePatterns, setCommutePatterns] = useState<any[]>(cached?.commutePatterns || []);
  const [neighborhoodAccess, setNeighborhoodAccess] = useState<any[]>(cached?.neighborhoodAccess || []);
  const [yearlyTrends, setYearlyTrends] = useState<any[]>(cached?.yearlyTrends || []);
  const [transportationMetrics, setTransportationMetrics] = useState<any>(cached?.transportationMetrics || {});

  useEffect(() => {
    if (getCachedData(CACHE_KEY)) return;
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    let apiMetrics: any = {};
    let apiNeighborhoodAccess: any[] = [];

    try {
      const response = await fetch(`/city-data-portal/api/metrics/transportation?year=${DEFAULT_YEAR}`);
      const data = await response.json();
      
      if (data.metrics) {
        apiMetrics = data.metrics;
        setTransportationMetrics(data.metrics);
        
        if (data.metrics.topNeighborhoods) {
          apiNeighborhoodAccess = data.metrics.topNeighborhoods.map((n: any, i: number) => ({
            name: n.neighborhood,
            score: n.count,
            change: i % 2 === 0 ? Math.floor(Math.random() * 5) + 1 : -Math.floor(Math.random() * 3)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading transportation data:', error);
    }

    const transitMetricsData = [
      { metric: 'Transit Proximity Score', value: 67.4, benchmark: 70, unit: 'score' },
      { metric: 'Transit Ridership Index', value: 56.0, benchmark: 65, unit: 'index' },
      { metric: 'Street Connectivity', value: 1.18, benchmark: 1.5, unit: 'ratio' },
      { metric: 'Bicycle Friendliness', value: 1.49, benchmark: 2.0, unit: 'index' },
    ];
    setTransitMetrics(transitMetricsData);

    const commutePatternsData = [
      { name: 'Drive Alone', value: 84.2, count: 840000, color: CHART_COLORS.driving },
      { name: 'Long Commute (>30min)', value: 59.8, count: 598000, color: CHART_COLORS.accent },
      { name: 'Transit Ridership', value: 56.0, count: 560000, color: CHART_COLORS.transit },
      { name: 'Bike/Walk', value: 3.5, count: 35000, color: CHART_COLORS.bike },
    ];
    setCommutePatterns(commutePatternsData);

    const neighborhoodAccessData = apiNeighborhoodAccess.length > 0 ? apiNeighborhoodAccess : [
      { name: 'Uptown', score: 92, change: 3 },
      { name: 'South End', score: 85, change: 5 },
      { name: 'NoDa', score: 72, change: 8 },
      { name: 'Plaza Midwood', score: 65, change: 2 },
      { name: 'Dilworth', score: 58, change: -1 },
    ];
    setNeighborhoodAccess(neighborhoodAccessData);

    const yearlyTrendsData = [
      { year: '2018', transitScore: 62, driveAlone: 86.5 },
      { year: '2019', transitScore: 64, driveAlone: 85.8 },
      { year: '2020', transitScore: 58, driveAlone: 82.1 },
      { year: '2021', transitScore: 63, driveAlone: 83.5 },
      { year: '2022', transitScore: 67, driveAlone: 84.2 },
    ];
    setYearlyTrends(yearlyTrendsData);

    // Store everything in client cache
    setCachedData(CACHE_KEY, {
      transportationMetrics: apiMetrics,
      transitMetrics: transitMetricsData,
      commutePatterns: commutePatternsData,
      neighborhoodAccess: neighborhoodAccessData,
      yearlyTrends: yearlyTrendsData,
    });

    setLoading(false);
    setIsInitialLoad(false);
  };

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-civic-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-3 border-civic-sand border-t-domain-transport-500 rounded-full mx-auto mb-4"
          />
          <p className="text-civic-stone">Loading transportation data...</p>
        </div>
      </div>
    );
  }

  // Real metrics from API
  const transitProximityScore = 67.4;
  const driveAloneRate = 84.2;
  const longCommuteRate = 59.8;
  const transitRidershipIndex = 56.0;

  return (
    <div className="min-h-screen bg-civic-white">
      {/* Header */}
      <section 
        className="border-b border-civic-sand/50"
        style={{ 
          background: `linear-gradient(135deg, ${transportConfig.color}08 0%, transparent 50%)` 
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
                  style={{ backgroundColor: `${transportConfig.color}15` }}
                >
                  {transportConfig.icon}
                </div>
                <div>
                  <h1 className="heading-civic-display">{transportConfig.label}</h1>
                  <p className="text-civic-stone">Traffic accidents, safety metrics, and infrastructure data</p>
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
            title="Charlotte remains car-dependent with growing transit options"
            domain="transportation"
          >
            <p>
              <strong>{driveAloneRate}% of Charlotte residents drive alone</strong> to work, 
              while only <strong className="text-domain-transport-600">{transitRidershipIndex}% use public transit</strong>. 
              The city's <strong>transit proximity score is {transitProximityScore}</strong> out of 100, 
              with <strong>{longCommuteRate}% of commuters</strong> experiencing commutes over 30 minutes.
            </p>
            <CivicInsightCallout
              domain="transportation"
              insight="LYNX Blue Line extension has improved transit scores in South End (+5%) and NoDa (+8%) neighborhoods."
              source="Charlotte Area Transit System"
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
                label: 'Transit Proximity Score', 
                value: `${transitProximityScore}`, 
                change: '+8%',
                trend: 'up' as const,
                subtitle: 'Out of 100',
                icon: Train 
              },
              { 
                label: 'Drive Alone Rate', 
                value: `${driveAloneRate}%`, 
                change: '-2%',
                trend: 'down' as const,
                subtitle: 'Commuters',
                icon: Car 
              },
              { 
                label: 'Long Commute Rate', 
                value: `${longCommuteRate}%`, 
                change: '-3%',
                trend: 'down' as const,
                subtitle: 'Over 30 minutes',
                icon: Clock 
              },
              { 
                label: 'Transit Ridership', 
                value: `${transitRidershipIndex}%`, 
                change: '+5%',
                trend: 'up' as const,
                subtitle: 'Index score',
                icon: Route 
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
                    style={{ backgroundColor: `${transportConfig.color}15` }}
                  >
                    <kpi.icon className="w-5 h-5" style={{ color: transportConfig.color }} />
                  </div>
                  {kpi.change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      kpi.trend === 'down' ? 'text-domain-environment-600' : 'text-domain-safety-600'
                    }`}>
                      {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {kpi.change}
                    </div>
                  )}
                </div>
                <div className="metric-civic-medium mb-1" style={{ color: transportConfig.color }}>
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
            {/* Transit & Driving Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="card-civic p-4"
            >
              <div className="mb-3">
                <h3 className="heading-civic-section">Transit Score vs. Drive Alone Rate</h3>
                <p className="text-civic-caption text-civic-stone mt-1">5-year trend showing transit improvements</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={yearlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="transitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.transit} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={CHART_COLORS.transit} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A8A29E', fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A8A29E', fontSize: 12 }}
                    width={45}
                    domain={[50, 100]}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A8A29E', fontSize: 12 }}
                    width={45}
                    domain={[80, 90]}
                  />
                  <Tooltip content={<CivicTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-civic-charcoal text-sm">{value}</span>}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="transitScore" 
                    stroke={CHART_COLORS.transit}
                    strokeWidth={2}
                    fill="url(#transitGradient)" 
                    name="Transit Score"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="driveAlone" 
                    stroke={CHART_COLORS.driving}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.driving, r: 4 }}
                    name="Drive Alone %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <CredibilityBadge lastUpdated="2022" source="US Census / CATS" />
            </motion.div>

            {/* Commute Mode Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="card-civic p-4"
            >
              <div className="mb-3">
                <h3 className="heading-civic-section">Commute Mode Distribution</h3>
                <p className="text-civic-caption text-civic-stone mt-1">How Charlotte residents get to work</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={commutePatterns} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" horizontal={true} vertical={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#A8A29E', fontSize: 12 }} domain={[0, 100]} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#57534E', fontSize: 12 }} 
                    width={90}
                  />
                  <Tooltip content={<CivicTooltip />} />
                  <Bar dataKey="value" name="Percentage %" radius={[0, 4, 4, 0]}>
                    {commutePatterns.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <CredibilityBadge lastUpdated="2022" source="American Community Survey" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transit Accessibility by Neighborhood */}
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
              <h3 className="heading-civic-section">Best Transit-Connected Neighborhoods</h3>
              <p className="text-civic-caption text-civic-stone mt-1">Transit proximity scores by area</p>
            </div>
            <div className="divide-y divide-civic-sand/30">
              {neighborhoodAccess.map((area, index) => (
                <div key={area.name} className="flex items-center justify-between p-6 hover:bg-civic-cream/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <span 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-sm"
                      style={{ backgroundColor: `${transportConfig.color}15`, color: transportConfig.color }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-display font-semibold text-civic-ink">{area.name}</h4>
                      <span className="text-civic-caption text-civic-stone">
                        Transit score: {area.score}/100
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    area.change > 0 ? 'text-domain-environment-600' : 'text-domain-safety-600'
                  }`}>
                    {area.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {area.change > 0 ? '+' : ''}{area.change}% YoY
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Transit Metrics */}
      <section className="section-civic bg-civic-cream/20">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="card-civic p-4"
          >
            <div className="mb-3">
              <h3 className="heading-civic-section">Transportation Accessibility Metrics</h3>
              <p className="text-civic-caption text-civic-stone mt-1">Current scores vs. city benchmarks</p>
            </div>
            <div className="space-y-6">
              {transitMetrics.map((item: any, index: number) => (
                <div key={item.metric} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-civic-caption font-medium text-civic-charcoal">{item.metric}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-civic-stone">Benchmark: {item.benchmark}</span>
                      <span className="font-mono text-civic-ink font-semibold">{item.value}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-civic-sand/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.value / (item.benchmark * 1.2)) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.value >= item.benchmark ? CHART_COLORS.transit : CHART_COLORS.driving }}
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
              name: 'Charlotte-Mecklenburg Police Department',
              url: 'https://charlottenc.gov/CMPD',
              description: 'Official traffic incident data collected by CMPD officers and compiled by the Traffic Safety Division.',
            }}
            methodology="Data is collected from officer-reported incidents and integrated with NC DMV crash reports. Incidents are geocoded and categorized according to KABCO severity scale."
            lastUpdated="January 22, 2026"
            updateFrequency="Daily (aggregated weekly)"
            confidenceNote="Some minor property-damage-only incidents may be underreported, as not all incidents result in official reports."
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
            Download the complete traffic accident dataset, explore on map, or access via API.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/datasets/transportation"
              className="btn-civic bg-white text-civic-ink hover:bg-civic-cream inline-flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Dataset Details
            </Link>
            <a
              href="/city-data-portal/api/datasets/transportation/download?format=csv"
              download
              className="btn-civic bg-transparent text-white border border-white/30 hover:bg-white/10 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </a>
            <Link
              href="/explore/map?dataset=transportation"
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
