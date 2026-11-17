import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET() {
  try {
    const res = await fetch('https://backend.capitalmarketsforall.com/api/market/summary', {
      headers: {
        'Origin': 'https://www.portfolio360.app',
        'Referer': 'https://www.portfolio360.app/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Failed to fetch official PSX summary:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch market summary',
      },
      { status: 502 }
    );
  }
}
