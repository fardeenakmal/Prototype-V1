import { NextRequest, NextResponse } from 'next/server';
import { checkEmailBreachAndThreats } from '@/lib/emailLeakScanner';
import { saveScan, getAppSettings } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address format (e.g., analyst@company.com).' },
        { status: 400 }
      );
    }

    const settings = getAppSettings();
    const result = await checkEmailBreachAndThreats(
      email.trim(),
      settings.apiKey || process.env.VIRUSTOTAL_API_KEY,
      settings.demoMode
    );

    saveScan(result);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Email breach scan failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

