'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ComparisonItem {
  label: string;
  current: number;
  previous: number;
}

interface ComparisonChartProps {
  data: ComparisonItem[];
  title?: string;
  currentLabel?: string;
  previousLabel?: string;
}

export default function ComparisonChart({
  data,
  title = 'Comparison',
  currentLabel = 'Current',
  previousLabel = 'Previous',
}: ComparisonChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.current, d.previous]));

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">{currentLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-gray-600">{previousLabel}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {data.map((item, index) => {
          const changePercent = getChangePercent(item.current, item.previous);
          const isPositive = changePercent > 0;
          const ChangeIcon = changePercent > 0 ? ArrowUp : changePercent < 0 ? ArrowDown : Minus;
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{item.label}</span>
                <div className={`flex items-center gap-1 text-sm ${
                  isPositive ? 'text-green-600' : changePercent < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <ChangeIcon className="w-3.5 h-3.5" />
                  <span className="font-semibold">{Math.abs(changePercent).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                {/* Previous period bar (background) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.previous / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-gray-300 rounded-lg"
                />
                
                {/* Current period bar (foreground) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.current / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-end pr-3"
                >
                  <span className="text-white text-sm font-bold">
                    {item.current.toLocaleString()}
                  </span>
                </motion.div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Previous: {item.previous.toLocaleString()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
