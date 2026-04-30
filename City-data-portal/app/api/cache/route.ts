import { NextRequest, NextResponse } from 'next/server';
import { apiCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, key } = body;

    switch (action) {
      case 'clear':
        if (key) {
          apiCache.delete(key);
          return NextResponse.json({ 
            success: true, 
            message: `Cache cleared for key: ${key}` 
          });
        } else {
          apiCache.clear();
          return NextResponse.json({ 
            success: true, 
            message: 'All cache cleared' 
          });
        }

      case 'stats':
        return NextResponse.json({
          success: true,
          stats: apiCache.getStats(),
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "clear" or "stats"' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      { error: error.message || 'Cache operation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      stats: apiCache.getStats(),
    });
  } catch (error: any) {
    console.error('Cache API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}
