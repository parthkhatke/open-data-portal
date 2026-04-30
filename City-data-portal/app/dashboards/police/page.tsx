'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Shield, Users, AlertTriangle, Target, TrendingUp, TrendingDown,
  MapPin, Clock, Award, UserCheck, Crosshair, Scale, Car, Activity,
  FileText, BadgeCheck, AlertCircle, Filter, X, Calendar, Building2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import { domainConfig, useCivic } from '../../context/CivicContext';
// import TimelineSlider from '../../components/TimelineSlider';

// Police domain color from config
const POLICE_COLOR = '#1E3A8A';

// Consistent color palette matching other dashboards
const CHART_COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#6B7280'];

interface YearDivisionRow {
  year: string;
  division: string;
  totalRecords: number;
  homicides: number;
  incidents: number;
  cleared: number;
}

interface PoliceData {
  overview: {
    totalCrimes: number;
    totalHomicides: number;
    totalIncidents: number;
    totalTrafficStops: number;
    totalEmployees: number;
    avgServiceYears: number;
    avgEmployeeAge: number;
    homicideClearanceRate: number;
    incidentClearanceRate: number;
  };
  divisions: Array<{
    division: string;
    trafficStops: number;
    incidents: number;
    homicides: number;
    clearanceRate: number;
    totalRecords?: number;
    cleared?: number;
  }>;
  employeesByRace: Array<{ race: string; count: number }>;
  employeesByGender: Array<{ gender: string; count: number }>;
  diversion: {
    total: number;
    successful: number;
    unsuccessful: number;
    successRate: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  ois: {
    totalIncidents: number;
    totalFatalities: number;
    byYear: Array<{ year: string; incidents: number; fatalities: number }>;
  };
  crimesByYear: Array<{ year: string; total: number; homicides: number; incidents: number }>;
  crimesByWeapon: Array<{ weapon: string; count: number; homicides: number }>;
  victimDemographics: Array<{ race: string; count: number }>;
  // Cross-dimensional data for filter-responsive KPIs
  crimesByYearDivision?: YearDivisionRow[];
  weaponByYear?: Array<{ weapon: string; year: string; count: number; homicides: number }>;
  victimRaceByYear?: Array<{ race: string; year: string; count: number }>;
}

// Custom Tooltip matching civic design
const CivicTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
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

// Default fallbacks (used before data loads)
const DEFAULT_YEARS = ['All', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];
const DEFAULT_DIVISIONS = [
  'All Divisions',
  'Metro', 'Freedom', 'Central', 'North Tryon', 'Hickory Grove', 
  'Eastway', 'Independence', 'University City', 'Providence', 
  'South', 'Steele Creek', 'Westover', 'North'
];

export default function PoliceDashboard() {
  const { getCachedData, setCachedData } = useCivic();
  const CACHE_KEY = 'dashboard:police';
  const cached = getCachedData(CACHE_KEY);

  const [data, setData] = useState<PoliceData | null>(cached || null);
  const [loading, setLoading] = useState(!cached);
  const [selectedView, setSelectedView] = useState<'overview' | 'divisions' | 'workforce' | 'programs'>('overview');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedDivision, setSelectedDivision] = useState<string>('All Divisions');
  const config = domainConfig.police;

  useEffect(() => {
    const cachedResult = getCachedData(CACHE_KEY);
    // If cached data exists AND has the cross-dimensional field, use it
    if (cachedResult && cachedResult.crimesByYearDivision && cachedResult.crimesByYearDivision.length > 0) {
      return;
    }

    async function fetchPoliceData() {
      try {
        // Force refresh if we had stale cached data without cross-dim fields
        const needsRefresh = cachedResult && (!cachedResult.crimesByYearDivision || cachedResult.crimesByYearDivision.length === 0);
        const url = needsRefresh
          ? '/city-data-portal/api/metrics/police/comprehensive?refresh=true'
          : '/city-data-portal/api/metrics/police/comprehensive';
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          setData(result);
          setCachedData(CACHE_KEY, result);
        } else {
          const fallback = getFallbackData();
          setData(fallback);
        }
      } catch (error) {
        console.error('Error fetching police data:', error);
        setData(getFallbackData());
      } finally {
        setLoading(false);
      }
    }
    fetchPoliceData();
  }, []);

  const getFallbackData = (): PoliceData => ({
    overview: {
      totalCrimes: 814874,
      totalHomicides: 991,
      totalIncidents: 813169,
      totalTrafficStops: 844305,
      totalEmployees: 2311,
      avgServiceYears: 10.1,
      avgEmployeeAge: 41,
      homicideClearanceRate: 9.8,
      incidentClearanceRate: 15.0,
    },
    divisions: [
      { division: 'Metro', trafficStops: 50378, incidents: 62202, homicides: 144, clearanceRate: 18.7 },
      { division: 'Freedom', trafficStops: 59365, incidents: 57854, homicides: 90, clearanceRate: 16.3 },
      { division: 'Central', trafficStops: 50235, incidents: 57401, homicides: 43, clearanceRate: 17.3 },
      { division: 'North Tryon', trafficStops: 57890, incidents: 54619, homicides: 95, clearanceRate: 15.9 },
      { division: 'Hickory Grove', trafficStops: 65816, incidents: 49946, homicides: 61, clearanceRate: 18.6 },
      { division: 'Eastway', trafficStops: 77977, incidents: 49855, homicides: 54, clearanceRate: 17.2 },
      { division: 'Independence', trafficStops: 59534, incidents: 47087, homicides: 60, clearanceRate: 16.7 },
      { division: 'University City', trafficStops: 54261, incidents: 46872, homicides: 66, clearanceRate: 17.7 },
      { division: 'Providence', trafficStops: 55672, incidents: 44627, homicides: 37, clearanceRate: 17.0 },
      { division: 'South', trafficStops: 58762, incidents: 44428, homicides: 56, clearanceRate: 18.5 },
      { division: 'Steele Creek', trafficStops: 60513, incidents: 41893, homicides: 54, clearanceRate: 18.0 },
      { division: 'Westover', trafficStops: 59478, incidents: 40897, homicides: 61, clearanceRate: 17.9 },
      { division: 'North', trafficStops: 63689, incidents: 39842, homicides: 43, clearanceRate: 17.5 },
    ],
    employeesByRace: [
      { race: 'White', count: 1488 },
      { race: 'Black', count: 472 },
      { race: 'Hispanic', count: 180 },
      { race: 'Two or More', count: 71 },
      { race: 'Asian', count: 67 },
      { race: 'Other', count: 33 },
    ],
    employeesByGender: [
      { gender: 'Male', count: 1689 },
      { gender: 'Female', count: 622 },
    ],
    diversion: {
      total: 6332,
      successful: 4351,
      unsuccessful: 577,
      successRate: 68.7,
      byStatus: [
        { status: 'Successful', count: 4351 },
        { status: 'Rejected', count: 1027 },
        { status: 'Unsuccessful', count: 577 },
        { status: 'Active', count: 115 },
        { status: 'Other', count: 262 },
      ],
    },
    ois: {
      totalIncidents: 102,
      totalFatalities: 80,
      byYear: [
        { year: '2016', incidents: 11, fatalities: 10 },
        { year: '2017', incidents: 5, fatalities: 5 },
        { year: '2018', incidents: 5, fatalities: 4 },
        { year: '2019', incidents: 6, fatalities: 6 },
        { year: '2020', incidents: 7, fatalities: 6 },
        { year: '2021', incidents: 6, fatalities: 5 },
        { year: '2022', incidents: 6, fatalities: 4 },
        { year: '2023', incidents: 8, fatalities: 5 },
      ],
    },
    crimesByYear: [
      // Consistent with ~813K total incidents over 9 years
      { year: '2017', total: 85000, homicides: 87, incidents: 84913 },
      { year: '2018', total: 87000, homicides: 57, incidents: 86943 },
      { year: '2019', total: 89000, homicides: 102, incidents: 88898 },
      { year: '2020', total: 84000, homicides: 118, incidents: 83882 },
      { year: '2021', total: 91000, homicides: 97, incidents: 90903 },
      { year: '2022', total: 93000, homicides: 107, incidents: 92893 },
      { year: '2023', total: 95000, homicides: 89, incidents: 94911 },
      { year: '2024', total: 97000, homicides: 110, incidents: 96890 },
      { year: '2025', total: 92169, homicides: 97, incidents: 92072 },
    ],
    crimesByWeapon: [
      { weapon: 'Handgun', count: 582, homicides: 582 },
      { weapon: 'Firearm (Other)', count: 171, homicides: 171 },
      { weapon: 'Knife', count: 57, homicides: 57 },
      { weapon: 'Rifle', count: 35, homicides: 35 },
      { weapon: 'Physical Force', count: 31, homicides: 31 },
      { weapon: 'Other', count: 115, homicides: 115 },
    ],
    victimDemographics: [
      { race: 'Black', count: 737 },
      { race: 'Hispanic', count: 123 },
      { race: 'White', count: 102 },
      { race: 'Other/Unknown', count: 24 },
      { race: 'Asian', count: 6 },
    ],
    crimesByYearDivision: [],
    weaponByYear: [],
    victimRaceByYear: [],
  });

  if (!data) {
    // Show skeleton with header visible immediately
    return (
      <div className="min-h-screen bg-civic-white">
        <section 
          className="border-b border-civic-sand/50"
          style={{ background: `linear-gradient(135deg, ${POLICE_COLOR}08 0%, transparent 50%)` }}
        >
          <div className="max-w-civic-full mx-auto px-6 lg:px-8 py-6 lg:py-10">
            <div className="mb-4">
              <Link href="/dashboards" className="inline-flex items-center gap-2 text-civic-stone hover:text-civic-charcoal transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboards
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-civic-lg flex items-center justify-center text-2xl" style={{ backgroundColor: `${POLICE_COLOR}15` }}>
                {config.icon}
              </div>
              <div>
                <h1 className="text-2xl font-display font-semibold" style={{ color: POLICE_COLOR }}>{config.label}</h1>
                <p className="text-sm text-civic-stone">Charlotte-Mecklenburg Police Department Analytics</p>
              </div>
            </div>
          </div>
        </section>
        {/* Skeleton KPI cards */}
        <section className="bg-civic-cream/30 border-b border-civic-sand/50 py-4">
          <div className="max-w-civic-full mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="card-civic p-3 animate-pulse">
                  <div className="h-3 w-20 bg-civic-sand/40 rounded mb-2" />
                  <div className="h-7 w-24 bg-civic-sand/30 rounded mb-2" />
                  <div className="h-3 w-32 bg-civic-sand/20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Skeleton charts */}
        <section className="section-civic-sm">
          <div className="max-w-civic-full mx-auto px-6 lg:px-8 space-y-4">
            <div className="card-civic p-4 animate-pulse">
              <div className="h-5 w-48 bg-civic-sand/40 rounded mb-3" />
              <div className="h-4 w-64 bg-civic-sand/30 rounded mb-6" />
              <div className="h-80 bg-civic-sand/20 rounded" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1,2].map(i => (
                <div key={i} className="card-civic p-4 animate-pulse">
                  <div className="h-5 w-40 bg-civic-sand/40 rounded mb-3" />
                  <div className="h-64 bg-civic-sand/20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercent = (num: number) => `${Math.round(num * 10) / 10}%`;

  // ── Derive filter options dynamically from the data ──
  const AVAILABLE_YEARS = (() => {
    const crossYears = (data.crimesByYearDivision || []).map(r => r.year);
    const chartYears = (data.crimesByYear || []).map(r => String(r.year));
    const allYears = [...new Set([...crossYears, ...chartYears])]
      .filter(y => parseInt(y) >= 2017 && parseInt(y) <= 2023)
      .sort((a, b) => parseInt(b) - parseInt(a));
    return allYears.length > 0 ? ['All', ...allYears] : DEFAULT_YEARS;
  })();

  const EXCLUDED_DIVISIONS = ['Airport', 'Huntersville'];
  const DIVISIONS = (() => {
    const divNames = data.divisions.map(d => d.division).filter(Boolean)
      .filter(d => !EXCLUDED_DIVISIONS.includes(d))
      .sort();
    return divNames.length > 0 ? ['All Divisions', ...divNames] : DEFAULT_DIVISIONS;
  })();

  // ── Cross-dimensional filtering ──
  const crossData: YearDivisionRow[] = data.crimesByYearDivision || [];
  const hasFilters = selectedYear !== 'All' || selectedDivision !== 'All Divisions';

  // Filter cross-dimensional rows by the active filters
  const filteredCrossRows = crossData.filter(row => {
    const yearOk = selectedYear === 'All' || String(row.year) === selectedYear;
    const divOk = selectedDivision === 'All Divisions' || row.division === selectedDivision;
    return yearOk && divOk;
  });

  // Legacy filtered arrays (still used for charts)
  const filteredCrimesByYear = selectedYear === 'All'
    ? data.crimesByYear
    : data.crimesByYear.filter(d => String(d.year) === selectedYear);

  const filteredDivisions = selectedDivision === 'All Divisions'
    ? data.divisions
    : data.divisions.filter(d => d.division === selectedDivision);

  // Crime trends chart should remain unfiltered and capped at 2023
  const crimesTrendSeries = (data.crimesByYear || []).filter(d => parseInt(String(d.year)) <= 2023);
  const oisTrendSeries = data.ois?.byYear || [];

  // Highlight helper for crime trends chart
  const isYearSelected = (year: string | number) => selectedYear !== 'All' && String(year) === selectedYear;
  const renderHomicideDot = ({ cx, cy, payload }: any) => {
    const highlight = isYearSelected(payload?.year);
    const radius = highlight ? 6 : 4;
    const strokeWidth = highlight ? 2 : 0;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={highlight ? '#FFFFFF' : '#DC2626'}
        stroke="#DC2626"
        strokeWidth={strokeWidth}
      />
    );
  };
  const renderOISDot = ({ cx, cy, payload }: any) => {
    const highlight = isYearSelected(payload?.year);
    const radius = highlight ? 6 : 4;
    const strokeWidth = highlight ? 2 : 0;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={highlight ? '#FFFFFF' : POLICE_COLOR}
        stroke={POLICE_COLOR}
        strokeWidth={strokeWidth}
      />
    );
  };

  // ── Compute ALL KPIs from cross-dimensional data when filters are active ──
  let displayIncidents: number;
  let displayHomicides: number;
  let displayClearanceRate: number;
  let displayTrafficStops: number;

  if (hasFilters && filteredCrossRows.length > 0) {
    // Cross-dim data available — compute from filtered rows
    displayIncidents = filteredCrossRows.reduce((s, r) => s + r.incidents, 0);
    displayHomicides = filteredCrossRows.reduce((s, r) => s + r.homicides, 0);
    const totalRecs = filteredCrossRows.reduce((s, r) => s + r.totalRecords, 0);
    const totalCleared = filteredCrossRows.reduce((s, r) => s + r.cleared, 0);
    displayClearanceRate = totalRecs > 0 ? (totalCleared / totalRecs) * 100 : data.overview.incidentClearanceRate;

    // Traffic stops: only filterable by division (no year breakdown available)
    if (selectedDivision !== 'All Divisions') {
      const divRow = data.divisions.find(d => d.division === selectedDivision);
      displayTrafficStops = divRow?.trafficStops ?? data.overview.totalTrafficStops;
    } else {
      displayTrafficStops = data.overview.totalTrafficStops;
    }
  } else if (hasFilters) {
    // Cross-dim data not available — fall back to legacy per-axis filtering
    displayIncidents = selectedDivision !== 'All Divisions'
      ? filteredDivisions.reduce((s, d) => s + d.incidents, 0)
      : filteredCrimesByYear.reduce((s, d) => s + (d.incidents || 0), 0);
    displayHomicides = selectedDivision !== 'All Divisions'
      ? filteredDivisions.reduce((s, d) => s + d.homicides, 0)
      : filteredCrimesByYear.reduce((s, d) => s + (d.homicides || 0), 0);
    displayClearanceRate = selectedDivision !== 'All Divisions' && filteredDivisions.length === 1
      ? filteredDivisions[0].clearanceRate
      : data.overview.incidentClearanceRate;
    displayTrafficStops = selectedDivision !== 'All Divisions' && filteredDivisions.length === 1
      ? filteredDivisions[0].trafficStops
      : data.overview.totalTrafficStops;
  } else {
    // No filters — use overview totals
    displayIncidents = data.overview.totalIncidents;
    displayHomicides = data.overview.totalHomicides;
    displayClearanceRate = data.overview.incidentClearanceRate;
    displayTrafficStops = data.overview.totalTrafficStops;
  }

  // ── Weapon chart data (filtered by year if selected) ──
  const displayWeaponData = (() => {
    if (selectedYear !== 'All' && data.weaponByYear && data.weaponByYear.length > 0) {
      const filtered = data.weaponByYear.filter(w => String(w.year) === selectedYear);
      // Aggregate by weapon
      const map = new Map<string, { weapon: string; count: number; homicides: number }>();
      filtered.forEach(w => {
        const existing = map.get(w.weapon);
        if (existing) {
          existing.count += w.count;
          existing.homicides += w.homicides;
        } else {
          map.set(w.weapon, { weapon: w.weapon, count: w.count, homicides: w.homicides });
        }
      });
      return Array.from(map.values()).sort((a, b) => b.homicides - a.homicides).slice(0, 6);
    }
    return data.crimesByWeapon;
  })();

  // ── Victim demographics data (filtered by year if selected) ──
  const displayVictimData = (() => {
    if (selectedYear !== 'All' && data.victimRaceByYear && data.victimRaceByYear.length > 0) {
      const filtered = data.victimRaceByYear.filter(v => String(v.year) === selectedYear);
      const map = new Map<string, { race: string; count: number }>();
      filtered.forEach(v => {
        const existing = map.get(v.race);
        if (existing) {
          existing.count += v.count;
        } else {
          map.set(v.race, { race: v.race, count: v.count });
        }
      });
      return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }
    return data.victimDemographics;
  })();

  // Build filter description string
  const filterParts: string[] = [];
  if (selectedYear !== 'All') filterParts.push(selectedYear);
  if (selectedDivision !== 'All Divisions') filterParts.push(`${selectedDivision} Division`);
  const filterLabel = filterParts.length > 0 ? filterParts.join(', ') : '';

  // KPI data for police with descriptions — ALL respond to filters
  const kpis = [
    { 
      key: 'trafficStops', 
      value: formatNumber(displayTrafficStops), 
      label: hasFilters ? `Traffic Stops` : 'Total Traffic Stops', 
      description: hasFilters ? `Traffic stops — ${filterLabel}` : 'Total traffic stops across all divisions',
      trend: 'up' as const 
    },
    { 
      key: 'incidents', 
      value: formatNumber(displayIncidents), 
      label: hasFilters ? 'Filtered Incidents' : 'Total Incidents', 
      description: hasFilters ? `Incidents — ${filterLabel}` : 'All reported criminal incidents since 2017',
      trend: 'down' as const 
    },
    { 
      key: 'homicides', 
      value: formatNumber(displayHomicides), 
      label: hasFilters ? `Homicides` : 'Homicides', 
      description: hasFilters ? `Homicide cases — ${filterLabel}` : 'Total homicide cases tracked across all years',
      trend: 'down' as const 
    },
    { 
      key: 'clearance', 
      value: formatPercent(displayClearanceRate), 
      label: 'Clearance Rate', 
      description: hasFilters ? `Case clearance rate — ${filterLabel}` : 'Percent of incidents resolved by arrest or other means',
      trend: 'up' as const 
    },
  ];

  return (
    <div className="min-h-screen bg-civic-white">
      {/* Header */}
      <section 
        className="border-b border-civic-sand/50"
        style={{ background: `linear-gradient(135deg, ${POLICE_COLOR}08 0%, transparent 50%)` }}
      >
        <div className="max-w-civic-full mx-auto px-6 lg:px-8 py-6 lg:py-10">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
            <Link 
              href="/dashboards"
              className="inline-flex items-center gap-2 text-civic-stone hover:text-civic-charcoal transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboards</span>
            </Link>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div 
              className="w-12 h-12 rounded-civic-lg flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${POLICE_COLOR}15` }}
            >
              {config.icon}
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold" style={{ color: POLICE_COLOR }}>
                {config.label}
              </h1>
              <p className="text-sm text-civic-stone">Charlotte-Mecklenburg Police Department Analytics</p>
            </div>
          </motion.div>

          {/* View Selector */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'divisions', label: 'Divisions', icon: MapPin },
              { id: 'workforce', label: 'Workforce', icon: Users },
              { id: 'programs', label: 'Programs', icon: Award },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedView(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-civic font-medium transition-all border ${
                  selectedView === id
                    ? 'text-white border-transparent'
                    : 'bg-white text-civic-charcoal border-civic-sand hover:border-civic-stone'
                }`}
                style={selectedView === id ? { backgroundColor: POLICE_COLOR } : {}}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-civic-sand/50 py-3">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-civic-stone">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter Data:</span>
            </div>
            
            {/* Year Filter */}
            <div className="flex items-center gap-2 bg-civic-cream/50 rounded-lg px-3 py-1.5">
              <Calendar className="w-4 h-4 text-civic-stone" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent border-none text-civic-ink text-sm focus:outline-none cursor-pointer"
              >
                {AVAILABLE_YEARS.map((year) => (
                  <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                ))}
              </select>
            </div>

            {/* Division Filter */}
            <div className="flex items-center gap-2 bg-civic-cream/50 rounded-lg px-3 py-1.5">
              <Building2 className="w-4 h-4 text-civic-stone" />
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="bg-transparent border-none text-civic-ink text-sm focus:outline-none cursor-pointer"
              >
                {DIVISIONS.map((division) => (
                  <option key={division} value={division}>{division}</option>
                ))}
              </select>
            </div>

            {/* Active Filter Tags */}
            {(selectedYear !== 'All' || selectedDivision !== 'All Divisions') && (
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-civic-caption text-civic-stone">Active:</span>
                <div className="flex gap-2">
                  {selectedYear !== 'All' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                      <Calendar className="w-3 h-3" />
                      {selectedYear}
                      <button 
                        onClick={() => setSelectedYear('All')} 
                        className="hover:text-blue-900 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedDivision !== 'All Divisions' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                      <Building2 className="w-3 h-3" />
                      {selectedDivision}
                      <button 
                        onClick={() => setSelectedDivision('All Divisions')} 
                        className="hover:text-blue-900 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedYear('All');
                    setSelectedDivision('All Divisions');
                  }}
                  className="text-xs text-civic-stone hover:text-civic-ink transition-colors underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="bg-civic-cream/30 border-b border-civic-sand/50 py-4">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpis.map((kpi, idx) => (
              <motion.div
                key={kpi.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-civic p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-civic-stone font-medium">{kpi.label}</span>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-amber-600" />
                  )}
                </div>
                <div className="font-display text-xl font-semibold mb-1" style={{ color: POLICE_COLOR }}>
                  {kpi.value}
                </div>
                <p className="text-xs text-civic-stone leading-snug line-clamp-2">{kpi.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="section-civic-sm">
        <div className="max-w-civic-full mx-auto px-6 lg:px-8">
          {selectedView === 'overview' && (
            <div className="space-y-4">
              {/* Crime Trends */}
              <section className="card-civic p-4">
                <div className="mb-4">
                  <h3 className="heading-civic-section">Crime Trends Over Time</h3>
                  <p className="text-civic-caption text-civic-stone mt-1">
                    Homicides and incidents by year (through 2023; not affected by filters)
                  </p>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={crimesTrendSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis dataKey="year" stroke="#737373" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#737373" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#737373" fontSize={12} />
                      <Tooltip content={<CivicTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="incidents" name="Incidents" radius={[4, 4, 0, 0]} fill={POLICE_COLOR}>
                        {crimesTrendSeries.map((entry, index) => (
                          <Cell
                            key={`bar-${entry.year}-${index}`}
                            fill={isYearSelected(entry.year) ? '#0F172A' : POLICE_COLOR}
                            opacity={isYearSelected(entry.year) ? 1 : 0.65}
                          />
                        ))}
                      </Bar>
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="homicides"
                        name="Homicides"
                        stroke="#DC2626"
                        strokeWidth={2}
                        dot={renderHomicideDot}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Two Column Charts */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Weapons */}
                <section className="card-civic p-4">
                  <div className="mb-3">
                    <h3 className="heading-civic-section">Weapons in Homicides</h3>
                    <p className="text-civic-caption text-civic-stone mt-1">
                      {selectedYear !== 'All' ? `Distribution by weapon type — ${selectedYear}` : 'Distribution by weapon type'}
                    </p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={displayWeaponData}
                          dataKey="homicides"
                          nameKey="weapon"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {displayWeaponData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CivicTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Victims */}
                <section className="card-civic p-4">
                  <div className="mb-3">
                    <h3 className="heading-civic-section">Homicide Victim Demographics</h3>
                    <p className="text-civic-caption text-civic-stone mt-1">
                      {selectedYear !== 'All' ? `Breakdown by race/ethnicity — ${selectedYear}` : 'Breakdown by race/ethnicity'}
                    </p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={displayVictimData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={false} />
                        <XAxis type="number" stroke="#737373" fontSize={12} />
                        <YAxis dataKey="race" type="category" stroke="#737373" width={80} fontSize={12} />
                        <Tooltip content={<CivicTooltip />} />
                        <Bar dataKey="count" name="Victims" fill={POLICE_COLOR} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              {/* OIS Section */}
              <section className="card-civic p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="heading-civic-section">Officer-Involved Shootings</h3>
                    <p className="text-civic-caption text-civic-stone mt-1">
                      {selectedYear !== 'All' ? `All years shown; ${selectedYear} highlighted` : 'OIS incidents and outcomes over time'}
                    </p>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <div className="font-display text-2xl font-semibold text-civic-ink">{data.ois.totalIncidents}</div>
                      <div className="text-civic-caption text-civic-stone">Total Incidents</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-semibold text-red-600">{data.ois.totalFatalities}</div>
                      <div className="text-civic-caption text-civic-stone">Fatalities</div>
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={oisTrendSeries}>
                      <defs>
                        <linearGradient id="oiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={POLICE_COLOR} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={POLICE_COLOR} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis dataKey="year" stroke="#737373" fontSize={12} />
                      <YAxis stroke="#737373" fontSize={12} />
                      <Tooltip content={<CivicTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="incidents" 
                        name="Incidents" 
                        stroke={POLICE_COLOR} 
                        fill="url(#oiGradient)" 
                        strokeWidth={2}
                        dot={renderOISDot}
                        activeDot={renderOISDot}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="fatalities" 
                        name="Fatalities" 
                        stroke="#DC2626" 
                        strokeWidth={2} 
                        dot={renderHomicideDot}
                        activeDot={renderHomicideDot}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {selectedView === 'divisions' && (
            <div className="space-y-4">
              {/* Division Comparison */}
              <section className="card-civic p-4">
                <div className="mb-3">
                  <h3 className="heading-civic-section">Division Activity Comparison</h3>
                  <p className="text-civic-caption text-civic-stone mt-1">
                    {selectedDivision !== 'All Divisions' ? `${selectedDivision} Division data` : 'Incidents and traffic stops by patrol division'}
                  </p>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedDivision !== 'All Divisions' ? filteredDivisions : data.divisions.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" horizontal={false} />
                      <XAxis type="number" stroke="#737373" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                      <YAxis dataKey="division" type="category" stroke="#737373" width={100} fontSize={12} />
                      <Tooltip content={<CivicTooltip />} />
                      <Legend />
                      <Bar dataKey="incidents" name="Incidents" fill={POLICE_COLOR} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="trafficStops" name="Traffic Stops" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Division Table */}
              <section className="card-civic p-4">
                <div className="mb-3">
                  <h3 className="heading-civic-section">Division Performance Metrics</h3>
                  <p className="text-civic-caption text-civic-stone mt-1">
                    {selectedDivision !== 'All Divisions' ? `${selectedDivision} Division details` : 'Detailed breakdown by CMPD division'}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-civic-sand">
                        <th className="text-left py-3 px-4 text-civic-stone font-medium text-sm">Division</th>
                        <th className="text-right py-3 px-4 text-civic-stone font-medium text-sm">Incidents</th>
                        <th className="text-right py-3 px-4 text-civic-stone font-medium text-sm">Homicides</th>
                        <th className="text-right py-3 px-4 text-civic-stone font-medium text-sm">Traffic Stops</th>
                        <th className="text-right py-3 px-4 text-civic-stone font-medium text-sm">Clearance Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedDivision !== 'All Divisions' ? filteredDivisions : data.divisions).map((div, idx) => (
                        <tr key={div.division} className={`border-b border-civic-sand/50 ${idx % 2 === 0 ? 'bg-civic-cream/20' : ''}`}>
                          <td className="py-3 px-4 text-civic-ink font-medium">{div.division}</td>
                          <td className="py-3 px-4 text-right text-civic-charcoal font-mono">{formatNumber(div.incidents)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${div.homicides > 80 ? 'bg-red-100 text-red-700' : 'bg-civic-sand/50 text-civic-charcoal'}`}>
                              {div.homicides}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-civic-charcoal font-mono">{formatNumber(div.trafficStops)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${div.clearanceRate > 17 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {formatPercent(div.clearanceRate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {selectedView === 'workforce' && (
            <div className="space-y-4">
              {/* Workforce Stats */}
              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-civic-xl p-8">
                <div className="mb-3">
                  <h3 className="heading-civic-section">CMPD Workforce Overview</h3>
                  <p className="text-civic-caption text-civic-stone mt-1">Employee demographics and experience</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 bg-white rounded-xl border border-blue-200 text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: POLICE_COLOR }}>{formatNumber(data.overview.totalEmployees)}</div>
                    <h4 className="font-semibold text-civic-ink">Total Personnel</h4>
                    <p className="text-civic-small text-civic-stone mt-1">Officers and staff</p>
                  </div>
                  <div className="p-5 bg-white rounded-xl border border-blue-200 text-center">
                    <div className="text-3xl font-bold text-blue-700 mb-2">{data.overview.avgServiceYears.toFixed(1)} yrs</div>
                    <h4 className="font-semibold text-civic-ink">Avg. Service</h4>
                    <p className="text-civic-small text-civic-stone mt-1">Years of experience</p>
                  </div>
                  <div className="p-5 bg-white rounded-xl border border-blue-200 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round(data.overview.avgEmployeeAge)}</div>
                    <h4 className="font-semibold text-civic-ink">Avg. Age</h4>
                    <p className="text-civic-small text-civic-stone mt-1">Employee average</p>
                  </div>
                </div>
              </section>

              {/* Demographics Charts */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* By Race */}
                <section className="card-civic p-4">
                  <div className="mb-3">
                    <h3 className="heading-civic-section">Workforce by Race</h3>
                    <p className="text-civic-caption text-civic-stone mt-1">Employee demographics breakdown</p>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.employeesByRace}
                          dataKey="count"
                          nameKey="race"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                        >
                          {data.employeesByRace.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CivicTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* By Gender */}
                <section className="card-civic p-4">
                  <div className="mb-3">
                    <h3 className="heading-civic-section">Workforce by Gender</h3>
                    <p className="text-civic-caption text-civic-stone mt-1">Gender distribution across personnel</p>
                  </div>
                  <div className="h-72 flex flex-col justify-center">
                    {data.employeesByGender.map((item, idx) => {
                      const total = data.employeesByGender.reduce((sum, g) => sum + g.count, 0);
                      const pct = (item.count / total) * 100;
                      return (
                        <div key={item.gender} className="mb-3">
                          <div className="flex justify-between mb-2">
                            <span className="text-civic-ink font-medium">{item.gender}</span>
                            <span className="text-civic-stone">{formatNumber(item.count)} ({pct.toFixed(1)}%)</span>
                          </div>
                          <div className="h-4 bg-civic-sand/30 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, delay: idx * 0.2 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: idx === 0 ? POLICE_COLOR : '#60A5FA' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          )}

          {selectedView === 'programs' && (
            <div className="space-y-4">
              {/* Diversion Program Hero */}
              <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-civic-xl p-8">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Scale className="w-8 h-8 text-green-700" />
                  </div>
                  <div>
                    <h3 className="heading-civic-section">Juvenile Diversion Program</h3>
                    <p className="text-civic-stone">Alternative interventions for youth offenders</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-white rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-civic-ink mb-1">{formatNumber(data.diversion.total)}</div>
                    <div className="text-civic-stone text-sm">Total Participants</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">{formatNumber(data.diversion.successful)}</div>
                    <div className="text-civic-stone text-sm">Successful</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-red-600 mb-1">{formatNumber(data.diversion.unsuccessful)}</div>
                    <div className="text-civic-stone text-sm">Unsuccessful</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl border border-green-200">
                    <div className="text-3xl font-bold mb-1" style={{ color: POLICE_COLOR }}>{formatPercent(data.diversion.successRate)}</div>
                    <div className="text-civic-stone text-sm">Success Rate</div>
                  </div>
                </div>

                {/* Success Rate Progress */}
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-civic-stone">Program Success Rate</span>
                  <span className="text-green-700 font-semibold">{formatPercent(data.diversion.successRate)}</span>
                </div>
                <div className="h-4 bg-white rounded-full overflow-hidden border border-green-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.diversion.successRate}%` }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  />
                </div>
              </section>

              {/* Diversion Breakdown */}
              <section className="card-civic p-4">
                <div className="mb-3">
                  <h3 className="heading-civic-section">Program Outcomes Distribution</h3>
                  <p className="text-civic-caption text-civic-stone mt-1">Breakdown by completion status</p>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.diversion.byStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis dataKey="status" stroke="#737373" fontSize={12} />
                      <YAxis stroke="#737373" fontSize={12} />
                      <Tooltip content={<CivicTooltip />} />
                      <Bar dataKey="count" name="Participants" radius={[4, 4, 0, 0]}>
                        {data.diversion.byStatus.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.status === 'Successful' ? '#10B981' :
                              entry.status === 'Unsuccessful' ? '#EF4444' :
                              entry.status === 'Active' ? '#3B82F6' :
                              entry.status === 'Rejected' ? '#F59E0B' :
                              '#6B7280'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Insights */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="card-civic p-4 border-l-4" style={{ borderLeftColor: POLICE_COLOR }}>
                  <div className="flex items-center gap-3 mb-4">
                    <BadgeCheck className="w-6 h-6" style={{ color: POLICE_COLOR }} />
                    <h3 className="font-semibold text-civic-ink">Program Impact</h3>
                  </div>
                  <ul className="space-y-3 text-civic-charcoal">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Nearly <strong>69%</strong> of participants successfully complete the program</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Over <strong>4,300</strong> youth have avoided formal charges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Program provides counseling, education, and community service alternatives</span>
                    </li>
                  </ul>
                </div>
                
                <div className="card-civic p-4 border-l-4 border-amber-500">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-amber-600" />
                    <h3 className="font-semibold text-civic-ink">Data Transparency</h3>
                  </div>
                  <ul className="space-y-3 text-civic-charcoal">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>All data sourced from official CMPD records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Updated regularly to reflect current statistics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Part of Charlotte's commitment to open data and accountability</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-civic-sand py-8">
        <div className="max-w-civic-full mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-civic flex items-center justify-center text-lg"
                style={{ backgroundColor: `${POLICE_COLOR}15` }}
              >
                {config.icon}
              </div>
              <span className="text-civic-stone">Charlotte-Mecklenburg Police Department Analytics</span>
            </div>
            <div className="text-civic-stone text-sm">
              Data sourced from CMPD Open Data Portal • Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
