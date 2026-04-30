# Charlotte Open Data Portal v2

## Product Requirements Document (PRD)

### Vision
Build a modern, map-first, insight-driven v2 portal that improves on the existing Charlotte Open Data Portal (ArcGIS Hub). The new portal prioritizes civic value, resident-friendly insights, and "data product" thinking with curated themes, clear freshness/owners, and easy API access.

### Goals
1. **Modern UX and Accessibility**: Clean, responsive design that works across devices with WCAG compliance
2. **Civic Value**: Resident-friendly insights that make data actionable for everyday citizens
3. **Data Product Thinking**: Curated themes, clear freshness indicators, ownership, and easy API access
4. **Map-Centric Exploration**: Interactive maps as the primary exploration mechanism
5. **Insight-First Dashboards**: Executive summaries, trends, outliers, and actionable visualizations

### Personas

#### 1. **Residents** (Primary)
- **Needs**: Understand neighborhood safety, services, and trends
- **Goals**: Make informed decisions about where to live, what to expect in their area
- **Pain Points**: Data is too technical, hard to find relevant information

#### 2. **Businesses/Developers** (Secondary)
- **Needs**: Access to clean APIs, bulk downloads, integration-ready data
- **Goals**: Build applications, conduct analysis, integrate data into business processes
- **Pain Points**: Inconsistent API formats, lack of documentation

#### 3. **City Operations** (Secondary)
- **Needs**: Monitor service delivery, identify trends, track KPIs
- **Goals**: Improve service delivery, identify areas needing attention
- **Pain Points**: Data scattered across systems, hard to get holistic view

#### 4. **Researchers** (Tertiary)
- **Needs**: Historical data, trends, downloadable datasets
- **Goals**: Conduct research, publish findings, inform policy
- **Pain Points**: Data freshness unclear, metadata incomplete

### MVP Scope

#### A) Homepage
- Audience entry cards: Residents, Businesses/Developers, City Operations, Researchers
- Topic entry cards: Public Safety, Housing & Development, Transportation, Environment, City Services
- "Search data" + quick links (Dashboards, Map Explorer, Data Catalog, API)

#### B) Map Explorer (Most Important)
- Default view: Interactive map of Charlotte
- Filter panel: time range, neighborhood, category/theme, dataset
- On map click: Contextual insights panel (KPIs + charts + "view in dashboard" + "download/API")
- Support multiple layers and legend

#### C) Insight-First Dashboards (by Theme)
Each theme dashboard includes:
- Executive Summary (auto-generated from metrics in plain language)
- Top trends (YoY/period-over-period)
- Outliers (neighborhoods or areas with highest change)
- Charts + Map module + table
- Download CSV + link to dataset API endpoints

#### D) Neighborhood Page (High Impact)
Dedicated page per neighborhood with tabs/sections:
- Safety (incidents summary + trends)
- Housing (permits/new builds if available)
- Services (311 volume + SLA)
- Environment (if available)
- Includes map + KPI cards + "compare to citywide"

#### E) Data Catalog
- Search + filters + dataset detail pages
- Dataset detail page shows: description, fields, sample records, freshness, license/terms, API link, download options
- "Use this dataset" code snippet (curl) for API requests

#### F) Natural Language Search (MVP-lite)
- Search box supporting keyword search over datasets + dashboard pages
- "Query suggestions" for common asks (e.g., "311 trends last 12 months")
- Phase-1: Intent routing to dashboards/datasets + optional "AI summary"

### Out of Scope (Future Phases)

1. **Full NLQ to Data**: Direct natural language queries that generate SQL/API calls (Phase 2)
2. **User Accounts**: Personalization, saved searches, alerts (Phase 2)
3. **Data Upload**: Allow citizens to contribute data (Phase 3)
4. **Real-time Streaming**: WebSocket connections for live data (Phase 2)
5. **Advanced Analytics**: Predictive models, ML-based insights (Phase 3)
6. **Mobile Apps**: Native iOS/Android applications (Phase 3)
7. **Multi-language Support**: Internationalization (Phase 2)

### Success Metrics

#### User Engagement
- **Time on Site**: Target 3+ minutes average session
- **Pages per Session**: Target 4+ pages
- **Return Visitor Rate**: Target 30%+ within 30 days

#### Feature Usage
- **Map Explorer**: 40%+ of sessions use map explorer
- **Dashboard Views**: 25%+ of sessions view at least one dashboard
- **Neighborhood Pages**: 15%+ of sessions visit a neighborhood page
- **API Usage**: 10%+ of sessions access API endpoints or download data

#### Data Quality
- **Dataset Freshness**: 90%+ of curated datasets updated within stated freshness period
- **API Uptime**: 99%+ availability
- **Data Completeness**: 95%+ of datasets have required metadata

#### Accessibility
- **WCAG 2.1 AA Compliance**: 100% of pages pass automated and manual audits
- **Mobile Usage**: 40%+ of traffic from mobile devices

### Technical Architecture

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet or Mapbox (client-side rendering)
- **Charts**: Recharts
- **Data Layer**: ArcGIS REST API client with server-side caching
- **Deployment**: Vercel or similar (edge functions for API routes)

### Data Sources

- **Primary**: Charlotte ArcGIS Hub REST services
- **Curated Datasets**: 12+ high-value datasets across themes
- **Neighborhood Boundaries**: From Charlotte GIS services

### References

- Current portal: https://data.charlottenc.gov/
- ArcGIS Hub instance: https://clt.charlotte.opendata.arcgis.com/
- Example datasets:
  - Service Requests 311: https://data.charlottenc.gov/datasets/charlotte::service-requests-311/explore
  - CMPD Incidents: https://data.charlottenc.gov/datasets/charlotte::cmpd-incidents-1/explore

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env.local` file (optional for MVP):

```env
NEXT_PUBLIC_ARCGIS_BASE_URL=https://gis.charlottenc.gov/arcgis/rest/services
```

### Project Structure

```
City-data-portal/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboards/        # Theme dashboards
│   ├── datasets/          # Data catalog
│   ├── explore/           # Map explorer
│   ├── neighborhoods/     # Neighborhood pages
│   └── search/           # Search page
├── components/            # React components
├── datasets/              # Curated datasets JSON
├── lib/                   # Utilities and API clients
├── types/                 # TypeScript types
└── public/                # Static assets
```

---

## Development Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Project setup and configuration
- [x] Curated datasets identification
- [x] ArcGIS REST API client
- [ ] Homepage and navigation
- [ ] Data catalog with search

### Phase 2: Core Features (Week 3-4)
- [ ] Map Explorer
- [ ] Dataset detail pages
- [ ] API proxy endpoints
- [ ] City Services dashboard (311)
- [ ] Public Safety dashboard (CMPD)

### Phase 3: Advanced Features (Week 5-6)
- [ ] Neighborhood pages
- [ ] Natural language search (lite)
- [ ] Download functionality
- [ ] Performance optimization

### Phase 4: Polish (Week 7-8)
- [ ] Accessibility audit and fixes
- [ ] Mobile responsiveness
- [ ] Loading and error states
- [ ] Documentation and testing

---

## License

This project is open source and available under the MIT License.

