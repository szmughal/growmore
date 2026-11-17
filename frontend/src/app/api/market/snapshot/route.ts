import { NextResponse } from 'next/server';

export const revalidate = 30; // Next.js ISR revalidation every 30 seconds

export async function GET() {
  try {
    const res = await fetch('https://backend.capitalmarketsforall.com/api/market/snapshot?view=full', {
      headers: {
        'Origin': 'https://www.portfolio360.app',
        'Referer': 'https://www.portfolio360.app/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Failed to fetch official PSX snapshot:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch live feed from official stream',
        meta: { marketClosed: true, fromCache: false },
      },
      { status: 502 }
    );
  }
}
