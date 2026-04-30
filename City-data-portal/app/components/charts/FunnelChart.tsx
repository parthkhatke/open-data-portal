'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FunnelItem {
  name: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelItem[];
  title?: string;
  showPercentages?: boolean;
  showConversion?: boolean;
  colorScheme?: 'blue' | 'green' | 'purple';
}

const colorSchemes = {
  blue: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  green: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
};

export default function FunnelChart({
  data,
  title = 'Funnel',
  showPercentages = false,
  showConversion = false,
  colorScheme = 'blue',
}: FunnelChartProps) {
  const maxValue = data[0]?.value || 1;
  const colors = colorSchemes[colorScheme];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-lg">
      {title && <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>}
      
      <div className="space-y-3">
        {data.map((item, index) => {
          const widthPercent = (item.value / maxValue) * 100;
          const prevValue = index > 0 ? data[index - 1].value : item.value;
          const conversionRate = prevValue > 0 ? ((item.value / prevValue) * 100).toFixed(1) : '100';
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="relative"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="relative rounded-lg overflow-hidden"
                  style={{ width: `${widthPercent}%`, minWidth: '40%' }}
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className="h-12 rounded-lg flex items-center justify-between px-4"
                    style={{ 
                      backgroundColor: colors[index % colors.length],
                      transformOrigin: 'left'
                    }}
                  >
                    <span className="text-white font-semibold truncate">{item.name}</span>
                    <span className="text-white font-bold">{item.value.toLocaleString()}</span>
                  </motion.div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  {showPercentages && (
                    <span className="text-gray-500">
                      {((item.value / maxValue) * 100).toFixed(1)}% of total
                    </span>
                  )}
                  {showConversion && index > 0 && (
                    <span className="text-gray-400">
                      • {conversionRate}% from prev
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
