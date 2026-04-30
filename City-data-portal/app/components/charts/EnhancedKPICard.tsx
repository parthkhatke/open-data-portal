'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface EnhancedKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'cyan' | 'orange' | 'indigo';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  sparklineData?: number[];
  subtitle?: string;
  variant?: 'default' | 'gradient';
  delay?: number;
}

const colorConfig = {
  blue: {
    bg: 'from-blue-50 to-blue-100/50',
    border: 'border-blue-200',
    icon: 'from-blue-500 to-blue-600',
    iconShadow: 'shadow-blue-500/30',
    text: 'text-blue-600',
    sparkline: '#3b82f6',
  },
  green: {
    bg: 'from-green-50 to-emerald-100/50',
    border: 'border-green-200',
    icon: 'from-green-500 to-emerald-600',
    iconShadow: 'shadow-green-500/30',
    text: 'text-green-600',
    sparkline: '#10b981',
  },
  red: {
    bg: 'from-red-50 to-rose-100/50',
    border: 'border-red-200',
    icon: 'from-red-500 to-rose-600',
    iconShadow: 'shadow-red-500/30',
    text: 'text-red-600',
    sparkline: '#ef4444',
  },
  yellow: {
    bg: 'from-yellow-50 to-amber-100/50',
    border: 'border-yellow-200',
    icon: 'from-yellow-500 to-amber-600',
    iconShadow: 'shadow-yellow-500/30',
    text: 'text-yellow-600',
    sparkline: '#eab308',
  },
  purple: {
    bg: 'from-purple-50 to-violet-100/50',
    border: 'border-purple-200',
    icon: 'from-purple-500 to-violet-600',
    iconShadow: 'shadow-purple-500/30',
    text: 'text-purple-600',
    sparkline: '#8b5cf6',
  },
  cyan: {
    bg: 'from-cyan-50 to-teal-100/50',
    border: 'border-cyan-200',
    icon: 'from-cyan-500 to-teal-600',
    iconShadow: 'shadow-cyan-500/30',
    text: 'text-cyan-600',
    sparkline: '#06b6d4',
  },
  orange: {
    bg: 'from-orange-50 to-amber-100/50',
    border: 'border-orange-200',
    icon: 'from-orange-500 to-amber-600',
    iconShadow: 'shadow-orange-500/30',
    text: 'text-orange-600',
    sparkline: '#f97316',
  },
  indigo: {
    bg: 'from-indigo-50 to-violet-100/50',
    border: 'border-indigo-200',
    icon: 'from-indigo-500 to-violet-600',
    iconShadow: 'shadow-indigo-500/30',
    text: 'text-indigo-600',
    sparkline: '#6366f1',
  },
};

export default function EnhancedKPICard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  sparklineData,
  subtitle,
  variant = 'default',
  delay = 0,
}: EnhancedKPICardProps) {
  const config = colorConfig[color];

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : 
                    trend?.direction === 'down' ? TrendingDown : Minus;

  const chartData = sparklineData?.map((val, i) => ({ value: val, index: i })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={`
        relative overflow-hidden rounded-3xl p-6 
        ${variant === 'gradient' 
          ? `bg-gradient-to-br ${config.bg} border ${config.border}` 
          : 'bg-white border border-gray-200'}
        shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
      `}
    >
      {/* Background decoration */}
      {variant === 'gradient' && (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Icon className="w-full h-full" />
        </div>
      )}

      <div className="relative z-10">
        {/* Header with icon and trend */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${config.icon} shadow-lg ${config.iconShadow}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${
              trend.direction === 'up' 
                ? trend.label === 'Improved' || color === 'green' ? 'text-green-600' : 'text-red-600'
                : trend.direction === 'down' 
                  ? trend.label === 'Improved' || trend.label === 'Faster' ? 'text-green-600' : 'text-green-600'
                  : 'text-gray-500'
            }`}>
              <TrendIcon className="w-3.5 h-3.5" />
              {trend.value}%
              {trend.label && <span className="ml-1 text-gray-500">{trend.label}</span>}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-sm text-gray-600 font-medium mb-1">{title}</div>
        
        {/* Value */}
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        
        {/* Subtitle */}
        {subtitle && (
          <div className="text-xs text-gray-500 mb-3">{subtitle}</div>
        )}

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="h-12 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`sparkline-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.sparkline} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={config.sparkline} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={config.sparkline} 
                  fill={`url(#sparkline-${color})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
