'use client';

import { useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useCivic } from '../context/CivicContext';

interface TimelineSliderProps {
  className?: string;
  showControls?: boolean;
  showLabels?: boolean;
  compact?: boolean;
  // Optional overrides for year range (used when dataset has specific data range)
  overrideMinYear?: number;
  overrideMaxYear?: number;
}

export default function TimelineSlider({ 
  className = '', 
  showControls = true,
  showLabels = true,
  compact = false,
  overrideMinYear,
  overrideMaxYear,
}: TimelineSliderProps) {
  const { timeline, setYear, toggleTimelinePlay } = useCivic();
  const sliderRef = useRef<HTMLDivElement>(null);

  // Use override values if provided, otherwise use context values
  const minYear = overrideMinYear ?? timeline.minYear;
  const maxYear = overrideMaxYear ?? timeline.maxYear;
  const { year, isPlaying } = timeline;
  
  // Clamp year to the valid range
  const clampedYear = Math.max(minYear, Math.min(maxYear, year));
  const totalYears = maxYear - minYear;
  const progress = ((clampedYear - minYear) / totalYears) * 100;

  // Generate year markers
  const yearMarkers = useMemo(() => {
    const markers: number[] = [];
    const step = totalYears <= 5 ? 1 : totalYears <= 10 ? 2 : 5;
    for (let y = minYear; y <= maxYear; y += step) {
      markers.push(y);
    }
    if (!markers.includes(maxYear)) {
      markers.push(maxYear);
    }
    return markers;
  }, [minYear, maxYear, totalYears]);

  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newYear = Math.round(minYear + percentage * totalYears);
    setYear(newYear);
  }, [minYear, totalYears, setYear]);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const dragX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = dragX / rect.width;
    const newYear = Math.round(minYear + percentage * totalYears);
    setYear(newYear);
  }, [minYear, totalYears, setYear]);

  const startDrag = useCallback(() => {
    const handleMouseMove = (e: MouseEvent) => handleDrag(e);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleDrag]);

  const resetTimeline = () => {
    setYear(maxYear);
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="text-civic-small font-mono text-civic-stone min-w-[4ch]">{clampedYear}</span>
        <div 
          ref={sliderRef}
          onClick={handleSliderClick}
          className="relative flex-1 h-1.5 bg-civic-sand rounded-full cursor-pointer"
        >
          <div 
            className="absolute inset-y-0 left-0 bg-domain-transport-400 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
          <div 
            onMouseDown={startDrag}
            className="absolute w-3 h-3 bg-white border-2 border-domain-transport-500 rounded-full shadow-civic cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-[3px]"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-4 mb-3">
        {showControls && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimelinePlay}
              className={`
                flex items-center justify-center w-10 h-10 rounded-full
                transition-all duration-rail ease-rail
                ${isPlaying 
                  ? 'bg-domain-transport-500 text-white shadow-civic' 
                  : 'bg-civic-cream text-civic-charcoal hover:bg-civic-sand'
                }
              `}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={resetTimeline}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-civic-cream text-civic-stone hover:text-civic-charcoal hover:bg-civic-sand transition-all duration-rail"
              aria-label="Reset to current year"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="data-label">Time Machine</span>
            <motion.span 
              key={clampedYear}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl font-semibold text-civic-ink"
            >
              {clampedYear}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Slider track */}
      <div 
        ref={sliderRef}
        onClick={handleSliderClick}
        className="relative h-2 bg-civic-sand rounded-full cursor-pointer"
      >
        {/* Progress fill */}
        <motion.div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-domain-transport-400 to-domain-transport-500 rounded-full"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        />
        
        {/* Thumb */}
        <motion.div 
          onMouseDown={startDrag}
          className="absolute w-5 h-5 bg-white border-2 border-domain-transport-500 rounded-full shadow-civic-lg cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-[6px] hover:scale-110 transition-transform"
          initial={false}
          animate={{ left: `${progress}%` }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="absolute inset-1 rounded-full bg-domain-transport-400" />
        </motion.div>
      </div>

      {/* Year markers */}
      {showLabels && (
        <div className="relative mt-2 h-5">
          {yearMarkers.map((markerYear) => {
            const markerProgress = ((markerYear - minYear) / totalYears) * 100;
            const isActive = markerYear === clampedYear;
            return (
              <button
                key={markerYear}
                onClick={() => setYear(markerYear)}
                className={`
                  absolute transform -translate-x-1/2 text-xs transition-all duration-rail
                  ${isActive 
                    ? 'text-domain-transport-600 font-semibold' 
                    : 'text-civic-stone hover:text-civic-charcoal'
                  }
                `}
                style={{ left: `${markerProgress}%` }}
              >
                {markerYear}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
