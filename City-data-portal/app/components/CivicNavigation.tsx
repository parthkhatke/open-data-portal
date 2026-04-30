'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown,
  BarChart3,
  Database,
  FileText,
  Home,
  MapPin,
  Brain
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const navLinks = [
  { 
    href: '/', 
    label: 'Home',
    icon: Home 
  },
  { 
    href: '/dashboards', 
    label: 'Dashboards',
    icon: BarChart3,
    children: [
      // Priority dashboards
      { href: '/dashboards/demographics', label: 'Demographics' },
      { href: '/dashboards/police', label: 'Police & Law Enforcement' },
      { href: '/dashboards/transportation', label: 'Transportation' },
      { href: '/dashboards/environment', label: 'Environment' },
      { href: '/dashboards/safety', label: 'Public Safety' },
      { href: '/dashboards/health', label: 'Health' },
      // Other dashboards
      { href: '/dashboards/economy', label: 'Economy' },
      { href: '/dashboards/education', label: 'Education' },
      { href: '/dashboards/housing', label: 'Housing & Development' },
      { href: '/dashboards/city-services', label: 'City Services' },
      { href: '/dashboards/civic-engagement', label: 'Civic Engagement' },
      { href: '/dashboards/utilities', label: 'Utilities' },
      { href: '/dashboards/waste-management', label: 'Waste Management' },
      { href: '/dashboards/geographic', label: 'Geographic' },
    ]
  },
  { 
    href: '/datasets', 
    label: 'Data Catalog',
    icon: Database 
  },
  { 
    href: '/explore/map', 
    label: 'Map Explorer',
    icon: MapPin 
  },
  { 
    href: '/reports', 
    label: 'Reports',
    icon: FileText 
  },
  { 
    href: '/decision-assistance', 
    label: 'Decision & Reasoning',
    icon: Brain 
  },
];


export default function CivicNavigation() {
  const pathname = usePathname();
  const { isNavOpen, setIsNavOpen } = useCivic();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      {/* Main Navigation */}
      <header className="sticky top-0 z-50 w-full">
        {/* Thin accent line */}
        <div className="h-[3px] bg-gradient-to-r from-domain-transport-400 via-domain-economy-400 to-domain-environment-400" />
        
        <nav className="bg-civic-white/95 backdrop-blur-civic border-b border-civic-sand/50">
          <div className="max-w-civic-full mx-auto px-6 lg:px-10">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex flex-col">
                  <span className="font-display text-xl font-semibold text-civic-ink tracking-tight">
                    Charlotte
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-civic-stone font-medium -mt-1">
                    Data Portal
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                  const hasChildren = link.children && link.children.length > 0;
                  
                  return (
                    <div 
                      key={link.href} 
                      className="relative"
                      onMouseEnter={() => hasChildren && setOpenDropdown(link.href)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <Link
                        href={link.href}
                        className={`
                          flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-civic
                          transition-all duration-rail ease-rail
                          ${isActive 
                            ? 'text-civic-ink bg-civic-cream' 
                            : 'text-civic-charcoal hover:text-civic-ink hover:bg-civic-cream/50'
                          }
                        `}
                      >
                        {link.label}
                        {hasChildren && (
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-rail ${openDropdown === link.href ? 'rotate-180' : ''}`} />
                        )}
                      </Link>

                      {/* Dropdown */}
                      <AnimatePresence>
                        {hasChildren && openDropdown === link.href && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                            className={`absolute top-full left-0 mt-1 bg-white rounded-civic-lg shadow-civic-lg border border-civic-sand/50 py-2 z-50 ${
                              link.children && link.children.length > 8 ? 'w-[420px]' : 'w-56'
                            }`}
                          >
                            <div className={link.children && link.children.length > 8 ? 'grid grid-cols-2 gap-x-2' : ''}>
                              {link.children?.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="block px-4 py-2.5 text-sm text-civic-charcoal hover:text-civic-ink hover:bg-civic-cream transition-colors whitespace-nowrap"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsNavOpen(!isNavOpen)}
                  className="lg:hidden flex items-center justify-center w-10 h-10 rounded-civic text-civic-charcoal hover:text-civic-ink hover:bg-civic-cream"
                >
                  {isNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </nav>

      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-civic-ink/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsNavOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-civic-white shadow-civic-xl z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-civic-sand">
                <span className="font-display text-lg font-semibold text-civic-ink">Menu</span>
                <button
                  onClick={() => setIsNavOpen(false)}
                  className="p-2 rounded-civic hover:bg-civic-cream"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsNavOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-civic text-civic-charcoal hover:text-civic-ink hover:bg-civic-cream transition-colors"
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                      {link.children && (
                        <div className="ml-8 mt-1 space-y-1">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsNavOpen(false)}
                              className="block px-4 py-2 text-sm text-civic-stone hover:text-civic-charcoal transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
