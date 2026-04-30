'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Calendar, User, Database, ChevronDown, X, ArrowRight, Clock } from 'lucide-react';
import curatedDatasetsData from '@/datasets/curated_datasets.json';
import { CuratedDataset } from '@/types/dataset';
import { DomainType, domainConfig, useCivic } from '../context/CivicContext';
import { CredibilityBadge } from '../components/CredibilityPanel';

const curatedDatasets = curatedDatasetsData as CuratedDataset[];

// Map theme names to domain types
const themeToDomain: Record<string, DomainType> = {
  'Public Safety': 'safety',
  'City Services': 'city_services',
  'Housing & Development': 'housing',
  'Transportation': 'transportation',
  'Environment': 'environment',
  'Community': 'community',
  'Economy': 'economy',
  'Education': 'education',
  'Health': 'health',
  'Infrastructure': 'utilities',
  'Geographic': 'geographic',
};

export default function DatasetsPage() {
  const { viewMode, residentLens } = useCivic();
  const [datasets, setDatasets] = useState<CuratedDataset[]>(curatedDatasets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const themes = useMemo(() => Array.from(new Set(curatedDatasets.map((d) => d.theme))), []);

  useEffect(() => {
    let filtered = curatedDatasets;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.theme.toLowerCase().includes(query)
      );
    }

    if (selectedTheme !== 'all') {
      filtered = filtered.filter((d) => d.theme === selectedTheme);
    }

    // Sort by relevance to resident lens if set
    if (residentLens.livesIn || residentLens.worksIn) {
      // In a real implementation, this would prioritize datasets relevant to the user's neighborhoods
      filtered = [...filtered].sort((a, b) => {
        const aRelevant = a.description.toLowerCase().includes('neighborhood') ? -1 : 0;
        const bRelevant = b.description.toLowerCase().includes('neighborhood') ? -1 : 0;
        return aRelevant - bRelevant;
      });
    }

    setDatasets(filtered);
  }, [searchQuery, selectedTheme, residentLens]);

  return (
    <div className="min-h-screen bg-civic-white">
      {/* Header */}
      <section className="bg-civic-cream/30 border-b border-civic-sand/50 py-12 lg:py-16">
        <div className="max-w-civic-full mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="data-label mb-3 block">Open Data</span>
            <h1 className="heading-civic-display mb-4">Data Catalog</h1>
            <p className="body-civic-large text-civic-stone max-w-2xl">
              Browse and explore curated datasets from the City of Charlotte. Download, analyze, or access via API.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="sticky top-16 z-30 bg-civic-white border-b border-civic-sand/50 py-4">
        <div className="max-w-civic-full mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-civic-stone" />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-civic pl-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-civic-stone hover:text-civic-charcoal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Theme Filter */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="input-civic pr-10 min-w-[180px] appearance-none"
                >
                  <option value="all">All Domains</option>
                  {themes.map((theme) => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-civic-stone pointer-events-none" />
              </div>

              {selectedTheme !== 'all' && (
                <button
                  onClick={() => setSelectedTheme('all')}
                  className="text-civic-small text-civic-stone hover:text-civic-charcoal transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-civic-small text-civic-stone">
            Showing {datasets.length} dataset{datasets.length !== 1 ? 's' : ''}
            {selectedTheme !== 'all' && ` in ${selectedTheme}`}
          </div>
        </div>
      </section>

      {/* Dataset Grid */}
      <section className="section-civic">
        <div className="max-w-civic-full mx-auto px-6 lg:px-10">
          <AnimatePresence mode="popLayout">
            {datasets.length > 0 ? (
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                layout
              >
                {datasets.map((dataset, index) => {
                  const domain = themeToDomain[dataset.theme] || 'economy';
                  const config = domainConfig[domain];
                  
                  return (
                    <motion.article
                      key={dataset.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="group"
                    >
                      <div className="h-full flex flex-col bg-white rounded-civic-xl border border-civic-sand/50 hover:border-civic-stone/30 hover:shadow-civic-lg transition-all duration-rail overflow-hidden">
                        {/* Domain accent bar */}
                        <div 
                          className="h-1"
                          style={{ backgroundColor: config.color }}
                        />

                        <div className="flex-1 flex flex-col p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <Link 
                              href={`/datasets/${dataset.id}`}
                              className="flex-1"
                            >
                              <h2 className="font-display text-lg font-semibold text-civic-ink group-hover:text-domain-transport-600 transition-colors leading-tight">
                                {dataset.title}
                              </h2>
                            </Link>
                            <span 
                              className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `${config.color}15`,
                                color: config.color 
                              }}
                            >
                              {config.icon}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-civic-caption text-civic-charcoal leading-relaxed line-clamp-3 mb-4 flex-1">
                            {dataset.description}
                          </p>

                          {/* Metadata */}
                          <div className="space-y-2 mb-4 text-civic-small text-civic-stone">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5" />
                              <span>{dataset.owner}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Updated: {dataset.freshness}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="w-3.5 h-3.5" />
                              <span>{dataset.geometryType || 'Table'}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-4 border-t border-civic-sand/30">
                            <Link
                              href={`/datasets/${dataset.id}`}
                              className="flex-1 btn-civic text-center text-sm py-2"
                              style={{ 
                                backgroundColor: config.color,
                                color: 'white'
                              }}
                            >
                              View Details
                            </Link>
                            <Link
                              href={`/city-data-portal/api/datasets/${dataset.id}/download?format=csv`}
                              className="btn-civic-secondary py-2 px-3"
                              title="Download CSV"
                            >
                              <Download className="w-4 h-4" />
                            </Link>
                          </div>

                          {/* Policy mode metadata */}
                          <CredibilityBadge
                            lastUpdated={dataset.freshness}
                            source={dataset.owner}
                          />
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Database className="w-16 h-16 text-civic-sand mx-auto mb-4" />
                <h3 className="heading-civic-section mb-2">No datasets found</h3>
                <p className="text-civic-stone mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedTheme('all'); }}
                  className="btn-civic-secondary"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* API CTA */}
      <section className="section-civic bg-civic-ink">
        <div className="max-w-civic-content mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-display text-3xl font-semibold text-white mb-4">
            Build with Charlotte Data
          </h2>
          <p className="text-civic-stone mb-8 max-w-xl mx-auto">
            Access all datasets programmatically through our REST API. Free for personal and commercial use.
          </p>
          <Link
            href="/api-docs?dataset=demographics"
            className="btn-civic bg-white text-civic-ink hover:bg-civic-cream inline-flex items-center gap-2"
          >
            View API Access <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
