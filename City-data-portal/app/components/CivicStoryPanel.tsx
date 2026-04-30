'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { DomainType, domainConfig } from '../context/CivicContext';

interface CivicStoryPanelProps {
  title: string;
  domain?: DomainType;
  children: ReactNode;
  visualization?: ReactNode;
  className?: string;
}

export default function CivicStoryPanel({
  title,
  domain,
  children,
  visualization,
  className = ''
}: CivicStoryPanelProps) {
  const config = domain ? domainConfig[domain] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className={`
        relative overflow-hidden
        ${config 
          ? `border-l-4 ${config.borderClass}` 
          : 'border-l-4 border-civic-sand'
        }
        bg-white rounded-r-civic-xl
        shadow-civic
        ${className}
      `}
    >
      {/* Subtle domain-colored gradient */}
      {config && (
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${config.color} 0%, transparent 50%)`
          }}
        />
      )}

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {config && (
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-civic text-xl"
              style={{ backgroundColor: `${config.color}15` }}
            >
              {config.icon}
            </div>
          )}
          <div className="flex-1">
            <span className="data-label mb-1 block">Why This Matters for Charlotte</span>
            <h3 className="font-display text-xl font-semibold text-civic-ink leading-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="body-civic mb-6">
          {children}
        </div>

        {/* Visualization */}
        {visualization && (
          <div className="mt-6 pt-6 border-t border-civic-sand/50">
            {visualization}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Quick stats version
interface QuickStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    change?: {
      value: string | number;
      direction: 'up' | 'down' | 'neutral';
    };
  }>;
  domain?: DomainType;
}

export function CivicQuickStats({ stats, domain }: QuickStatsProps) {
  const config = domain ? domainConfig[domain] : null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center p-4 bg-civic-cream/50 rounded-civic"
        >
          <div 
            className="font-display text-2xl font-semibold mb-1"
            style={{ color: config?.color || '#1C1917' }}
          >
            {stat.value}
          </div>
          <div className="text-civic-small text-civic-stone">{stat.label}</div>
          {stat.change && (
            <div className={`text-civic-small mt-1 ${
              stat.change.direction === 'up' ? 'text-domain-safety-500' :
              stat.change.direction === 'down' ? 'text-domain-environment-500' :
              'text-civic-stone'
            }`}>
              {stat.change.direction === 'up' ? '↑' : stat.change.direction === 'down' ? '↓' : '→'} 
              {stat.change.value}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Insight callout
interface InsightCalloutProps {
  insight: string;
  domain?: DomainType;
  source?: string;
}

export function CivicInsightCallout({ insight, domain, source }: InsightCalloutProps) {
  const config = domain ? domainConfig[domain] : null;

  return (
    <motion.blockquote
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative pl-6 py-4"
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
        style={{ backgroundColor: config?.color || '#A8A29E' }}
      />
      <p className="font-display text-lg text-civic-charcoal leading-relaxed italic">
        "{insight}"
      </p>
      {source && (
        <cite className="block mt-2 text-civic-caption text-civic-stone not-italic">
          — {source}
        </cite>
      )}
    </motion.blockquote>
  );
}
