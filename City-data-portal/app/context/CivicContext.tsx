'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

export type ViewMode = 'public' | 'policy';

export interface ResidentLens {
  livesIn: string | null;
  worksIn: string | null;
}

export interface TimelineState {
  year: number;
  minYear: number;
  maxYear: number;
  isPlaying: boolean;
}

export type DomainType = 
  | 'transportation' 
  | 'housing' 
  | 'economy' 
  | 'environment' 
  | 'safety'
  | 'demographics'
  | 'education'
  | 'health'
  | 'city_services'
  | 'civic_engagement'
  | 'utilities'
  | 'waste_management'
  | 'geographic'
  | 'community'
  | 'police';

export interface CivicContextType {
  // Credibility Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  // Resident Lens
  residentLens: ResidentLens;
  setLivesIn: (neighborhood: string | null) => void;
  setWorksIn: (neighborhood: string | null) => void;
  clearResidentLens: () => void;

  // Timeline
  timeline: TimelineState;
  setYear: (year: number) => void;
  setTimelineRange: (min: number, max: number) => void;
  toggleTimelinePlay: () => void;

  // Active Domain (for cross-highlighting)
  activeDomain: DomainType | null;
  setActiveDomain: (domain: DomainType | null) => void;

  // Navigation panel state
  isNavOpen: boolean;
  setIsNavOpen: (open: boolean) => void;

  // Client-side data cache (persists across page navigations)
  getCachedData: (key: string) => any | null;
  setCachedData: (key: string, data: any) => void;
}

// ============================================
// CONTEXT
// ============================================

const CivicContext = createContext<CivicContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface CivicProviderProps {
  children: ReactNode;
}

export function CivicProvider({ children }: CivicProviderProps) {
  // Credibility Mode
  const [viewMode, setViewMode] = useState<ViewMode>('public');

  // Resident Lens
  const [residentLens, setResidentLens] = useState<ResidentLens>({
    livesIn: null,
    worksIn: null,
  });

  // Timeline - default to 2022 as most datasets have data up to 2022-2023
  const [timeline, setTimeline] = useState<TimelineState>({
    year: 2022,
    minYear: 2015,
    maxYear: 2022,
    isPlaying: false,
  });

  // Active Domain
  const [activeDomain, setActiveDomain] = useState<DomainType | null>(null);

  // Navigation
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Client-side data cache — persists across page navigations within the session.
  // Uses useRef so writes don't trigger re-renders across all consumers.
  const dataCacheRef = useRef<Record<string, any>>({});

  const getCachedData = useCallback((key: string): any | null => {
    return dataCacheRef.current[key] ?? null;
  }, []);

  const setCachedData = useCallback((key: string, data: any): void => {
    dataCacheRef.current[key] = data;
  }, []);

  // Persist preferences to localStorage (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedViewMode = localStorage.getItem('civic-viewMode');
    const savedLens = localStorage.getItem('civic-residentLens');

    if (savedViewMode) {
      setViewMode(savedViewMode as ViewMode);
    }

    if (savedLens) {
      try {
        setResidentLens(JSON.parse(savedLens));
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('civic-viewMode', viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('civic-residentLens', JSON.stringify(residentLens));
    }
  }, [residentLens]);

  // Timeline auto-play - commented out (time machine disabled)
  // useEffect(() => {
  //   if (timeline.isPlaying) {
  //     const interval = setInterval(() => {
  //       setTimeline((prev) => {
  //         const nextYear = prev.year + 1;
  //         if (nextYear > prev.maxYear) {
  //           return { ...prev, year: prev.minYear };
  //         }
  //         return { ...prev, year: nextYear };
  //       });
  //     }, 1500); // 1.5 seconds per year
  //
  //     return () => clearInterval(interval);
  //   }
  // }, [timeline.isPlaying]);

  // Context methods
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'public' ? 'policy' : 'public'));
  };

  const setLivesIn = (neighborhood: string | null) => {
    setResidentLens((prev) => ({ ...prev, livesIn: neighborhood }));
  };

  const setWorksIn = (neighborhood: string | null) => {
    setResidentLens((prev) => ({ ...prev, worksIn: neighborhood }));
  };

  const clearResidentLens = () => {
    setResidentLens({ livesIn: null, worksIn: null });
  };

  const setYear = (year: number) => {
    setTimeline((prev) => ({
      ...prev,
      year: Math.max(prev.minYear, Math.min(prev.maxYear, year)),
    }));
  };

  const setTimelineRange = (min: number, max: number) => {
    setTimeline((prev) => ({
      ...prev,
      minYear: min,
      maxYear: max,
      year: Math.max(min, Math.min(max, prev.year)),
    }));
  };

  const toggleTimelinePlay = () => {
    setTimeline((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const value: CivicContextType = {
    viewMode,
    setViewMode,
    toggleViewMode,
    residentLens,
    setLivesIn,
    setWorksIn,
    clearResidentLens,
    timeline,
    setYear,
    setTimelineRange,
    toggleTimelinePlay,
    activeDomain,
    setActiveDomain,
    isNavOpen,
    setIsNavOpen,
    getCachedData,
    setCachedData,
  };

  return <CivicContext.Provider value={value}>{children}</CivicContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useCivic() {
  const context = useContext(CivicContext);
  if (context === undefined) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
}

// ============================================
// DOMAIN UTILITIES
// ============================================

export const domainConfig: Record<DomainType, {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: string;
}> = {
  transportation: {
    label: 'Transportation',
    color: '#2B7A9E',
    bgClass: 'bg-domain-transport-500',
    textClass: 'text-domain-transport-600',
    borderClass: 'border-domain-transport-400',
    icon: '🚊',
  },
  housing: {
    label: 'Housing & Development',
    color: '#B46B4E',
    bgClass: 'bg-domain-housing-500',
    textClass: 'text-domain-housing-600',
    borderClass: 'border-domain-housing-400',
    icon: '🏠',
  },
  economy: {
    label: 'Economy',
    color: '#A8914D',
    bgClass: 'bg-domain-economy-500',
    textClass: 'text-domain-economy-600',
    borderClass: 'border-domain-economy-400',
    icon: '💼',
  },
  environment: {
    label: 'Environment',
    color: '#6B8B6B',
    bgClass: 'bg-domain-environment-500',
    textClass: 'text-domain-environment-600',
    borderClass: 'border-domain-environment-400',
    icon: '🌳',
  },
  safety: {
    label: 'Public Safety',
    color: '#9B5C5C',
    bgClass: 'bg-domain-safety-500',
    textClass: 'text-domain-safety-600',
    borderClass: 'border-domain-safety-400',
    icon: '🛡️',
  },
  demographics: {
    label: 'Demographics',
    color: '#7C3AED',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-600',
    borderClass: 'border-purple-400',
    icon: '👥',
  },
  education: {
    label: 'Education',
    color: '#0891B2',
    bgClass: 'bg-cyan-500',
    textClass: 'text-cyan-600',
    borderClass: 'border-cyan-400',
    icon: '🎓',
  },
  health: {
    label: 'Health',
    color: '#DC2626',
    bgClass: 'bg-red-500',
    textClass: 'text-red-600',
    borderClass: 'border-red-400',
    icon: '🏥',
  },
  city_services: {
    label: 'City Services',
    color: '#4F46E5',
    bgClass: 'bg-indigo-500',
    textClass: 'text-indigo-600',
    borderClass: 'border-indigo-400',
    icon: '🏛️',
  },
  civic_engagement: {
    label: 'Civic Engagement',
    color: '#0D9488',
    bgClass: 'bg-teal-500',
    textClass: 'text-teal-600',
    borderClass: 'border-teal-400',
    icon: '🗳️',
  },
  utilities: {
    label: 'Utilities & Infrastructure',
    color: '#6366F1',
    bgClass: 'bg-indigo-500',
    textClass: 'text-indigo-600',
    borderClass: 'border-indigo-400',
    icon: '⚡',
  },
  waste_management: {
    label: 'Waste Management',
    color: '#84CC16',
    bgClass: 'bg-lime-500',
    textClass: 'text-lime-600',
    borderClass: 'border-lime-400',
    icon: '♻️',
  },
  geographic: {
    label: 'Geographic',
    color: '#64748B',
    bgClass: 'bg-slate-500',
    textClass: 'text-slate-600',
    borderClass: 'border-slate-400',
    icon: '🗺️',
  },
  community: {
    label: 'Community',
    color: '#EC4899',
    bgClass: 'bg-pink-500',
    textClass: 'text-pink-600',
    borderClass: 'border-pink-400',
    icon: '🤝',
  },
  police: {
    label: 'Police & Law Enforcement',
    color: '#1E3A8A',
    bgClass: 'bg-blue-900',
    textClass: 'text-blue-900',
    borderClass: 'border-blue-800',
    icon: '👮',
  },
};
