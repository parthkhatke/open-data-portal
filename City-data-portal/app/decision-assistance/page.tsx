'use client';

import { motion } from 'framer-motion';
import { Brain, ExternalLink } from 'lucide-react';

const iframeUrl =
  process.env.NEXT_PUBLIC_DRA_IFRAME_URL ||
  'https://known-racer.mydataos.com/dra/explorer';

export default function DecisionAssistancePage() {
  return (
    <div className="min-h-screen bg-civic-cream">
      {/* Page Header */}
      <div className="bg-civic-white border-b border-civic-sand">
        <div className="max-w-civic-full mx-auto px-6 lg:px-10 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-civic-ink rounded-civic text-civic-white">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-civic-ink">
                  Decision & Reasoning Assistance
                </h1>
                <p className="text-civic-charcoal text-sm mt-1">
                  AI-powered insights for data-driven civic decisions
                </p>
              </div>
            </div>
            <a
              href={iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-civic-cream border border-civic-sand rounded-civic text-sm font-medium text-civic-charcoal hover:border-civic-stone hover:bg-civic-white transition-all duration-rail"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </a>
          </motion.div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="max-w-civic-full mx-auto px-6 lg:px-10 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-civic-white rounded-civic border border-civic-sand shadow-sm overflow-hidden"
        >
          <iframe
            src={iframeUrl}
            className="w-full border-0"
            style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}
            title="Decision and Reasoning Assistance"
            allow="clipboard-write; clipboard-read"
          />
        </motion.div>
        
        {/* Mobile: Open in New Tab button */}
        <div className="md:hidden mt-4">
          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-civic-ink text-civic-white rounded-civic text-sm font-medium hover:bg-civic-charcoal transition-all duration-rail"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  );
}
