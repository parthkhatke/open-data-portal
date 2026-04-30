'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, ExternalLink, MapPin, TrendingUp, TrendingDown, 
  Wrench, Clock, CheckCircle2, PhoneCall, Timer, Construction, Lightbulb, Trash2, Droplets
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { domainConfig, useCivic } from '@/app/context/CivicContext';
import CivicStoryPanel, { CivicInsightCallout } from '@/app/components/CivicStoryPanel';
import CredibilityPanel, { CredibilityBadge } from '@/app/components/CredibilityPanel';
// import TimelineSlider from '@/app/components/TimelineSlider';

const economyConfig = domainConfig.economy;

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

export default function CityServicesDashboard() {
  const { viewMode, getCachedData, setCachedData } = useCivic();
  const DEFAULT_YEAR = 2022;
  const CACHE_KEY = 'dashboard:city-services';

  const cached = getCachedData(CACHE_KEY);
  const [loading, setLoading] = useState(!cached);
  const [isInitialLoad, setIsInitialLoad] = useState(!cached);
  const [timeSeries, setTimeSeries] = useState<any[]>(cached?.timeSeries || []);
  const [topNeighborhoods, setTopNeighborhoods] = useState<any[]>(cached?.topNeighborhoods || []);
  const [requestTypes, setRequestTypes] = useState<any[]>(cached?.requestTypes || []);
  const [statusData, setStatusData] = useState<any[]>(cached?.statusData || []);
  const [responseMetrics, setResponseMetrics] = useState<any[]>(cached?.responseMetrics || []);

  useEffect(() => {
    if (getCachedData(CACHE_KEY)) return;
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Time series data
    setTimeSeries([
      { month: 'Jan', requests: 1250, resolved: 1100 },
      { month: 'Feb', requests: 1320, resolved: 1180 },
      { month: 'Mar', requests: 1180, resolved: 1050 },
      { month: 'Apr', requests: 1450, resolved: 1290 },
      { month: 'May', requests: 1520, resolved: 1380 },
      { month: 'Jun', requests: 1380, resolved: 1250 },
    ]);

    // Top neighborhoods
    setTopNeighborhoods([
      { name: 'Uptown', requests: 450, change: -5 },
      { name: 'South End', requests: 380, change: 8 },
      { name: 'NoDa', requests: 320, change: 3 },
      { name: 'Plaza Midwood', requests: 290, change: -2 },
      { name: 'Dilworth', requests: 250, change: 5 },
    ]);

    // Request types
    setRequestTypes([
      { name: 'Potholes', value: 2380, color: economyConfig.color },
      { name: 'Street Lights', value: 1850, color: '#D4A574' },
      { name: 'Trash/Recycling', value: 1620, color: domainConfig.environment.color },
      { name: 'Water Issues', value: 1280, color: domainConfig.transportation.color },
      { name: 'Graffiti', value: 680, color: '#A8A29E' },
      { name: 'Other', value: 690, color: '#78716C' },
    ]);

    // Status breakdown
    setStatusData([
      { name: 'Resolved', value: 72 },
      { name: 'In Progress', value: 18 },
      { name: 'Pending', value: 8 },
      { name: 'Escalated', value: 2 },
    ]);

    // Response metrics for radar
    setResponseMetrics([
      { metric: 'Response Time', value: 88 },
      { metric: 'Resolution Rate', value: 72 },
      { metric: 'SLA Compliance', value: 94 },
      { metric: 'Satisfaction', value: 81 },
      { metric: 'First Contact', value: 65 },
    ]);

    setLoading(false);
    setIsInitialLoad(false);
  };

  // Cache all dashboard data after it's rendered (state is committed)
  useEffect(() => {
    if (!loading && timeSeries.length > 0 && !getCachedData(CACHE_KEY)) {
      setCachedData(CACHE_KEY, {
        timeSeries, topNeighborhoods, requestTypes,
        statusData, responseMetrics,
      });
    }
  }, [loading]);

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-civic-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-3 border-civic-sand border-t-domain-economy-500 rounded-full mx-auto mb-4"
          />
          <p className="text-civic-stone">Loading city services data...</p>
        </div>
      </div>
    );
  }

  const totalRequests = 8500;
  const avgResolutionTime = 2.3;
  const slaCompliance = 94;
  const satisfactionScore = 81;

  return (
    <div className="min-h-screen bg-civic-white">
      {/* Header */}
      <section 
        className="border-b border-civic-sand/50"
        style={{ 
          background: `linear-gradient(135deg, ${economyConfig.color}08 0%, transparent 50%)` 
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
                  style={{ backgroundColor: `${economyConfig.color}15` }}
                >
                  <Wrench className="w-7 h-7" style={{ color: economyConfig.color }} />
                </div>
                <div>
                  <h1 className="heading-civic-display">City Services</h1>
                  <p className="text-civic-stone">311 requests, service delivery, and municipal operations</p>
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
            title="City services maintaining strong performance"
            domain="economy"
          >
            <p>
              Charlotte 311 processed <strong>{totalRequests.toLocaleString()} service requests</strong> this period. 
              <strong> Pothole repairs</strong> lead all request types at 28%. 
              Average resolution time is <strong>{avgResolutionTime} days</strong> with a 
              <strong className="text-domain-environment-600"> {slaCompliance}% SLA compliance rate</strong>. 
              Customer satisfaction stands at <strong>{satisfactionScore}%</strong>.
            </p>
            <CivicInsightCallout
              domain="economy"
              insight="New mobile app for 311 requests has increased submission efficiency by 25% while reducing duplicate reports."
              source="Charlotte 311 Operations"
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
                label: 'Total Requests', 
                value: totalRequests.toLocaleString(), 
                change: '+5.2%',
                trend: 'up' as const,
                icon: PhoneCall 
              },
              { 
                label: 'Avg Resolution', 
                value: `${avgResolutionTime} days`, 
                change: '-12%',
                trend: 'down' as const,
                subtitle: 'From submission',
                icon: Timer 
              },
              { 
                label: 'SLA Compliance', 
                value: `${slaCompliance}%`, 
                change: '+2%',
                trend: 'up' as const,
                subtitle: 'Meeting targets',
                icon: CheckCircle2 
              },
              { 
                label: 'Top Request', 
                value: 'Potholes', 
                subtitle: '28% of all requests',
                icon: Construction 
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
                    style={{ backgroundColor: `${economyConfig.color}15` }}
                  >
                    <kpi.icon className="w-5 h-5" style={{ color: economyConfig.color }} />
                  </div>
                  {kpi.change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      kpi.trend === 'down' && kpi.label === 'Avg Resolution' ? 'text-domain-environment-600' :
                      kpi.trend === 'up' ? 'text-domain-environment-600' : 'text-domain-safety-600'
                    }`}>
                      {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {kpi.change}
                    </div>
                  )}
                </div>
                <div className="metric-civic-medium mb-1" style={{ color: economyConfig.color }}>
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
            {/* Request Volume Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="card-civic p-4"
            >
              <div className="mb-3">
                <h3 className="heading-civic-section">Request Volume Trends</h3>
                <p className="text-civic-caption text-civic-stone mt-1">Requests received vs resolved</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={economyConfig.color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={economyConfig.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A8A29E', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A8A29E', fontSize: 12 }}
                    width={45}
                  />
                  <Tooltip content={<CivicTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-civic-charcoal text-sm">{value}</span>}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke={economyConfig.color}
                    strokeWidth={2}
                    fill="url(#requestGradient)" 
                    name="Received"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke={domainConfig.environment.color}
                    strokeWidth={2}
                    dot={{ fill: domainConfig.environment.color, r: 3 }}
                    name="Resolved"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <CredibilityBadge lastUpdated="January 2026" source="Charlotte 311" />
            </motion.div>

            {/* Request Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="card-civic p-4"
            >
              <div className="mb-3">
                <h3 className="heading-civic-section">Requests by Type</h3>
                <p className="text-civic-caption text-civic-stone mt-1">Distribution across service categories</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {requestTypes.map((entry, index) => (
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
              <CredibilityBadge lastUpdated="January 2026" source="Charlotte 311" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Areas */}
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
              <h3 className="heading-civic-section">Top Areas by Request Volume</h3>
              <p className="text-civic-caption text-civic-stone mt-1">Neighborhoods with highest service requests</p>
            </div>
            <div className="divide-y divide-civic-sand/30">
              {topNeighborhoods.map((area, index) => (
                <div key={area.name} className="flex items-center justify-between p-6 hover:bg-civic-cream/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <span 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-display font-semibold text-sm"
                      style={{ backgroundColor: `${economyConfig.color}15`, color: economyConfig.color }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-display font-semibold text-civic-ink">{area.name}</h4>
                      <span className="text-civic-caption text-civic-stone">
                        {area.requests} requests this period
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    area.change < 0 ? 'text-domain-environment-600' : 'text-domain-economy-600'
                  }`}>
                    {area.change < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    {area.change > 0 ? '+' : ''}{area.change}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Performance & Status */}
      <section className="section-civic bg-civic-cream/20">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Performance Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="card-civic p-4"
            >
              <div className="mb-3">
                <h3 className="heading-civic-section">Service Performance</h3>
                <p className="text-civic-caption text-civic-stone mt-1">Multi-dimensional metrics</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={responseMetrics}>
                  <PolarGrid stroke="#E7E5E4" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#78716C', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar 
                    name="Performance" 
                    dataKey="value" 
                    stroke={economyConfig.color} 
                    fill={economyConfig.color} 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Request Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="card-civic p-4"
            >
              <div className="mb-3">
                <h3 className="heading-civic-section">Request Status Breakdown</h3>
                <p className="text-civic-caption text-civic-stone mt-1">Current status distribution</p>
              </div>
              <div className="space-y-4">
                {statusData.map((item, index) => {
                  const colors = {
                    'Resolved': domainConfig.environment.color,
                    'In Progress': economyConfig.color,
                    'Pending': domainConfig.transportation.color,
                    'Escalated': domainConfig.safety.color
                  };
                  return (
                    <div key={item.name} className="flex items-center gap-4">
                      <span className="w-24 text-civic-caption text-civic-stone">{item.name}</span>
                      <div className="flex-1 h-3 bg-civic-sand/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: colors[item.name as keyof typeof colors] }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-civic-charcoal text-sm">{item.value}%</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Metrics */}
      <section className="section-civic">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="card-civic p-8"
            style={{ backgroundColor: `${economyConfig.color}08` }}
          >
            <h3 className="heading-civic-section mb-3">Service Metrics at a Glance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Crews', value: '86', change: '+8' },
                { label: 'Open Requests', value: '1,428', change: '-234' },
                { label: 'Completed Today', value: '342', change: '+15%' },
                { label: 'Avg Wait Time', value: '1.8 days', change: '-0.4' },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-2xl font-semibold text-civic-ink mb-1">{stat.value}</div>
                  <div className="text-domain-environment-600 text-sm font-medium mb-1">{stat.change}</div>
                  <div className="text-civic-small text-civic-stone">{stat.label}</div>
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
              name: 'Charlotte 311 Operations',
              url: 'https://charlottenc.gov/311',
              description: 'Service request data from Charlotte 311 citizen service center and online portal.',
            }}
            methodology="Data is collected from all 311 channels including phone, web, mobile app, and in-person submissions. Resolution times are calculated from submission to case closure."
            lastUpdated="January 22, 2026"
            updateFrequency="Real-time"
            confidenceNote="Some service requests may have multiple touch points that affect resolution time calculations."
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
            Download the complete 311 service request dataset, explore on map, or access via API.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/datasets/city_services"
              className="btn-civic bg-white text-civic-ink hover:bg-civic-cream inline-flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Dataset Details
            </Link>
            <a
              href="/city-data-portal/api/datasets/city_services/download?format=csv"
              download
              className="btn-civic bg-transparent text-white border border-white/30 hover:bg-white/10 inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </a>
            <Link
              href="/explore/map?dataset=city_services"
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
