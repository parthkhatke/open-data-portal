'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useUserInfo from '@/app/(hooks)/useUserInfo';

export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const { loggedIn } = useUserInfo();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loggedIn === false && pathname !== '/login') {
      router.replace('/login');
    }
  }, [loggedIn, pathname, router]);

  if (loggedIn === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
