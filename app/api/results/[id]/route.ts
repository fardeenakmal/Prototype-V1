import { NextRequest, NextResponse } from 'next/server';
import { getScanById } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scan = getScanById(id);

  if (!scan) {
    return NextResponse.json(
      { error: `Scan report with ID '${id}' was not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json(scan);
}

