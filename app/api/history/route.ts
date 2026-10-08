import { NextRequest, NextResponse } from 'next/server';
import { getAllScans, deleteScan, clearScans } from '@/lib/storage';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const type = searchParams.get('type') || 'ALL';
  const risk = searchParams.get('risk') || 'ALL';

  let scans = getAllScans();

  if (type !== 'ALL') {
    scans = scans.filter(s => s.type === type);
  }

  if (risk !== 'ALL') {
    scans = scans.filter(s => s.classification === risk);
  }

  if (query) {
    scans = scans.filter(s =>
      s.target.toLowerCase().includes(query) ||
      (s.type === 'URL' && s.domain.toLowerCase().includes(query)) ||
      (s.type === 'EMAIL' && (s.from.toLowerCase().includes(query) || s.subject.toLowerCase().includes(query)))
    );
  }

  return NextResponse.json({ scans });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id === 'all') {
    clearScans();
    return NextResponse.json({ success: true, message: 'All scan records cleared' });
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing scan ID' }, { status: 400 });
  }

  const removed = deleteScan(id);
  if (!removed) {
    return NextResponse.json({ error: 'Scan ID not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: `Scan ${id} deleted` });
}

