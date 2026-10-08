import { NextRequest, NextResponse } from 'next/server';
import { normalizeUrl, analyzeDomainHeuristics, analyzeUrlHeuristics } from '@/lib/urlAnalyzer';
import { queryVirusTotal } from '@/lib/virusTotal';
import { calculateUrlRiskScore, generateRecommendations } from '@/lib/riskEngine';
import { saveScan, getAppSettings } from '@/lib/storage';
import { URLAnalysisResult } from '@/types/security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body.url;

    if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid URL. Please enter a valid web address.' },
        { status: 400 }
      );
    }

    let urlObj: URL;
    let normalized: string;
    try {
      const parsed = normalizeUrl(rawUrl);
      urlObj = parsed.url;
      normalized = parsed.normalized;
    } catch {
      return NextResponse.json(
        { error: 'Malformed URL. Please check the format (e.g., https://example.com/login).' },
        { status: 400 }
      );
    }

    const settings = getAppSettings();

    // 1. Local Domain & URL Heuristic Analysis
    const domainAnalysis = analyzeDomainHeuristics(urlObj);
    const urlAnalysis = analyzeUrlHeuristics(urlObj);

    // 2. Query VirusTotal Intelligence
    const vtResult = await queryVirusTotal(
      normalized,
      settings.apiKey || process.env.VIRUSTOTAL_API_KEY,
      settings.demoMode
    );

    // 3. Compute Risk Score & Classification
    const { finalScore, classification, confidence, scoreBreakdown, vtIndicators } = calculateUrlRiskScore(
      domainAnalysis.score,
      urlAnalysis.score,
      domainAnalysis.heuristics,
      urlAnalysis.heuristics,
      vtResult,
      settings.weights
    );

    // Aggregate all security indicators
    const allIndicators = [
      ...vtIndicators,
      ...domainAnalysis.indicators,
      ...urlAnalysis.indicators
    ];

    // Sort by severity (CRITICAL -> HIGH -> MEDIUM -> LOW -> SAFE)
    const severityOrder: Record<string, number> = {
      CRITICAL: 1,
      HIGH: 2,
      MEDIUM: 3,
      LOW: 4,
      INFO: 5,
      SAFE: 6
    };
    allIndicators.sort((a, b) => (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99));

    // 4. Generate Actionable Security Recommendations
    const recommendations = generateRecommendations(classification, allIndicators);

    const scanResult: URLAnalysisResult = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      target: normalized,
      domain: urlObj.hostname,
      timestamp: new Date().toISOString(),
      type: 'URL',
      riskScore: finalScore,
      classification,
      confidence,
      indicators: allIndicators,
      domainHeuristics: domainAnalysis.heuristics,
      urlHeuristics: urlAnalysis.heuristics,
      virusTotal: vtResult,
      recommendations,
      scoreBreakdown,
      isDemo: vtResult.isDemo
    };

    // Save to persistent scan log
    saveScan(scanResult);

    return NextResponse.json(scanResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal analysis error';
    return NextResponse.json(
      { error: `Analysis failed: ${message}. Local engine remains active.` },
      { status: 500 }
    );
  }
}

