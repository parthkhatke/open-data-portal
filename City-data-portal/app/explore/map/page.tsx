import { Suspense } from 'react';
import MapExplorerClient from './MapExplorerClient';

export default function MapExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading map explorer...</p>
          </div>
        </div>
      }
    >
      <MapExplorerClient />
    </Suspense>
  );
}
