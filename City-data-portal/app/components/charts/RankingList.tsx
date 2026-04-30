'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface RankingItem {
  rank: number;
  label: string;
  value: number;
  previousRank?: number;
}

interface RankingListProps {
  data: RankingItem[];
  title?: string;
  valueLabel?: string;
  showRankChange?: boolean;
  maxItems?: number;
}

export default function RankingList({
  data,
  title = 'Rankings',
  valueLabel = 'value',
  showRankChange = false,
  maxItems = 8,
}: RankingListProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const displayData = data.slice(0, maxItems);

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return { icon: Minus, color: 'text-gray-400', change: 0 };
    const change = previous - current;
    if (change > 0) return { icon: ArrowUp, color: 'text-green-500', change };
    if (change < 0) return { icon: ArrowDown, color: 'text-red-500', change: Math.abs(change) };
    return { icon: Minus, color: 'text-gray-400', change: 0 };
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      
      <div className="space-y-3">
        {displayData.map((item, index) => {
          const rankInfo = getRankChange(item.rank, item.previousRank);
          const RankIcon = rankInfo.icon;
          const widthPercent = (item.value / maxValue) * 100;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="group"
            >
              <div className="flex items-center gap-3 mb-1">
                {/* Rank badge */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'}
                `}>
                  {item.rank}
                </div>

                {/* Label */}
                <div className="flex-1 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {item.label}
                </div>

                {/* Rank change indicator */}
                {showRankChange && item.previousRank && (
                  <div className={`flex items-center gap-0.5 ${rankInfo.color}`}>
                    <RankIcon className="w-3 h-3" />
                    {rankInfo.change > 0 && (
                      <span className="text-xs font-medium">{rankInfo.change}</span>
                    )}
                  </div>
                )}

                {/* Value */}
                <div className="text-sm font-semibold text-gray-700">
                  {item.value.toLocaleString()} <span className="text-gray-400 font-normal">{valueLabel}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="ml-11 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                    'bg-gradient-to-r from-blue-400 to-blue-500'
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
