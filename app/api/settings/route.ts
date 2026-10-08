import { NextRequest, NextResponse } from 'next/server';
import { getAppSettings, saveAppSettings } from '@/lib/storage';

export async function GET() {
  const settings = getAppSettings();
  const envKey = process.env.VIRUSTOTAL_API_KEY;
  const activeKey = settings.apiKey || envKey;

  const isConfigured = Boolean(activeKey && activeKey.trim().length > 10);
  const maskedKey = isConfigured
    ? `${activeKey!.substring(0, 4)}••••••••${activeKey!.slice(-4)}`
    : '';

  return NextResponse.json({
    hasApiKey: isConfigured,
    maskedKey,
    apiKeySource: settings.apiKey ? 'settings' : envKey ? 'env' : 'none',
    demoMode: settings.demoMode,
    weights: settings.weights,
    autoExtractUrls: settings.autoExtractUrls
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.apiKey !== undefined) {
      updateData.apiKey = body.apiKey.trim();
    }
    if (typeof body.demoMode === 'boolean') {
      updateData.demoMode = body.demoMode;
    }
    if (typeof body.autoExtractUrls === 'boolean') {
      updateData.autoExtractUrls = body.autoExtractUrls;
    }
    if (body.weights && typeof body.weights === 'object') {
      updateData.weights = body.weights;
    }

    const updated = saveAppSettings(updateData);

    const activeKey = updated.apiKey || process.env.VIRUSTOTAL_API_KEY;
    const isConfigured = Boolean(activeKey && activeKey.trim().length > 10);

    return NextResponse.json({
      success: true,
      hasApiKey: isConfigured,
      maskedKey: isConfigured ? `${activeKey!.substring(0, 4)}••••••••${activeKey!.slice(-4)}` : '',
      demoMode: updated.demoMode,
      weights: updated.weights,
      autoExtractUrls: updated.autoExtractUrls
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

