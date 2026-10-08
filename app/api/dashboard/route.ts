import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/storage';

export async function GET() {
  const stats = getDashboardData();
  return NextResponse.json(stats);
}

