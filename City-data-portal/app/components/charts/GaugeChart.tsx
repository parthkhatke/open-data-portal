'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GaugeChartProps {
  value: number;
  label: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'traffic' | 'blue' | 'purple' | 'green';
}

export default function GaugeChart({
  value,
  label,
  sublabel,
  size = 'md',
  colorScheme = 'traffic',
}: GaugeChartProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  const sizes = {
    sm: { width: 120, stroke: 8, fontSize: 24 },
    md: { width: 160, stroke: 10, fontSize: 32 },
    lg: { width: 200, stroke: 12, fontSize: 40 },
  };

  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * Math.PI; // Half circle
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  // Color based on value and scheme
  const getColor = () => {
    if (colorScheme !== 'traffic') {
      const schemes = {
        blue: '#3b82f6',
        purple: '#8b5cf6',
        green: '#10b981',
      };
      return schemes[colorScheme];
    }
    
    if (normalizedValue >= 70) return '#10b981'; // Green
    if (normalizedValue >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width / 2 + 20 }}>
        <svg 
          width={width} 
          height={width / 2 + 20} 
          viewBox={`0 0 ${width} ${width / 2 + 20}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <motion.path
            d={`M ${stroke / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - stroke / 2} ${width / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
          
          {/* Value text */}
          <motion.text
            x={width / 2}
            y={width / 2 - 5}
            textAnchor="middle"
            className="font-bold"
            style={{ fontSize, fill: '#1f2937' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {normalizedValue}%
          </motion.text>
        </svg>
      </div>
      
      <div className="text-center mt-2">
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
      </div>
    </div>
  );
}
