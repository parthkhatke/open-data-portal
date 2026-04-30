'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Briefcase, Building2, GraduationCap, Shield, Wrench, Home, Car, Leaf, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';

const audienceConfig: Record<string, {
  name: string;
  icon: any;
  description: string;
  dashboards: Array<{ id: string; name: string; icon: any; gradient: string; description: string }>;
  quickLinks: Array<{ name: string; link: string; description: string }>;
  insights: string[];
}> = {
  residents: {
    name: 'Residents',
    icon: Users,
    description: 'Explore your neighborhood, understand safety trends, and access city services data',
    dashboards: [
      {
        id: 'public-safety',
        name: 'Public Safety',
        icon: Shield,
        gradient: 'from-red-500 to-rose-500',
        description: 'Crime incidents, police data, and safety metrics for your area',
      },
      {
        id: 'city-services',
        name: 'City Services',
        icon: Wrench,
        gradient: 'from-cyan-500 to-blue-500',
        description: '311 service requests, code enforcement, and service delivery',
      },
      {
        id: 'transportation',
        name: 'Transportation',
        icon: Car,
        gradient: 'from-indigo-500 to-blue-500',
        description: 'Traffic accidents, transit stops, and mobility data',
      },
      {
        id: 'environment',
        name: 'Environment',
        icon: Leaf,
        gradient: 'from-green-500 to-emerald-500',
        description: 'Tree canopy, stormwater, and environmental data',
      },
    ],
    quickLinks: [
      { name: 'Map Explorer', link: '/explore/map', description: 'View data on an interactive map' },
      { name: 'Neighborhood Pages', link: '/neighborhoods/uptown', description: 'Explore your neighborhood' },
    ],
    insights: [
      'Track crime trends in your neighborhood',
      'Monitor 311 service requests and response times',
      'View traffic and safety data',
      'Explore environmental metrics',
    ],
  },
  'businesses-developers': {
    name: 'Businesses & Developers',
    icon: Briefcase,
    description: 'Access APIs, download datasets, and integrate city data into your applications',
    dashboards: [
      {
        id: 'housing-development',
        name: 'Housing & Development',
        icon: Home,
        gradient: 'from-yellow-500 to-amber-500',
        description: 'Building permits, zoning, and development trends',
      },
      {
        id: 'transportation',
        name: 'Transportation',
        icon: Car,
        gradient: 'from-indigo-500 to-blue-500',
        description: 'Traffic patterns and transit data for planning',
      },
    ],
    quickLinks: [
      { name: 'Data Catalog', link: '/datasets', description: 'Browse all available datasets' },
      { name: 'API Documentation', link: '/datasets', description: 'Access API endpoints' },
      { name: 'Download Datasets', link: '/datasets', description: 'Get data in CSV/JSON format' },
    ],
    insights: [
      'Access building permit and zoning data',
      'Download datasets for analysis and integration',
      'Use REST APIs for real-time data access',
      'Explore development trends and patterns',
    ],
  },
  'city-operations': {
    name: 'City Operations',
    icon: Building2,
    description: 'Monitor service delivery, track KPIs, and identify areas needing attention',
    dashboards: [
      {
        id: 'city-services',
        name: 'City Services',
        icon: Wrench,
        gradient: 'from-cyan-500 to-blue-500',
        description: '311 requests, SLA compliance, and service delivery metrics',
      },
      {
        id: 'public-safety',
        name: 'Public Safety',
        icon: Shield,
        gradient: 'from-red-500 to-rose-500',
        description: 'CMPD incidents and crime trends',
      },
      {
        id: 'transportation',
        name: 'Transportation',
        icon: Car,
        gradient: 'from-indigo-500 to-blue-500',
        description: 'Traffic incidents and mobility metrics',
      },
    ],
    quickLinks: [
      { name: 'All Dashboards', link: '/dashboards', description: 'View all operational dashboards' },
      { name: 'Map Explorer', link: '/explore/map', description: 'Geographic analysis' },
      { name: 'Data Catalog', link: '/datasets', description: 'Access source data' },
    ],
    insights: [
      'Monitor 311 request volumes and resolution times',
      'Track SLA compliance across departments',
      'Identify high-priority service areas',
      'Analyze trends and patterns',
    ],
  },
  researchers: {
    name: 'Researchers',
    icon: GraduationCap,
    description: 'Access historical data, trends, and downloadable datasets for analysis',
    dashboards: [
      {
        id: 'public-safety',
        name: 'Public Safety',
        icon: Shield,
        gradient: 'from-red-500 to-rose-500',
        description: 'Crime data and trends for research',
      },
      {
        id: 'city-services',
        name: 'City Services',
        icon: Wrench,
        gradient: 'from-cyan-500 to-blue-500',
        description: 'Service delivery and civic engagement data',
      },
      {
        id: 'housing-development',
        name: 'Housing & Development',
        icon: Home,
        gradient: 'from-yellow-500 to-amber-500',
        description: 'Building permits and development trends',
      },
    ],
    quickLinks: [
      { name: 'Data Catalog', link: '/datasets', description: 'Browse and download datasets' },
      { name: 'All Dashboards', link: '/dashboards', description: 'View insights and trends' },
      { name: 'API Access', link: '/datasets', description: 'Programmatic data access' },
    ],
    insights: [
      'Download complete datasets in CSV/JSON format',
      'Access historical data for trend analysis',
      'Use API endpoints for automated data collection',
      'Explore metrics and visualizations',
    ],
  },
};

export default function AudiencePage() {
  const params = useParams();
  const type = params?.type as string;
  const config = audienceConfig[type];

  if (!config) {
    notFound();
  }

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          ← Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl text-white">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                For {config.name}
              </h1>
              <p className="text-gray-600 text-lg mt-2">{config.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 mb-8 shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            What You Can Do
          </h2>
          <ul className="space-y-2">
            {config.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start text-gray-700">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Recommended Dashboards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Recommended Dashboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.dashboards.map((dashboard, idx) => {
              const DashboardIcon = dashboard.icon;
              return (
                <motion.div
                  key={dashboard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                >
                  <Link
                    href={`/dashboards/${dashboard.id}`}
                    className="group block p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl transform hover:-translate-y-1 h-full"
                  >
                    <div className={`inline-flex p-3 bg-gradient-to-br ${dashboard.gradient} rounded-xl text-white mb-4 group-hover:scale-110 transition-transform`}>
                      <DashboardIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{dashboard.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{dashboard.description}</p>
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                      View Dashboard
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4 text-gray-900">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.quickLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.link}
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{link.name}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

