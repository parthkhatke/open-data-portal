'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Book, Video, FileText, Code } from 'lucide-react';

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Open Data Tutorials</h1>
          <p className="text-xl text-gray-600">
            Learn how to access and use Charlotte's open data
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <Book className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Getting Started Guide</h3>
            <p className="text-gray-600 text-sm mb-4">
              Learn the basics of navigating the portal and finding datasets
            </p>
            <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Read Guide →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <Code className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">API Documentation</h3>
            <p className="text-gray-600 text-sm mb-4">
              Learn how to access data programmatically via our API
            </p>
            <Link href="/api" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              View Docs →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <FileText className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Data Dictionary</h3>
            <p className="text-gray-600 text-sm mb-4">
              Understand field definitions and data schemas
            </p>
            <Link href="/datasets" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Browse Datasets →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <Video className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-gray-600 text-sm mb-4">
              Watch step-by-step video guides for common tasks
            </p>
            <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              Watch Videos →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

