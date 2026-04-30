import { NextResponse } from 'next/server';

const NPA_GEOJSON_URL =
  'https://raw.githubusercontent.com/mecklenburg-gis/mecklenburg-gis-opendata/master/data/neighborhood_profile_areas.geojson';

// Do not use Next.js data cache for this response (file is >2MB). Rely on Cache-Control only.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(NPA_GEOJSON_URL, {
      headers: { Accept: 'application/geo+json, application/json' },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Boundaries unavailable' }, { status: 502 });
    }
    const geojson = await res.json();
    return NextResponse.json(geojson, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (e) {
    console.error('NPA boundaries fetch error:', e);
    return NextResponse.json({ error: 'Boundaries unavailable' }, { status: 502 });
  }
}
