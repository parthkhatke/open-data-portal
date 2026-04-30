'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Info, FileText, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { useCivic } from '../context/CivicContext';

interface DataSource {
  name: string;
  url?: string;
  description?: string;
}

interface CredibilityPanelProps {
  dataSource?: DataSource;
  methodology?: string;
  lastUpdated?: string;
  updateFrequency?: string;
  confidenceNote?: string;
  className?: string;
}

export default function CredibilityPanel({
  dataSource,
  methodology,
  lastUpdated,
  updateFrequency,
  confidenceNote,
  className = ''
}: CredibilityPanelProps) {
  const { viewMode } = useCivic();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in policy mode
  if (viewMode !== 'policy') {
    return null;
  }

  const hasContent = dataSource || methodology || lastUpdated || confidenceNote;
  
  if (!hasContent) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center justify-between px-4 py-3
          bg-civic-cream/80 backdrop-blur-sm border border-civic-sand
          rounded-t-civic-lg text-sm text-civic-charcoal
          transition-all duration-rail ease-rail
          ${isExpanded ? '' : 'rounded-b-civic-lg'}
          hover:bg-civic-cream
        `}
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-civic-stone" />
          <span className="font-medium">Data Credibility Information</span>
        </div>
        <ChevronUp className={`w-4 h-4 transition-transform duration-rail ${isExpanded ? '' : 'rotate-180'}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white border border-t-0 border-civic-sand rounded-b-civic-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data Source */}
                {dataSource && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-civic-stone" />
                      <span className="data-label">Data Source</span>
                    </div>
                    <p className="text-sm text-civic-charcoal font-medium">{dataSource.name}</p>
                    {dataSource.description && (
                      <p className="text-civic-caption text-civic-stone mt-1">{dataSource.description}</p>
                    )}
                    {dataSource.url && (
                      <a 
                        href={dataSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-civic-caption text-domain-transport-600 hover:text-domain-transport-700 mt-2"
                      >
                        View source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Last Updated */}
                {lastUpdated && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-civic-stone" />
                      <span className="data-label">Last Updated</span>
                    </div>
                    <p className="text-sm text-civic-charcoal font-medium">{lastUpdated}</p>
                    {updateFrequency && (
                      <p className="text-civic-caption text-civic-stone mt-1">
                        Update frequency: {updateFrequency}
                      </p>
                    )}
                  </div>
                )}

                {/* Methodology */}
                {methodology && (
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-civic-stone" />
                      <span className="data-label">Methodology</span>
                    </div>
                    <p className="text-sm text-civic-charcoal leading-relaxed">{methodology}</p>
                  </div>
                )}

                {/* Confidence Note */}
                {confidenceNote && (
                  <div className="md:col-span-2">
                    <div className="flex items-start gap-3 p-4 bg-domain-economy-50 border border-domain-economy-200 rounded-civic">
                      <AlertCircle className="w-5 h-5 text-domain-economy-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="data-label text-domain-economy-700">Confidence Note</span>
                        <p className="text-sm text-domain-economy-800 mt-1">{confidenceNote}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline version for use within cards
export function CredibilityBadge({ 
  lastUpdated, 
  source 
}: { 
  lastUpdated?: string; 
  source?: string;
}) {
  const { viewMode } = useCivic();

  if (viewMode !== 'policy') {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-civic-small text-civic-stone border-t border-civic-sand pt-3 mt-4">
      {lastUpdated && (
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {lastUpdated}
        </span>
      )}
      {source && (
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {source}
        </span>
      )}
    </div>
  );
}
