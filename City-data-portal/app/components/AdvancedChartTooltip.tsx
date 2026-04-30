'use client';

import { motion } from 'framer-motion';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any) => string;
}

export function AdvancedTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/95 backdrop-blur-lg border-2 border-gray-200 rounded-xl p-4 shadow-2xl"
      style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
    >
      <div className="font-bold text-gray-900 mb-2 border-b border-gray-200 pb-2">{label}</div>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name || entry.dataKey}:</span>
            <span className="text-sm font-bold text-gray-900">
              {formatter ? formatter(entry.value) : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

