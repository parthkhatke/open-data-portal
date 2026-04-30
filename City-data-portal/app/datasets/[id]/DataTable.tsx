'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, RefreshCw, Database, AlertCircle } from 'lucide-react';

interface DataTableProps {
  datasetId: string;
  domainColor?: string;
}

export default function DataTable({ datasetId, domainColor = '#0891b2' }: DataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [datasetId, page]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      const response = await fetch(`${basePath}/api/datasets/${datasetId}?limit=${pageSize}&offset=${(page - 1) * pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      const features = result.features || [];
      setData(features);
      const total = result.totalCount || (features.length > 0 ? (page * pageSize) + 100 : 0);
      setTotalRecords(total);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
      if (data.length === 0) {
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="bg-white rounded-civic-xl border border-civic-sand/50 overflow-hidden">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div 
              className="w-12 h-12 border-4 border-civic-sand rounded-full animate-spin mx-auto mb-4"
              style={{ borderTopColor: domainColor }}
            />
            <p className="text-civic-stone">Loading records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="bg-white rounded-civic-xl border border-civic-sand/50 overflow-hidden">
        <div className="text-center py-16 px-6">
          <AlertCircle className="w-12 h-12 text-domain-safety-500 mx-auto mb-4" />
          <p className="text-civic-charcoal mb-4">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 btn-civic py-2 px-4"
            style={{ backgroundColor: domainColor }}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-civic-xl border border-civic-sand/50 overflow-hidden">
        <div className="text-center py-16 px-6">
          <Database className="w-12 h-12 text-civic-sand mx-auto mb-4" />
          <p className="text-civic-stone">No records available</p>
        </div>
      </div>
    );
  }

  // Get all unique keys from all records
  const allKeys = Array.from(
    new Set(
      data.flatMap((record) => Object.keys(record.attributes || {}))
    )
  ).sort();

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-civic-xl border border-civic-sand/50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-civic-sand/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-civic-ink">Dataset Records</h2>
          <p className="text-civic-small text-civic-stone mt-1">
            Showing {((page - 1) * pageSize) + 1} – {Math.min(page * pageSize, totalRecords)} of {totalRecords.toLocaleString()} records
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="btn-civic-secondary p-2"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a
            href={`/city-data-portal/api/datasets/${datasetId}/download?format=csv&limit=10000`}
            download={`${datasetId}.csv`}
            className="btn-civic flex items-center gap-2 py-2 px-4"
            style={{ backgroundColor: domainColor }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download All</span>
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-civic-sand/30">
          <thead className="bg-civic-cream/50">
            <tr>
              {allKeys.map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-[10px] font-semibold text-civic-stone uppercase tracking-wider whitespace-nowrap"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-civic-sand/20">
            {data.map((record, idx) => (
              <tr 
                key={idx} 
                className="hover:bg-civic-cream/30 transition-colors duration-rail"
              >
                {allKeys.map((key) => {
                  const value = record.attributes?.[key];
                  const displayValue = value === null || value === undefined 
                    ? '—' 
                    : String(value);
                  const truncated = displayValue.length > 80 
                    ? displayValue.substring(0, 80) + '…' 
                    : displayValue;
                  
                  return (
                    <td key={key} className="px-4 py-3 text-civic-caption text-civic-charcoal">
                      <div className="max-w-xs truncate" title={displayValue}>
                        {truncated}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-civic-sand/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-civic-small text-civic-stone">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-civic-secondary py-2 px-4 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-civic text-civic-small font-medium transition-colors ${
                      page === pageNum
                        ? 'text-white'
                        : 'text-civic-charcoal hover:bg-civic-cream'
                    }`}
                    style={page === pageNum ? { backgroundColor: domainColor } : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-civic-secondary py-2 px-4 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
