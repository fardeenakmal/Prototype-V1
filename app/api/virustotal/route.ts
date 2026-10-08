import { NextRequest, NextResponse } from 'next/server';
import { getAppSettings } from '@/lib/storage';

export async function GET() {
  const settings = getAppSettings();
  const envKey = process.env.VIRUSTOTAL_API_KEY;
  const activeKey = settings.apiKey || envKey;

  const isConfigured = Boolean(activeKey && activeKey.trim().length > 10);
  const maskedKey = isConfigured
    ? `${activeKey!.substring(0, 4)}••••••••${activeKey!.slice(-4)}`
    : 'Not Configured';

  return NextResponse.json({
    configured: isConfigured,
    maskedKey,
    source: settings.apiKey ? 'Settings Store' : envKey ? 'Environment Variable' : 'None',
    demoMode: settings.demoMode
  });
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 16) {
      return NextResponse.json(
        { valid: false, message: 'Invalid API key format. VirusTotal API v3 keys are typically 64 characters long.' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const testRes = await fetch('https://www.virustotal.com/api/v3/users/current', {
      method: 'GET',
      headers: {
        'x-apikey': apiKey.trim(),
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (testRes.status === 200) {
      const data = await testRes.json();
      return NextResponse.json({
        valid: true,
        message: 'VirusTotal API key successfully verified!',
        user: data.data?.id || 'Active User'
      });
    } else if (testRes.status === 401) {
      return NextResponse.json(
        { valid: false, message: 'Authentication rejected. The provided API key is invalid.' },
        { status: 401 }
      );
    } else {
      return NextResponse.json(
        { valid: false, message: `VirusTotal responded with HTTP status ${testRes.status}` },
        { status: testRes.status }
      );
    }
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      {
        valid: false,
        message: isTimeout
          ? 'Validation timed out. Check your internet connection.'
          : 'Could not connect to VirusTotal server.'
      },
      { status: 500 }
    );
  }
}

