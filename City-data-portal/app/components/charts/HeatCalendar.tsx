'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface HeatCalendarProps {
  data: Array<{ day: number; hour: number; value: number }>;
  title?: string;
  colorScheme?: 'blue' | 'red' | 'green' | 'purple';
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hourLabels = ['12a', '2a', '4a', '6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p'];

const colorSchemes = {
  blue: ['#eff6ff', '#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
  red: ['#fef2f2', '#fee2e2', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
  green: ['#f0fdf4', '#dcfce7', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'],
  purple: ['#faf5ff', '#ede9fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9'],
};

export default function HeatCalendar({
  data,
  title = 'Activity Heatmap',
  colorScheme = 'blue',
}: HeatCalendarProps) {
  const colors = colorSchemes[colorScheme];
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const getColor = (value: number) => {
    const intensity = Math.min(Math.floor((value / maxValue) * (colors.length - 1)), colors.length - 1);
    return colors[intensity];
  };

  // Group data by day
  const gridData = Array.from({ length: 7 }, (_, day) => 
    Array.from({ length: 12 }, (_, hourIndex) => {
      const hour = hourIndex * 2;
      const item = data.find(d => d.day === day && Math.floor(d.hour / 2) === hourIndex);
      return item?.value || 0;
    })
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-12 mb-2">
            {hourLabels.map((hour, i) => (
              <div key={i} className="flex-1 text-xs text-gray-500 text-center">
                {hour}
              </div>
            ))}
          </div>
          
          {/* Grid */}
          <div className="space-y-1">
            {gridData.map((row, dayIndex) => (
              <div key={dayIndex} className="flex items-center gap-1">
                <div className="w-10 text-xs text-gray-500 font-medium">
                  {dayLabels[dayIndex]}
                </div>
                <div className="flex flex-1 gap-1">
                  {row.map((value, hourIndex) => (
                    <motion.div
                      key={hourIndex}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: (dayIndex * 12 + hourIndex) * 0.005,
                        duration: 0.2
                      }}
                      className="flex-1 h-8 rounded-md cursor-pointer hover:ring-2 hover:ring-gray-400 transition-all"
                      style={{ backgroundColor: getColor(value) }}
                      title={`${dayLabels[dayIndex]} ${hourLabels[hourIndex]}: ${value}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end mt-4 gap-2">
            <span className="text-xs text-gray-500">Low</span>
            <div className="flex gap-0.5">
              {colors.map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
