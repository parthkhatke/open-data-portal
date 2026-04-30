'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Calendar, Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest Reports</h1>
          <p className="text-xl text-gray-600">
            Access recent reports and data summaries
          </p>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Public Safety Annual Report 2024</h3>
                  <p className="text-gray-600 text-sm mb-2">Comprehensive analysis of crime trends and police response metrics</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Published: January 15, 2024</span>
                  </div>
                </div>
              </div>
              <a
                href="/reports/sample-report.pdf"
                download
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">City Services Performance Q4 2023</h3>
                  <p className="text-gray-600 text-sm mb-2">311 service requests, response times, and resolution metrics</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Published: December 20, 2023</span>
                  </div>
                </div>
              </div>
              <a
                href="/reports/sample-report.pdf"
                download
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Download className="w-5 h-5" />
                Download
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

