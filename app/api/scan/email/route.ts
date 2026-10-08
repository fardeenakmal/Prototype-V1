import { NextRequest, NextResponse } from 'next/server';
import { analyzeEmail } from '@/lib/emailAnalyzer';
import { saveScan } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload.body && !payload.subject) {
      return NextResponse.json(
        { error: 'Email body or subject must be provided for analysis.' },
        { status: 400 }
      );
    }

    const emailResult = analyzeEmail({
      from: payload.from || 'unknown@sender.local',
      replyTo: payload.replyTo || undefined,
      subject: payload.subject || '(No Subject)',
      body: payload.body || '',
      receivedHeaders: payload.receivedHeaders || undefined
    });

    // Check if it matches demo cases or has demo URLs
    if (
      payload.body?.includes('paypal-security-verification.top') ||
      payload.from?.includes('paypal-account-notice.example')
    ) {
      emailResult.isDemo = true;
    }

    saveScan(emailResult);

    return NextResponse.json(emailResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal email analysis error';
    return NextResponse.json(
      { error: `Email analysis failed: ${message}` },
      { status: 500 }
    );
  }
}

