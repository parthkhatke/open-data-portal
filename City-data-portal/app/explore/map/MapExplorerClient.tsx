'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Download, X, MapPin, Search, ChevronDown, Check } from 'lucide-react';
import curatedDatasetsData from '@/datasets/curated_datasets.json';
import { CuratedDataset } from '@/types/dataset';
import { getNpaName } from '@/lib/npaNames';
import { getValueLabelForDataset } from '@/lib/mapValueLabels';
import { getPersistedMapState } from '@/lib/mapState';
import Link from 'next/link';

const HIDDEN_DATASETS = new Set(['economy']);

const curatedDatasets = (curatedDatasetsData as CuratedDataset[]).filter(
  (d) => !HIDDEN_DATASETS.has(d.id)
);

// Theme-based accent colors for dataset items
const THEME_COLORS: Record<string, string> = {
  Community: 'bg-violet-500',
  Economy: 'bg-amber-500',
  Education: 'bg-blue-500',
  Health: 'bg-rose-500',
  'Housing & Development': 'bg-orange-500',
  Environment: 'bg-emerald-500',
  Transportation: 'bg-cyan-500',
  'Public Safety': 'bg-red-500',
  'City Services': 'bg-teal-500',
  Infrastructure: 'bg-slate-500',
  Geographic: 'bg-lime-500',
};

// Build display rows for Feature Details panel.
// Shows only: Area (neighborhood name) + the primary metric value (Population, Health Score, etc.)
function getFeatureDetailRows(attributes: Record<string, any>, datasetId: string): { label: string; value: string }[] {
  if (!attributes || typeof attributes !== 'object') return [];
  const prefix = datasetId ? `${datasetId}.` : '';
  const npaRaw = attributes.npa ?? attributes[`${prefix}npa`];
  const npa = npaRaw != null ? Number(npaRaw) : NaN;
  const valueLabel = getValueLabelForDataset(datasetId);

  const rows: { label: string; value: string }[] = [];

  // 1. Area — neighborhood name
  if (Number.isFinite(npa)) {
    rows.push({ label: 'Area', value: getNpaName(npa) });
  }

  // 2. Primary metric (e.g. "Population: 15,427")
  const metricVal = attributes.total_records ?? attributes[`${prefix}total_records`];
  if (metricVal != null) {
    rows.push({ label: valueLabel, value: Number(metricVal).toLocaleString() });
  }

  return rows;
}

// Dynamically import MapViewerV2 to avoid SSR issues with Leaflet
const MapViewerV2 = dynamic(() => import('@/app/components/MapViewerV2'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapExplorerClient() {
  const searchParams = useSearchParams();
  const datasetFromUrl = searchParams.get('dataset');
  
  // Initialize with dataset from URL if valid, otherwise default to demographics
  const getInitialDataset = () => {
    if (datasetFromUrl && curatedDatasets.find(d => d.id === datasetFromUrl)) {
      return datasetFromUrl;
    }
    // Default to demographics as it's a common starting point
    return 'demographics';
  };

  const [selectedDataset, setSelectedDataset] = useState<string>(getInitialDataset());
  const [datasetSearch, setDatasetSearch] = useState<string>('');
  const [mapData, setMapData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Default: zoom 11 shows whole Charlotte; use persisted state if available
  const CHARLOTTE_CENTER: [number, number] = [35.2271, -80.8431];
  const DEFAULT_ZOOM = 11;
  const persisted = useMemo(() => getPersistedMapState(), []);
  const mapCenter = persisted?.center ?? CHARLOTTE_CENTER;
  const mapZoom = persisted?.zoom ?? DEFAULT_ZOOM;
  const [npaNamesMap, setNpaNamesMap] = useState<Record<number, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setDatasetSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Filter datasets by search term
  const filteredDatasets = useMemo(() => {
    if (!datasetSearch.trim()) return curatedDatasets;
    const searchLower = datasetSearch.toLowerCase();
    return curatedDatasets.filter(
      (d) =>
        d.title.toLowerCase().includes(searchLower) ||
        d.description.toLowerCase().includes(searchLower) ||
        d.theme.toLowerCase().includes(searchLower) ||
        d.id.toLowerCase().includes(searchLower) ||
        getValueLabelForDataset(d.id).toLowerCase().includes(searchLower)
    );
  }, [datasetSearch]);

  // Fetch neighborhood names (real data from API) so all NPAs can show a name on the map
  useEffect(() => {
    const basePath = '/city-data-portal';
    fetch(`${basePath}/api/neighborhoods/all`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (body?.neighborhoods && Array.isArray(body.neighborhoods)) {
          const map: Record<number, string> = {};
          body.neighborhoods.forEach((n: { npa: number; name: string }) => {
            if (n != null && typeof n.npa === 'number' && n.name) map[n.npa] = n.name;
          });
          setNpaNamesMap(map);
        }
      })
      .catch(() => {});
  }, []);

  // Update selected dataset when URL parameter changes
  useEffect(() => {
    const urlDataset = searchParams.get('dataset');
    if (urlDataset && curatedDatasets.find(d => d.id === urlDataset)) {
      setSelectedDataset(urlDataset);
    }
  }, [searchParams]);

  useEffect(() => {
    loadMapData();
  }, [selectedDataset]);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const dataset = curatedDatasets.find((d) => d.id === selectedDataset);
      if (!dataset) {
        setMapData([]);
        setLoading(false);
        return;
      }

      const basePath = '/city-data-portal';
      const apiUrl = `${basePath}/api/datasets/${selectedDataset}`;

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error('Failed to fetch data:', response.status, response.statusText);
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      const features = data.features || [];
      setDataSource(data.source ?? null);
      // If we got empty features, keep previous map data so a bad/empty response doesn't wipe the map
      setMapData((prev) => (features.length > 0 ? features : prev.length > 0 ? prev : []));
    } catch (error) {
      console.error('Error loading map data:', error);
      setDataSource(null);
      setMapData([]);
    } finally {
      setLoading(false);
    }
  };

  const dataset = curatedDatasets.find((d) => d.id === selectedDataset);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex h-screen relative">
        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 bg-white/90 backdrop-blur-lg border-r border-gray-200 overflow-y-auto p-6 shadow-xl z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Dataset Selector */}
                <div ref={dropdownRef}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Dataset
                  </label>

                  {/* Custom Dropdown Trigger */}
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${THEME_COLORS[dataset?.theme ?? ''] ?? 'bg-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {getValueLabelForDataset(selectedDataset)}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Panel */}
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30 relative"
                      >
                        {/* Search inside dropdown */}
                        <div className="p-2 border-b border-gray-100">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={datasetSearch}
                              onChange={(e) => setDatasetSearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white placeholder:text-gray-400"
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Options list */}
                        <div className="max-h-72 overflow-y-auto py-1">
                          {filteredDatasets.length > 0 ? (
                            filteredDatasets.map((ds) => {
                              const isActive = selectedDataset === ds.id;
                              return (
                                  <button
                                  key={ds.id}
                                  onMouseDown={(e) => {
                                    e.preventDefault();            // prevent search input blur race
                                    setSelectedDataset(ds.id);
                                    setDatasetSearch('');
                                    setShowDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                                    isActive
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${THEME_COLORS[ds.theme] ?? 'bg-gray-400'}`} />
                                  <span className="flex-1 text-sm font-medium truncate">
                                    {getValueLabelForDataset(ds.id)}
                                  </span>
                                  {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-3 py-6 text-center text-gray-400">
                              <p className="text-sm">No datasets match</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active dataset info card */}
                {dataset && (
                  <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-900">{dataset.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{dataset.description}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${THEME_COLORS[dataset.theme] ?? 'bg-gray-400'}`} />
                      <span className="text-[11px] text-gray-400 font-medium">{dataset.theme}</span>
                    </div>
                  </div>
                )}

                {/* Live data indicator */}
                {dataSource === 'lens-api' && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <p className="text-xs text-green-700 font-medium">Live data from Lens API</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Area */}
        <div className="flex-1 relative">
          {!showFilters && (
            <button
              onClick={() => setShowFilters(true)}
              className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-lg p-3 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Always keep map mounted to preserve zoom/pan state */}
          <div className="w-full h-full">
            <MapViewerV2
              data={mapData}
              dataset={dataset}
              onMarkerClick={setSelectedFeature}
              center={mapCenter}
              zoom={mapZoom}
              showLegend={true}
              npaNamesMap={Object.keys(npaNamesMap).length > 0 ? npaNamesMap : undefined}
            />
          </div>

          {/* Loading overlay - shown on top of map */}
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center bg-white/90 p-6 rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading map data...</p>
              </div>
            </div>
          )}

          {/* Loading overlay - when no data */}
          {!loading && mapData.length === 0 && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 flex items-center justify-center z-10">
              <div className="text-center p-6">
                <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading map data...</p>
              </div>
            </div>
          )}

          {/* Insights Panel - positioned below map controls */}
          <AnimatePresence>
            {selectedFeature && (
              <motion.div
                initial={{ opacity: 0, x: 400 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 400 }}
                className="absolute top-32 right-4 w-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-6 z-20 max-h-[60vh] overflow-y-auto"
              >
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-900">
                    {selectedFeature.attributes?.npa_name || 'Feature Details'}
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  {getFeatureDetailRows(selectedFeature.attributes || {}, selectedDataset).map(({ label, value }, i) => (
                    <div key={`${label}-${i}`} className="border-b border-gray-100 pb-2 last:border-0">
                      <span className="font-semibold text-gray-700 block mb-1">{label}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-2">
                  <Link
                    href={`/datasets/${selectedDataset}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all text-center shadow-md hover:shadow-lg"
                  >
                    View Dataset
                  </Link>
                  <Link
                    href={`/city-data-portal/api/datasets/${selectedDataset}/download?format=csv`}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all flex items-center justify-center"
                  >
                    <Download className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
