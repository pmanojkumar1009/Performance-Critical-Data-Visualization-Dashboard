import { NextRequest, NextResponse } from 'next/server';
import { DataGenerator } from '@/lib/dataGenerator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/data
 * Generate initial dataset for the dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '1000', 10);
    const countClamped = Math.min(Math.max(count, 1), 10000); // Limit between 1 and 10k

    const generator = new DataGenerator();
    const data = generator.generateInitialDataset(countClamped);

    return NextResponse.json({
      data,
      count: data.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error generating data:', error);
    return NextResponse.json(
      { error: 'Failed to generate data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/data
 * Generate a new data point (for real-time updates)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { previousTimestamp } = body;

    const generator = new DataGenerator();
    const timestamp = previousTimestamp ? previousTimestamp + 100 : Date.now();
    const point = generator.generatePoint(timestamp);

    return NextResponse.json({
      data: point,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error generating data point:', error);
    return NextResponse.json(
      { error: 'Failed to generate data point' },
      { status: 500 }
    );
  }
}



