'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  label: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  striped?: boolean;
}

const colorConfig = {
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-emerald-600',
  red: 'from-red-400 to-red-600',
  yellow: 'from-yellow-400 to-amber-500',
  orange: 'from-orange-400 to-orange-600',
  purple: 'from-purple-400 to-violet-600',
};

const sizeConfig = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export default function ProgressBar({
  value,
  label,
  showPercentage = false,
  color = 'blue',
  size = 'md',
  striped = false,
}: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-900">{normalizedValue}%</span>
        )}
      </div>
      <div className={`w-full bg-gray-100 rounded-full ${sizeConfig[size]} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${normalizedValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className={`${sizeConfig[size]} rounded-full bg-gradient-to-r ${colorConfig[color]} relative`}
        >
          {striped && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%)',
                backgroundSize: '1rem 1rem',
                animation: 'stripes 1s linear infinite',
              }}
            />
          )}
        </motion.div>
      </div>
      
      <style jsx>{`
        @keyframes stripes {
          0% { background-position: 0 0; }
          100% { background-position: 1rem 0; }
        }
      `}</style>
    </div>
  );
}
