'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Download, User, FileText, Code, ArrowLeft, Database, Clock, MapPin } from 'lucide-react';
import curatedDatasetsData from '@/datasets/curated_datasets.json';
import { CuratedDataset } from '@/types/dataset';
import DataTable from './DataTable';
import { DomainType, domainConfig, useCivic } from '../../context/CivicContext';
import CredibilityPanel from '../../components/CredibilityPanel';

const curatedDatasets = curatedDatasetsData as CuratedDataset[];

// Map theme names to domain types
const themeToDomain: Record<string, DomainType> = {
  'Public Safety': 'safety',
  'City Services': 'economy',
  'Housing & Development': 'housing',
  'Transportation': 'transportation',
  'Environment': 'environment',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DatasetDetailPage({ params }: PageProps) {
  useCivic(); // Needed for CredibilityPanel context
  const [dataset, setDataset] = useState<CuratedDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      const found = curatedDatasets.find((d) => d.id === id);
      setDataset(found || null);
      setLoading(false);
    });
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-civic-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-civic-sand border-t-domain-transport-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-civic-stone">Loading dataset...</p>
        </div>
      </div>
    );
  }

  if (!dataset) {
    notFound();
  }

  const domain = themeToDomain[dataset.theme] || 'economy';
  const config = domainConfig[domain];

  return (
    <div className="min-h-screen bg-civic-white">
      {/* Header */}
      <section className="bg-civic-cream border-b border-civic-sand">
        <div className="max-w-civic-full mx-auto px-6 lg:px-10 py-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              href="/datasets"
              className="inline-flex items-center gap-2 text-civic-stone hover:text-civic-charcoal transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Data Catalog
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-civic flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <Database className="w-6 h-6" style={{ color: config.color }} />
              </div>
              <div className="flex-1">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                  }}
                >
                  {dataset.theme}
                </span>
                <h1 className="heading-civic-display text-civic-ink">{dataset.title}</h1>
              </div>
            </div>
            <p className="body-civic-large text-civic-charcoal max-w-3xl">{dataset.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-civic-full mx-auto px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Table - Moved to top */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <DataTable datasetId={dataset.id} domainColor={config.color} />
            </motion.div>

            {/* Metadata Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid sm:grid-cols-3 gap-4"
            >
              <div className="bg-civic-cream/50 rounded-civic-lg p-4 border border-civic-sand/50">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-4 h-4 text-civic-stone" />
                  <span className="text-civic-small text-civic-stone uppercase tracking-wider">Owner</span>
                </div>
                <p className="font-display font-semibold text-civic-ink">{dataset.owner}</p>
              </div>
              <div className="bg-civic-cream/50 rounded-civic-lg p-4 border border-civic-sand/50">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-4 h-4 text-civic-stone" />
                  <span className="text-civic-small text-civic-stone uppercase tracking-wider">Updated</span>
                </div>
                <p className="font-display font-semibold text-civic-ink">{dataset.freshness}</p>
              </div>
              <div className="bg-civic-cream/50 rounded-civic-lg p-4 border border-civic-sand/50">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-4 h-4 text-civic-stone" />
                  <span className="text-civic-small text-civic-stone uppercase tracking-wider">License</span>
                </div>
                <p className="font-display font-semibold text-civic-ink">{dataset.license}</p>
              </div>
            </motion.div>

            {/* Metrics */}
            {dataset.metrics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-civic-xl border border-civic-sand/50 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-civic-sand/50">
                  <h2 className="font-display text-lg font-semibold text-civic-ink">Available Metrics</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {dataset.metrics.map((metric) => (
                      <span
                        key={metric}
                        className="px-3 py-1.5 bg-civic-cream rounded-full text-civic-small font-medium text-civic-charcoal"
                      >
                        {metric.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Download Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-civic-xl border border-civic-sand/50 overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-civic-sand/50">
                <h2 className="font-display text-base font-semibold text-civic-ink">Download Dataset</h2>
              </div>
              <div className="p-4 space-y-2">
                <a
                  href={`/city-data-portal/api/datasets/${dataset.id}/download?format=csv`}
                  download={`${dataset.id}.csv`}
                  className="w-full btn-civic flex items-center justify-center gap-2 py-2.5 text-sm"
                  style={{ backgroundColor: config.color }}
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </a>
                <a
                  href={`/city-data-portal/api/datasets/${dataset.id}/download?format=json`}
                  download={`${dataset.id}.json`}
                  className="w-full btn-civic-secondary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </a>
              </div>
            </motion.div>

            {/* Connect Via API */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="bg-white rounded-civic-xl border border-civic-sand/50 overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-civic-sand/50">
                <h2 className="font-display text-base font-semibold text-civic-ink">Connect Via API</h2>
              </div>
              <div className="p-4">
                <p className="text-civic-caption text-civic-stone mb-3">
                  Access this dataset programmatically using our REST API.
                </p>
                <Link
                  href={`/api-docs?dataset=${dataset.id}`}
                  className="w-full btn-civic-secondary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  <Code className="w-4 h-4" />
                  View API Documentation
                </Link>
              </div>
            </motion.div>

            {/* Credibility Panel for Policy Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CredibilityPanel
                dataSource={{
                  name: dataset.owner,
                  description: `Official dataset from the City of Charlotte ${dataset.theme} department.`,
                }}
                methodology="Data collected from City of Charlotte ArcGIS services and validated against official records."
                lastUpdated={dataset.freshness}
                confidenceNote={`License: ${dataset.license}. Geometry type: ${dataset.geometryType || 'Table'}.`}
              />
            </motion.div>

            {/* Related Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="bg-civic-cream/50 rounded-civic-xl border border-civic-sand/50 p-4"
            >
              <h3 className="font-display font-semibold text-civic-ink mb-3 text-sm">Explore More</h3>
              <div className="space-y-2">
                <Link
                  href="/datasets"
                  className="flex items-center gap-2 text-civic-charcoal hover:text-civic-ink transition-colors"
                >
                  <Database className="w-4 h-4" />
                  <span className="text-civic-caption">Browse all datasets</span>
                </Link>
                <Link
                  href={`/dashboards/${domain === 'safety' ? 'public-safety' : domain === 'housing' ? 'housing-development' : domain}`}
                  className="flex items-center gap-2 text-civic-charcoal hover:text-civic-ink transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-civic-caption">View {config.label} dashboard</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
