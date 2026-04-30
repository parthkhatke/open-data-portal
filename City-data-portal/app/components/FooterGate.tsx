'use client';

import { usePathname } from 'next/navigation';
import CivicFooter from './CivicFooter';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function FooterGate() {
  const pathname = usePathname();
  const normalizedPath =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || '/'
      : pathname;

  if (normalizedPath.startsWith('/explore/map')) {
    return null;
  }

  return <CivicFooter />;
}
