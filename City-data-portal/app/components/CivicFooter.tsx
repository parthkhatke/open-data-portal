'use client';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function CivicFooter() {
  return (
    <footer className="bg-civic-ink text-civic-white">
      <div className="max-w-civic-full mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-civic-stone">Powered by</span>
          <img 
            src={`${basePath}/dataos.png`}
            alt="DataOS"
            className="h-6 w-auto brightness-0 invert"
          />
        </div>
      </div>
    </footer>
  );
}
