'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Code, Database, Download, Book, ExternalLink } from 'lucide-react';

export default function APIAccessPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API Access</h1>
          <p className="text-xl text-gray-600">
            Access Charlotte's open data through our RESTful API
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <p className="text-gray-700 mb-4">
              All datasets are accessible via ArcGIS REST API endpoints. No authentication required for public datasets.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <code className="text-green-400 text-sm">
                GET https://gis.charlottenc.gov/arcgis/rest/services/...
              </code>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Endpoints</h2>
            <div className="space-y-4">
              <Link
                href="/datasets"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Browse All Datasets</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documentation</h2>
            <p className="text-gray-700 mb-4">
              Each dataset detail page includes API endpoint information and example queries.
            </p>
            <Link
              href="/datasets"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              View Datasets <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

