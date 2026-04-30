'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, Circle, GeoJSON, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { CuratedDataset } from '@/types/dataset';
import { getNeighborhoodInfo } from '@/lib/dataService';
import { getNpaName } from '@/lib/npaNames';
import { getValueLabelForDataset } from '@/lib/mapValueLabels';

const BASE_PATH = '/city-data-portal';

// Primary measure keys per dataset for map value (business-friendly: show the metric that fits the theme).
const PRIMARY_MEASURE_KEYS: Record<string, string[]> = {
  demographics: ['demographics.total_population', 'demographics.avg_raw_value', 'demographics.total_records', 'demographics.avg_normalized_value'],
  environment: ['environment.avg_normalized_value', 'environment.avg_environmental_score', 'environment.avg_tree_canopy', 'environment.total_records'],
  economy: ['economy.avg_income', 'economy.total_records', 'economy.avg_normalized_value'],
  education: ['education.avg_proficiency_score', 'education.avg_normalized_value', 'education.total_records'],
  health: ['health.avg_health_score', 'health.avg_normalized_value', 'health.total_records'],
  housing: ['housing.avg_home_value', 'housing.avg_normalized_value', 'housing.total_records'],
  transportation: ['transportation.avg_transit_access_score', 'transportation.avg_normalized_value', 'transportation.total_records'],
  safety: ['safety.total_incidents', 'safety.total_records', 'safety.avg_safety_score', 'safety.avg_normalized_value'],
  city_services: ['city_services.total_service_requests', 'city_services.avg_normalized_value', 'city_services.total_records'],
  civic_engagement: ['civic_engagement.avg_civic_participation_score', 'civic_engagement.avg_voter_turnout', 'civic_engagement.avg_normalized_value', 'civic_engagement.total_records'],
  utilities: ['utilities.avg_consumption', 'utilities.avg_efficiency_score', 'utilities.avg_normalized_value', 'utilities.total_records'],
  waste_management: ['waste_management.avg_recycling_rate', 'waste_management.avg_normalized_value', 'waste_management.total_records'],
  services: ['services.avg_access_score', 'services.avg_normalized_value', 'services.total_records'],
  geographic: ['geographic.avg_land_area', 'geographic.total_land_area', 'geographic.avg_normalized_value', 'geographic.total_records'],
  police: ['police_npa.total_incidents', 'police_npa.total_crimes', 'police_crime_facts.total_incidents', 'police_crime_facts.total_records'],
};

function getFeatureValue(attributes: Record<string, any>, domain?: string): number {
  if (!attributes || typeof attributes !== 'object') return 0;
  const keys = domain && PRIMARY_MEASURE_KEYS[domain]
    ? PRIMARY_MEASURE_KEYS[domain]
    : [
        `${domain ? `${domain}.` : ''}total_records`,
        `${domain ? `${domain}.` : ''}avg_normalized_value`,
        `${domain ? `${domain}.` : ''}total_population`,
      ];
  const minValue = domain === 'demographics' ? 1 : 0;
  for (const key of keys) {
    const v = attributes[key];
    const n = Number(v);
    if (Number.isFinite(n) && n >= minValue) return n;
  }
  for (const v of Object.values(attributes)) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= minValue) return n;
  }
  return 0;
}

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapViewerV2Props {
  data: Array<{
    attributes: Record<string, any>;
    geometry?: {
      x?: number;
      y?: number;
    };
  }>;
  dataset?: CuratedDataset;
  onMarkerClick?: (feature: any) => void;
  center?: [number, number];
  zoom?: number;
  basemap?: string;
  showLegend?: boolean;
  /** Optional NPA id -> name map from /api/neighborhoods/all for full name coverage */
  npaNamesMap?: Record<number, string>;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Value (0–1) to color: green (low) → red (high)
function valueToColor(t: number): string {
  const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
  const i = Math.min(colors.length - 1, Math.floor(t * colors.length));
  return colors[i];
}

import { persistMapState } from '@/lib/mapState';

/** Saves current zoom & center to localStorage on zoomend / moveend */
function MapStatePersister() {
  const map = useMap();
  useEffect(() => {
    function save() {
      const c = map.getCenter();
      persistMapState(map.getZoom(), c.lat, c.lng);
    }
    map.on('zoomend', save);
    map.on('moveend', save);
    return () => {
      map.off('zoomend', save);
      map.off('moveend', save);
    };
  }, [map]);
  return null;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const initializedRef = useRef(false);
  const prevCenterRef = useRef<[number, number] | null>(null);
  const prevZoomRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Only set view on initial mount or when center/zoom values actually change
    const centerChanged = !prevCenterRef.current || 
      prevCenterRef.current[0] !== center[0] || 
      prevCenterRef.current[1] !== center[1];
    const zoomChanged = prevZoomRef.current !== zoom;
    
    if (!initializedRef.current) {
      // Initial mount - set the view
      map.setView(center, zoom);
      initializedRef.current = true;
    } else if (centerChanged || zoomChanged) {
      // Props actually changed (different coordinates/zoom) - update view
      map.setView(center, zoom);
    }
    // If neither condition is true, preserve current user zoom/pan
    
    prevCenterRef.current = center;
    prevZoomRef.current = zoom;
  }, [map, center[0], center[1], zoom]); // Use primitive values as deps
  
  return null;
}

// Legend Component: NPA districts, value scale
function MapLegend({
  dataset,
  npaCount,
}: {
  dataset?: CuratedDataset;
  npaCount: number;
}) {
  if (!dataset) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000] border border-gray-200 min-w-[200px]">
      <h3 className="font-bold text-sm text-gray-900 mb-3">{dataset.title}</h3>
      <p className="text-xs text-gray-600 mb-2">By NPA (Neighborhood Profile Area)</p>
      <div className="flex items-center gap-2 text-xs mb-2">
        <span className="font-medium text-gray-700">Low</span>
        <div
          className="flex-1 h-3 rounded-full"
          style={{
            background: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)',
          }}
        />
        <span className="font-medium text-gray-700">High</span>
      </div>
      {npaCount > 0 && (
        <div className="flex justify-between text-gray-600 text-xs">
          <span>NPAs:</span>
          <span className="font-semibold text-gray-900">{npaCount}</span>
        </div>
      )}
    </div>
  );
}

// Basemap Switcher Component
function BasemapLayer({ basemap }: { basemap: string }) {
  const map = useMap();
  
  useEffect(() => {
    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    
    // Add new basemap
    let tileLayer: L.TileLayer;
    
    switch (basemap) {
      case 'satellite':
        tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        }) as L.TileLayer;
        break;
      case 'dark':
        tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }) as L.TileLayer;
        break;
      case 'light':
        tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }) as L.TileLayer;
        break;
      default: // osm
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }) as L.TileLayer;
    }
    
    tileLayer.addTo(map);
  }, [map, basemap]);
  
  return null;
}

function getDisplayName(npa: number | null, npaNamesMap?: Record<number, string>, fallbackName?: string): string {
  if (npa == null) return fallbackName ?? 'Unknown';
  return npaNamesMap?.[npa] ?? fallbackName ?? getNpaName(npa);
}

export default function MapViewerV2({ 
  data, 
  dataset,
  onMarkerClick, 
  center = [35.2271, -80.8431], 
  zoom = 11,
  basemap = 'satellite',
  showLegend = true,
  npaNamesMap,
}: MapViewerV2Props) {
  const mapRef = useRef<L.Map | null>(null);
  const [currentBasemap, setCurrentBasemap] = useState(basemap);

  useEffect(() => {
    setCurrentBasemap(basemap);
  }, [basemap]);

  // One district per NPA: aggregate by NPA, use canonical lat/lng and name from getNeighborhoodInfo
  const npaDistricts = useMemo((): Array<{ npa: number; name: string; value: number; lat: number; lng: number; normalized: number }> => {
    if (!data?.length) return [];
    const domain = dataset?.id;
    const byNpa = new Map<number, number>();
    for (const feature of data) {
      const npa = Number(feature.attributes?.npa ?? feature.attributes?.[`${domain}.npa`]);
      if (!Number.isFinite(npa)) continue;
      const value = getFeatureValue(feature.attributes ?? {}, domain);
      const existing = byNpa.get(npa) ?? 0;
      byNpa.set(npa, existing + value);
    }
    const values = Array.from(byNpa.values()).filter((v) => v > 0);
    const minV = values.length ? Math.min(...values) : 0;
    const maxV = values.length ? Math.max(...values) : 1;
    const range = maxV - minV || 1;
    const result: Array<{ npa: number; name: string; value: number; lat: number; lng: number; normalized: number }> = [];
    byNpa.forEach((value, npa) => {
      const info = getNeighborhoodInfo(npa);
      result.push({
        npa,
        name: info.name,
        value,
        lat: info.lat,
        lng: info.lng,
        normalized: range ? (value - minV) / range : 0,
      });
    });
    return result.sort((a, b) => a.npa - b.npa);
  }, [data, dataset?.id]);

  const npaMap = useMemo(() => {
    const m = new Map<number, { name: string; value: number; normalized: number }>();
    npaDistricts.forEach((d) => m.set(d.npa, { name: d.name, value: d.value, normalized: d.normalized }));
    return m;
  }, [npaDistricts]);

  const [boundaries, setBoundaries] = useState<GeoJsonObject | null>(null);
  useEffect(() => {
    fetch(`${BASE_PATH}/api/npa-boundaries`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setBoundaries)
      .catch(() => setBoundaries(null));
  }, []);

  const valueLabel = dataset?.id ? getValueLabelForDataset(dataset.id) : 'Value';

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={true}
      >
        <BasemapLayer basemap={currentBasemap} />
        <MapUpdater center={center} zoom={zoom} />
        <MapStatePersister />
        
        {/* NPA boundaries: polygons from Mecklenburg GeoJSON, colored by value.
            Key includes npaDistricts.length so the GeoJSON is recreated when data
            loads (fixes stale-closure bug where onEachFeature captured an empty npaMap). */}
        {boundaries && (
          <GeoJSON
            key={`npa-boundaries-${dataset?.id ?? 'default'}-${npaDistricts.length}`}
            data={boundaries}
            style={(feature) => {
              const npa = feature?.properties?.id != null ? Number(feature.properties.id) : null;
              const d = npa != null ? npaMap.get(npa) : null;
              return {
                fillColor: d ? valueToColor(d.normalized) : '#e5e7eb',
                color: '#fff',
                weight: 1.5,
                opacity: 1,
                fillOpacity: d ? 0.7 : 0.4,
              };
            }}
            onEachFeature={(feature, layer) => {
              const npa = feature?.properties?.id != null ? Number(feature.properties.id) : null;
              const d = npa != null ? npaMap.get(npa) : null;
              const name = getDisplayName(npa, npaNamesMap, d?.name);
              const value = d?.value ?? 0;
              const content = `<div class="text-sm min-w-[200px]">
                <div class="font-semibold text-gray-900">${escapeHtml(name)}</div>
                <div class="mt-2 text-gray-700">
                  <span class="font-medium">${escapeHtml(valueLabel)}:</span>
                  <span class="font-semibold text-blue-600 ml-1">${value.toLocaleString()}</span>
                </div>
              </div>`;
              layer.bindPopup(content);
              layer.on('click', () => {
                if (onMarkerClick) {
                  onMarkerClick({
                    attributes: {
                      npa: npa ?? 0,
                      npa_name: name,
                      value_label: valueLabel,
                      total_records: value,
                      [dataset?.id ? `${dataset.id}.npa` : 'npa']: npa ?? 0,
                      [dataset?.id ? `${dataset.id}.total_records` : 'total_records']: value,
                    },
                    geometry: {},
                  });
                }
              });
            }}
          />
        )}
        {/* Fallback: circles when boundaries not yet loaded or failed */}
        {!boundaries && npaDistricts.map((d) => {
          const displayName = getDisplayName(d.npa, npaNamesMap, d.name);
          return (
          <Circle
            key={d.npa}
            center={[d.lat, d.lng]}
            radius={1800}
            pathOptions={{
              fillColor: valueToColor(d.normalized),
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.6,
            }}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick({
                    attributes: {
                      npa: d.npa,
                      npa_name: displayName,
                      value_label: valueLabel,
                      total_records: d.value,
                      [dataset?.id ? `${dataset.id}.npa` : 'npa']: d.npa,
                      [dataset?.id ? `${dataset.id}.total_records` : 'total_records']: d.value,
                    },
                    geometry: { x: d.lng, y: d.lat },
                  });
                }
              },
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-semibold text-gray-900">{displayName}</div>
                <div className="mt-2 text-gray-700">
                  <span className="font-medium">{valueLabel}:</span>{' '}
                  <span className="font-semibold text-blue-600">{d.value.toLocaleString()}</span>
                </div>
              </div>
            </Popup>
          </Circle>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      {showLegend && (
        <MapLegend dataset={dataset} npaCount={npaDistricts.length} />
      )}
      
      {/* Loading state overlay - only show when no data */}
      {npaDistricts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-[1000]">
          <div className="text-center p-6">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading map data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
