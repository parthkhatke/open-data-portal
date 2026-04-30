'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
import { 
  Train, 
  Home, 
  Landmark, 
  TreeDeciduous, 
  Shield,
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
  Leaf,
  Crown,
  MapPin,
  Banknote,
  Plane,
  Palette,
  Sparkles,
  Search,
  ChevronDown,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCivic, DomainType, domainConfig } from './context/CivicContext';

// Charlotte Facts organized by category
const charlotteFacts = {
  identity: [
    { fact: "Charlotte is the largest city in North Carolina.", icon: Crown },
    { fact: "The city was founded in 1768.", icon: Crown },
    { fact: "Charlotte is named after Queen Charlotte of Mecklenburg-Strelitz.", icon: Crown },
    { fact: 'Charlotte is nicknamed "The Queen City."', icon: Crown },
    { fact: "Charlotte sits in Mecklenburg County.", icon: Crown },
    { fact: "The city played a role in the American Revolutionary War.", icon: Crown },
    { fact: "The Mecklenburg Declaration of Independence (1775) is a key local historical claim.", icon: Crown },
    { fact: "Charlotte became a major city relatively late—most growth happened after 1970.", icon: Crown },
    { fact: "The city flag features a crown symbolizing its royal namesake.", icon: Crown },
    { fact: "Charlotte is one of the fastest-growing large cities in the U.S.", icon: Crown },
  ],
  geography: [
    { fact: "Charlotte is located in the southern Piedmont region.", icon: MapPin },
    { fact: "Charlotte is about 2–3 hours from both the Blue Ridge Mountains and the Atlantic coast.", icon: MapPin },
    { fact: "The climate is humid subtropical with hot summers and mild winters.", icon: MapPin },
    { fact: 'The city has many tree-lined neighborhoods, earning a "green city" reputation.', icon: TreeDeciduous },
    { fact: "Lake Norman, the largest man-made lake in North Carolina, is just north of the city.", icon: MapPin },
    { fact: "Several creeks and greenways run through Charlotte.", icon: MapPin },
    { fact: "Spring and fall are considered the most pleasant seasons in Charlotte.", icon: MapPin },
    { fact: "Severe hurricanes rarely hit directly but can bring heavy rain.", icon: MapPin },
  ],
  economy: [
    { fact: "Charlotte is the second-largest banking center in the U.S. after New York City.", icon: Banknote },
    { fact: "Bank of America is headquartered in Charlotte.", icon: Banknote },
    { fact: "Truist Financial has major operations in the city.", icon: Banknote },
    { fact: "Wells Fargo has a significant corporate presence in Charlotte.", icon: Banknote },
    { fact: "The city is a major hub for finance, fintech, and insurance.", icon: Banknote },
    { fact: "Energy, healthcare, and logistics are also major industries.", icon: Banknote },
    { fact: "Charlotte Douglas International Airport is a major economic driver.", icon: Plane },
    { fact: "The city has a strong startup and tech ecosystem.", icon: Banknote },
    { fact: "Many Fortune 500 companies operate offices in Charlotte.", icon: Banknote },
    { fact: "Cost of living is lower than many other large U.S. cities, though rising.", icon: Banknote },
  ],
  transportation: [
    { fact: "Charlotte Douglas International Airport is one of the busiest airports in the world by aircraft movement.", icon: Plane },
    { fact: "Charlotte is a major hub for American Airlines.", icon: Plane },
    { fact: "The LYNX Blue Line light rail connects south Charlotte to Uptown and UNC Charlotte.", icon: Train },
    { fact: 'Uptown is the central business district (not called "downtown").', icon: MapPin },
    { fact: "Interstates I-77 and I-85 intersect near the city.", icon: Train },
    { fact: "The city has an expanding greenway and bike trail network.", icon: Train },
    { fact: "Commuter rail is planned for Charlotte's future.", icon: Train },
  ],
  culture: [
    { fact: "Charlotte is home to the NFL's Carolina Panthers.", icon: Palette },
    { fact: "The NBA's Charlotte Hornets play downtown.", icon: Palette },
    { fact: "NASCAR has deep roots in the Charlotte region.", icon: Palette },
    { fact: "The NASCAR Hall of Fame is located in Uptown.", icon: Palette },
    { fact: "Craft beer is a major part of Charlotte's local culture.", icon: Palette },
    { fact: "The city has a growing food scene, especially Southern and international cuisine.", icon: Palette },
    { fact: "Neighborhoods like NoDa, South End, and Plaza Midwood are cultural hotspots.", icon: Palette },
    { fact: "Charlotte hosts many festivals, races, and outdoor events.", icon: Palette },
    { fact: "Charlotte is known for being clean and well-planned.", icon: Palette },
    { fact: "Charlotte consistently ranks as a popular destination for people relocating within the U.S.", icon: Palette },
  ],
};

// Flatten all facts for random selection
const allFacts = Object.entries(charlotteFacts).flatMap(([category, facts]) =>
  facts.map(f => ({ ...f, category }))
);

// Domain configuration with connections
// Hexagon layout on the right side of the page
// Positions are offsets from center - positive x = right, positive y = down
// Order: Demographics, Police, Environment, Transportation, Housing, then others
const domains: {
  id: DomainType;
  label: string;
  icon: typeof Train;
  description: string;
  position: { x: number; y: number };
  connections: DomainType[];
  stats: { label: string; value: string; trend?: string };
}[] = [
  {
    id: 'demographics',
    label: 'Demographics',
    icon: Users,
    description: 'Population, age, race, and household data',
    position: { x: 35, y: -100 },  // Top center
    connections: ['police', 'housing', 'environment'],
    stats: { label: 'Population', value: '897,720', trend: '+2.1%' },
  },
  {
    id: 'police',
    label: 'Police',
    icon: Shield,
    description: 'Crime data and law enforcement metrics',
    position: { x: 70, y: -65 },  // Top-right
    connections: ['demographics', 'safety', 'transportation'],
    stats: { label: 'Clearance Rate', value: '42%', trend: '+3%' },
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: TreeDeciduous,
    description: 'Sustainability, parks, and natural resources',
    position: { x: 70, y: 5 },   // Right
    connections: ['demographics', 'transportation', 'housing'],
    stats: { label: 'Tree Canopy Coverage', value: '46%', trend: '+2%' },
  },
  {
    id: 'transportation',
    label: 'Transportation',
    icon: Train,
    description: 'Mobility, transit, and road infrastructure',
    position: { x: 35, y: 40 },  // Bottom center
    connections: ['police', 'environment', 'housing'],
    stats: { label: 'Daily Transit Riders', value: '78,400', trend: '+12%' },
  },
  {
    id: 'housing',
    label: 'Housing',
    icon: Home,
    description: 'Development, affordability, and community growth',
    position: { x: 0, y: 5 },  // Left
    connections: ['demographics', 'environment', 'transportation'],
    stats: { label: 'New Permits (2025)', value: '4,821', trend: '+8%' },
  },
  {
    id: 'safety',
    label: 'Public Safety',
    icon: Shield,
    description: 'Emergency services and response times',
    position: { x: 0, y: -65 },  // Top-left
    connections: ['police', 'housing', 'demographics'],
    stats: { label: 'Response Time', value: '4.2 min', trend: '-8%' },
  },
];

// Featured civic insights - aligned with priority dashboards
const insights = [
  {
    title: 'Charlotte Population Trends',
    description: 'Exploring demographic shifts, diversity growth, and neighborhood population density changes across Charlotte.',
    domain: 'demographics' as DomainType,
    href: '/dashboards/demographics',
  },
  {
    title: 'CMPD Crime Analytics',
    description: 'Comprehensive analysis of crime trends, clearance rates, and community policing outcomes by division.',
    domain: 'police' as DomainType,
    href: '/dashboards/police',
  },
  {
    title: 'Urban Tree Canopy Expansion',
    description: 'Environmental impact assessment of the 10,000 trees planted in heat-vulnerable areas.',
    domain: 'environment' as DomainType,
    href: '/dashboards/environment',
  },
];

// Neighborhood type for API response
interface Neighborhood {
  npa: number;
  name: string;
  slug: string;
  population: number;
  records: number;
  score: number;
}

// Light rail motion variants
const railMotion = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
};

export default function HomePage() {
  const router = useRouter();
  const [hoveredDomain, setHoveredDomain] = useState<DomainType | null>(null);
  const { setActiveDomain, residentLens, getCachedData, setCachedData } = useCivic();
  
  // Random Charlotte fact - selected only on client to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  
  // Neighborhood search state
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  useEffect(() => {
    setMounted(true);
    setFactIndex(Math.floor(Math.random() * allFacts.length));
    
    // Cache key and TTL for neighborhoods (30 minutes)
    // CACHE_VERSION must be bumped whenever the upstream data source changes
    // (e.g. switching to npa_names.json with 460 neighborhoods).
    const CACHE_VERSION = 'v2'; // v1 = old 59 NPAs, v2 = npa_names.json 460 NPAs
    const LS_CACHE_KEY = `neighborhoods_cache_${CACHE_VERSION}`;
    const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    const CONTEXT_CACHE_KEY = 'neighborhoods-all';
    
    // Try to load from CivicContext cache first (set by DataPreloader), then localStorage
    const loadNeighborhoods = async () => {
      try {
        // Minimum expected neighborhoods (npa_names.json has 460).
        // If cached data has fewer, treat it as stale / from old schema.
        const MIN_EXPECTED = 400;

        // 1. Check CivicContext cache (populated by DataPreloader)
        const contextCached = getCachedData(CONTEXT_CACHE_KEY);
        if (contextCached?.neighborhoods?.length >= MIN_EXPECTED) {
          setAllNeighborhoods(contextCached.neighborhoods);
          setLoadingNeighborhoods(false);
          return;
        }

        // 2. Check localStorage cache (versioned key)
        const cached = localStorage.getItem(LS_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_TTL;
          
          // Use cached data immediately (faster initial load)
          if (data?.neighborhoods?.length >= MIN_EXPECTED) {
            setAllNeighborhoods(data.neighborhoods);
            setLoadingNeighborhoods(false);
            // Also populate CivicContext cache
            setCachedData(CONTEXT_CACHE_KEY, data);
            // If not expired, we're done
            if (!isExpired) return;
          }
        }
        
        // 3. Fetch fresh data (or if cache was empty/expired)
        const res = await fetch('/city-data-portal/api/neighborhoods/all');
        const freshData = await res.json();
        
        if (freshData.neighborhoods) {
          setAllNeighborhoods(freshData.neighborhoods);
          // Update both caches
          setCachedData(CONTEXT_CACHE_KEY, freshData);
          localStorage.setItem(LS_CACHE_KEY, JSON.stringify({
            data: freshData,
            timestamp: Date.now(),
          }));
        }
        setLoadingNeighborhoods(false);
      } catch (err) {
        console.error('Failed to fetch neighborhoods:', err);
        setLoadingNeighborhoods(false);
      }
    };
    
    loadNeighborhoods();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Rotate facts every 10 seconds
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % allFacts.length);
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [mounted]);
  
  // Filter neighborhoods based on search
  const filteredNeighborhoods = useMemo(() => {
    if (!neighborhoodSearch.trim()) return allNeighborhoods.slice(0, 20);
    const search = neighborhoodSearch.toLowerCase();
    return allNeighborhoods.filter(n => 
      n.name.toLowerCase().includes(search) || 
      String(n.npa).includes(search)
    ).slice(0, 20);
  }, [neighborhoodSearch, allNeighborhoods]);
  
  const handleNeighborhoodSelect = (neighborhood: Neighborhood) => {
    setNeighborhoodSearch('');
    setIsDropdownOpen(false);
    // Pass NPA in query param so the page can fetch data for any neighborhood
    router.push(`/neighborhoods/${neighborhood.slug}?npa=${neighborhood.npa}`);
  };
  
  // Only access the fact after mounting to avoid SSR mismatch
  const randomFact = mounted ? allFacts[factIndex] : null;
  
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      identity: 'History & Identity',
      geography: 'Geography & Climate',
      economy: 'Economy & Business',
      transportation: 'Transportation',
      culture: 'Culture & Lifestyle',
    };
    return labels[category] || category;
  };
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      identity: '#8B5CF6', // purple
      geography: '#10B981', // green
      economy: '#F59E0B', // amber
      transportation: '#3B82F6', // blue
      culture: '#EC4899', // pink
    };
    return colors[category] || '#6B7280';
  };

  const handleDomainHover = useCallback((domain: DomainType | null) => {
    setHoveredDomain(domain);
    setActiveDomain(domain);
  }, [setActiveDomain]);

  const isConnected = useCallback((domainId: DomainType) => {
    if (!hoveredDomain) return false;
    const hovered = domains.find(d => d.id === hoveredDomain);
    return hovered?.connections.includes(domainId) || domainId === hoveredDomain;
  }, [hoveredDomain]);

  const getDomainColor = (domain: DomainType) => domainConfig[domain]?.color || '#1F2937';

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section: Charlotte as a Living System */}
      <section className="relative min-h-[73vh] bg-civic-cream overflow-visible">
        {/* Charlotte Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Logo image */}
          <img 
            src={`${basePath}/logo.png`}
            alt="City of Charlotte Seal"
            className="w-[600px] h-[600px] md:w-[700px] md:h-[700px] lg:w-[800px] lg:h-[800px] object-contain opacity-[0.25]"
          />
          {/* Gradient overlay for left side text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F3EF] via-[#F5F3EF]/70 to-[#F5F3EF]/40" />
        </div>


        {/* Domain nodes - positioned across full page */}
        <div className="absolute inset-0 z-10">
          {domains.map((domain, index) => {
            const Icon = domain.icon;
            const isActive = !hoveredDomain || isConnected(domain.id);
            const isHovered = hoveredDomain === domain.id;
            
            return (
        <motion.div
                key={domain.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.3,
                  scale: isHovered ? 1.05 : 1,
                }}
                transition={{ 
                  delay: index * 0.1 + 0.5,
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${50 + domain.position.x * 0.5}%`,
                  top: `${50 + domain.position.y * 0.5}%`,
                }}
                onMouseEnter={() => handleDomainHover(domain.id)}
                onMouseLeave={() => handleDomainHover(null)}
        >
                <Link href={`/dashboards/${domain.id === 'housing' ? 'housing-development' : domain.id === 'safety' ? 'public-safety' : domain.id === 'demographics' ? 'demographics' : domain.id}`}>
                  <div
                    className={`
                      relative p-5 rounded-civic-lg bg-white/95 backdrop-blur-sm shadow-civic-md
                      border-2 transition-all duration-rail cursor-pointer
                      hover:shadow-civic-lg hover:scale-105
                      ${isHovered ? 'border-current' : 'border-civic-sand/50'}
                    `}
                    style={{ 
                      borderColor: isHovered ? getDomainColor(domain.id) : undefined,
                      minWidth: '160px',
                      maxWidth: '200px'
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-civic flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${getDomainColor(domain.id)}15` }}
                    >
                      <Icon 
                        className="w-5 h-5" 
                        style={{ color: getDomainColor(domain.id) }}
                      />
                    </div>
                    <h3 className="font-display font-semibold text-civic-ink text-sm mb-1">
                      {domain.label}
                    </h3>
                    <p className="text-[10px] text-civic-stone mb-2 line-clamp-2">
                      {domain.description}
                    </p>
                    
                    {/* Stats preview */}
                    <div className="pt-2 border-t border-civic-sand/50">
                      <p className="text-[9px] uppercase tracking-wider text-civic-stone mb-0.5">
                        {domain.stats.label}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-lg font-semibold text-civic-ink">
                          {domain.stats.value}
                        </span>
                        {domain.stats.trend && (
                          <span 
                            className={`text-[10px] font-medium ${
                              domain.stats.trend.startsWith('+') 
                                ? 'text-domain-environment-600' 
                                : domain.stats.trend.startsWith('-')
                                ? 'text-domain-safety-600'
                                : 'text-civic-stone'
                            }`}
                          >
                            {domain.stats.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
        </motion.div>
            );
          })}
        </div>

        <div className="max-w-civic-full mx-auto px-6 lg:px-10 py-12 relative z-20 pointer-events-none">
          {/* Main content */}
          <div className="max-w-xl pointer-events-auto">
            {/* Left: Headline and statement */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
                className="text-civic-caption uppercase tracking-[0.25em] text-civic-stone mb-6"
        >
                City of Charlotte, North Carolina
              </motion.p>
              
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-civic-ink leading-[1.1] mb-8">
                Charlotte,
                <br />
                <span className="text-civic-charcoal">understood</span>
                <br />
                through data.
              </h1>
              
              <p className="text-civic-body text-civic-charcoal max-w-lg mb-6 leading-relaxed">
                An official civic intelligence platform providing transparent, accessible data 
                for residents, businesses, and policymakers. Explore how Charlotte evolves 
                across transportation, housing, economy, environment, and public safety.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboards"
                  className="btn-civic-primary inline-flex items-center gap-2"
                >
                  Explore Dashboards
                  <ArrowRight className="w-4 h-4" />
              </Link>
                
            </div>

              {/* Resident lens indicator */}
              {(residentLens.livesIn || residentLens.worksIn) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-4 bg-domain-transport-50 border border-domain-transport-200 rounded-civic"
                >
                  <p className="text-sm text-domain-transport-700">
                    <span className="font-medium">Personalized for you:</span>{' '}
                    {residentLens.livesIn && `Lives in ${residentLens.livesIn}`}
                    {residentLens.livesIn && residentLens.worksIn && ' • '}
                    {residentLens.worksIn && `Works in ${residentLens.worksIn}`}
                  </p>
                </motion.div>
              )}
            </motion.div>
            </div>
            </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-civic-white to-transparent" />
      </section>

      {/* Did You Know? Charlotte Fact */}
      {randomFact && (
        <section className="relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${getCategoryColor(randomFact.category)} 0%, transparent 50%), 
                               radial-gradient(circle at 80% 50%, ${getCategoryColor(randomFact.category)} 0%, transparent 50%)`,
            }}
          />
          <div className="max-w-civic-full mx-auto px-6 lg:px-10 py-8">
            <div className="flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-civic-lg border border-civic-sand/50 p-6 shadow-civic-sm">
              {/* Icon */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`icon-${factIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: `${getCategoryColor(randomFact.category)}15`,
                  border: `2px solid ${getCategoryColor(randomFact.category)}30`
                }}
              >
                <randomFact.icon 
                  className="w-6 h-6" 
                  style={{ color: getCategoryColor(randomFact.category) }} 
                />
                </motion.div>
              </AnimatePresence>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${factIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles 
                    className="w-4 h-4" 
                    style={{ color: getCategoryColor(randomFact.category) }} 
                  />
                  <span 
                    className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                    style={{ color: getCategoryColor(randomFact.category) }}
                  >
                    Did You Know? — {getCategoryLabel(randomFact.category)}
                  </span>
                </div>
                <p className="font-display text-lg md:text-xl text-civic-ink leading-snug">
                  {randomFact.fact}
                </p>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Decorative crown for Queen City */}
              <div className="hidden md:flex flex-shrink-0 opacity-10">
                <Crown className="w-12 h-12 text-civic-ink" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Civic Facts Bar */}
      <section className="bg-civic-white border-y border-civic-sand py-8">
        <div className="max-w-civic-full mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, label: 'Population', value: '897,720', subtext: '2024 estimate' },
              { icon: Building2, label: 'Active Businesses', value: '42,186', subtext: 'Licensed in city' },
              { icon: Train, label: 'Transit Lines', value: '78', subtext: 'CATS routes' },
              { icon: Leaf, label: 'Park Acreage', value: '23,200', subtext: 'Managed greenspace' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-5 h-5 text-civic-stone mx-auto mb-2" />
                <p className="font-display text-2xl md:text-3xl font-semibold text-civic-ink">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-wider text-civic-stone mt-1">
                  {stat.label}
                </p>
                <p className="text-[10px] text-civic-stone/70 mt-0.5">
                  {stat.subtext}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods Section */}
      <section className="bg-civic-cream py-20 border-t border-civic-sand">
        <div className="max-w-civic-full mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <p className="text-civic-caption uppercase tracking-[0.2em] text-civic-stone mb-3">
              Local Focus
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-civic-ink">
              Explore by Neighborhood
            </h2>
            <p className="text-civic-charcoal mt-4 max-w-2xl">
              Charlotte has {allNeighborhoods.length || '460+'} neighborhoods. Search or select one 
              to see localized data on housing, transportation, safety, and more.
            </p>
          </motion.div>

          {/* Neighborhood Search & Dropdown */}
          <div className="max-w-xl">
            <div className="relative" ref={dropdownRef}>
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-civic-stone" />
                <input
                  type="text"
                  placeholder={loadingNeighborhoods ? "Loading neighborhoods..." : `Search ${allNeighborhoods.length} neighborhoods...`}
                  value={neighborhoodSearch}
                  onChange={(e) => {
                    setNeighborhoodSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-civic-sand bg-white
                           text-civic-ink placeholder:text-civic-stone
                           focus:outline-none focus:border-domain-transport-400 focus:ring-2 focus:ring-domain-transport-100
                           transition-all duration-200"
                  disabled={loadingNeighborhoods}
                />
                {neighborhoodSearch && (
                  <button
                    onClick={() => {
                      setNeighborhoodSearch('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-civic-cream rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-civic-stone" />
                  </button>
                )}
                {!neighborhoodSearch && (
                  <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-civic-stone transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                )}
              </div>

              {/* Dropdown Results */}
              <AnimatePresence>
                {isDropdownOpen && !loadingNeighborhoods && (
              <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-civic-sand shadow-lg max-h-80 overflow-y-auto"
                  >
                    {filteredNeighborhoods.length > 0 ? (
                      <>
                        <div className="px-4 py-2 bg-civic-cream/50 border-b border-civic-sand/50">
                          <span className="text-xs text-civic-stone">
                            {neighborhoodSearch ? `${filteredNeighborhoods.length} results` : `Showing ${filteredNeighborhoods.length} of ${allNeighborhoods.length} neighborhoods`}
                          </span>
                        </div>
                        {filteredNeighborhoods.map((neighborhood) => (
                          <button
                            key={neighborhood.npa}
                            onClick={() => handleNeighborhoodSelect(neighborhood)}
                            className="w-full px-4 py-3 text-left hover:bg-civic-cream/50 transition-colors flex items-center justify-between group"
            >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-domain-transport-100 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-domain-transport-600" />
                              </div>
                              <div>
                                <div className="font-medium text-civic-ink group-hover:text-domain-transport-600 transition-colors">
                                  {neighborhood.name}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-civic-stone opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                        {allNeighborhoods.length > 20 && !neighborhoodSearch && (
                          <div className="px-4 py-3 bg-civic-cream/30 text-center text-sm text-civic-stone">
                            Type to search all {allNeighborhoods.length} neighborhoods
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-civic-stone">
                        No neighborhoods found matching "{neighborhoodSearch}"
                      </div>
                    )}
              </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Access Popular Neighborhoods */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-civic-stone py-1">Popular:</span>
              {['Uptown', 'Myers Park', 'NoDa East', 'Ballantyne North', 'Dilworth Historic District', 'Plaza Midwood East', 'SouthPark North'].map((name) => {
                const neighborhood = allNeighborhoods.find(n => n.name === name);
                if (!neighborhood) return null;
                return (
                  <button
                    key={name}
                    onClick={() => handleNeighborhoodSelect(neighborhood)}
                    className="px-3 py-1 text-sm rounded-full bg-white border border-civic-sand hover:border-domain-transport-400 hover:bg-domain-transport-50 transition-colors"
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
      </div>
      </section>

      {/* Featured Insights */}
      <section className="bg-civic-white py-20">
        <div className="max-w-civic-full mx-auto px-6 lg:px-10">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
        >
            <p className="text-civic-caption uppercase tracking-[0.2em] text-civic-stone mb-3">
              Featured Analysis
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-civic-ink">
              Recent Civic Insights
          </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {insights.map((insight, i) => (
              <motion.article
                key={insight.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Link href={insight.href} className="block group">
                  <div 
                    className="h-2 rounded-t-civic mb-4"
                    style={{ backgroundColor: getDomainColor(insight.domain) }}
                  />
                  <div className="p-6 bg-civic-cream rounded-b-civic-lg border border-civic-sand border-t-0 group-hover:shadow-civic-md transition-shadow duration-rail">
                    <p 
                      className="text-[10px] uppercase tracking-wider font-medium mb-3"
                      style={{ color: getDomainColor(insight.domain) }}
                    >
                      {domainConfig[insight.domain]?.label}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-civic-ink mb-3 group-hover:text-domain-transport-600 transition-colors">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-civic-charcoal leading-relaxed mb-4">
                      {insight.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-civic-stone group-hover:text-civic-ink transition-colors">
                      Read analysis
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
              </div>
            </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      

    </div>
  );
}
