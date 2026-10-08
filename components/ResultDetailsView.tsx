'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ScanResult,
  URLAnalysisResult,
  EmailAnalysisResult,
  ExtractedUrl
} from '@/types/security';
import CircularRiskScore from './CircularRiskScore';
import RiskBadge from './RiskBadge';
import IndicatorsList from './IndicatorsList';
import VirusTotalCard from './VirusTotalCard';
import Timeline from './Timeline';
import RecommendationsCard from './RecommendationsCard';
import {
  ShieldAlert,
  ShieldCheck,
  Globe,
  Mail,
  ArrowLeft,
  Share2,
  Download,
  AlertTriangle,
  ExternalLink,
  Search,
  CheckCircle2,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { getRiskVerdict } from '@/lib/riskEngine';

interface ResultDetailsViewProps {
  scan: ScanResult;
}

export default function ResultDetailsView({ scan }: ResultDetailsViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [analyzingUrl, setAnalyzingUrl] = useState<string | null>(null);

  const isUrl = scan.type === 'URL';
  const urlScan = isUrl ? (scan as URLAnalysisResult) : null;
  const emailScan = !isUrl ? (scan as EmailAnalysisResult) : null;

  const verdictText = getRiskVerdict(scan.classification);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phishguard-report-${scan.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDeepScanUrl = async (extractedUrl: string) => {
    setAnalyzingUrl(extractedUrl);
    try {
      const res = await fetch('/api/scan/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: extractedUrl })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/results/${data.id}`);
      }
    } catch {
      // Fallback
    } finally {
      setAnalyzingUrl(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scan History</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share Report'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-colors shadow-[0_0_12px_rgba(34,211,238,0.25)]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* Target Identity Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-bold">
              REPORT ID: {scan.id}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(scan.timestamp).toLocaleString()}
            </span>
            {scan.isDemo && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                DEMO DATA
              </span>
            )}
          </div>

          <RiskBadge category={scan.classification} size="md" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            {isUrl ? 'Target Web Destination' : 'Analyzed Email Subject'}
          </span>
          <div className="font-mono text-base sm:text-lg font-bold text-white break-all flex items-center gap-2">
            {isUrl ? (
              <>
                <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>{scan.target}</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>{emailScan?.subject}</span>
              </>
            )}
          </div>
        </div>

        {/* Email specific sender metadata */}
        {emailScan && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono border-t border-slate-800/80">
            <div>
              <span className="text-slate-500">From Address:</span>{' '}
              <span className="text-slate-200">{emailScan.from}</span>
            </div>
            {emailScan.replyTo && (
              <div>
                <span className="text-slate-500">Reply-To:</span>{' '}
                <span className="text-slate-200">{emailScan.replyTo}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Analysis Section: Circular Gauge + Threat Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Circular Risk Score Visualizer */}
        <div>
          <CircularRiskScore
            score={scan.riskScore}
            classification={scan.classification}
            confidence={scan.confidence}
          />
        </div>

        {/* Right: SOC Threat Verdict & Analytical Confidence */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  SOC VERDICT & THREAT CLASSIFICATION
                </span>
                <h2 className="text-lg font-bold text-white font-mono mt-1">
                  {scan.classification === 'CRITICAL' || scan.classification === 'HIGH_RISK'
                    ? 'PHISHING / DECEPTIVE MALICIOUS ENTITY'
                    : scan.classification === 'MEDIUM_RISK'
                    ? 'SUSPICIOUS / ELEVATED RISK'
                    : 'CLEAN / BENIGN REPUTATION'}
                </h2>
              </div>
              <RiskBadge category={scan.classification} size="lg" />
            </div>

            {/* Verdict Callout */}
            <div
              className={`p-4 rounded-xl border text-sm font-medium ${
                scan.riskScore >= 60
                  ? 'bg-rose-950/40 border-rose-800/70 text-rose-200'
                  : scan.riskScore >= 40
                  ? 'bg-amber-950/40 border-amber-800/70 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-800/70 text-emerald-200'
              }`}
            >
              <div className="font-mono text-xs uppercase tracking-wider font-bold mb-1 opacity-80">
                Primary Assessment Verdict
              </div>
              <p className="leading-relaxed">{verdictText}</p>
            </div>

            {/* Analytical Confidence Clarification */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-cyan-400 font-bold">Analytical Confidence: {Math.round(scan.confidence * 100)}%</span>
                <span className="text-slate-500">Heuristic Engine Calibration</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Note: This percentage represents the prototype algorithm's mathematical corroboration across multiple independent heuristics and vendor telemetry feeds, not a guaranteed empirical certainty.
              </p>
            </div>
          </div>

          {/* Scoring Matrix Weights Breakdown */}
          {urlScan?.scoreBreakdown && (
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Signal Weight Breakdown:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">VirusTotal</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.vtScore}/100</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">URL Patterns</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.urlHeuristicScore}/100</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Domain Host</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.domainScore}/100</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Brand Spoof</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.brandScore}/100</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Anomalies</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.otherScore}/100</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Analysis Pipeline Sequence */}
      <Timeline
        type={scan.type}
        riskScore={scan.riskScore}
        vtAvailable={isUrl ? Boolean(urlScan?.virusTotal.available) : false}
      />

      {/* VirusTotal Threat Intelligence Card (For URL Scans) */}
      {isUrl && urlScan && (
        <div>
          <VirusTotalCard virusTotal={urlScan.virusTotal} />
        </div>
      )}

      {/* Email Specific: Sender Analysis & Extracted URLs */}
      {emailScan && (
        <div className="space-y-6">
          {/* Sender Analysis Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <h4 className="font-mono text-sm font-semibold text-slate-100">Sender Identity & Mismatch Analysis</h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                  emailScan.senderAnalysis.spoofingRisk === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : emailScan.senderAnalysis.spoofingRisk === 'HIGH'
                    ? 'bg-orange-950 text-orange-300 border-orange-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}
              >
                Spoof Risk: {emailScan.senderAnalysis.spoofingRisk}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">From Domain:</span>
                <span className="text-white font-bold">{emailScan.senderAnalysis.fromDomain || 'None'}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Reply-To Mismatch:</span>
                <span className={emailScan.senderAnalysis.replyToMismatch ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {emailScan.senderAnalysis.replyToMismatch ? '⚠ MISMATCH DETECTED' : '✓ Verified Match'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase">Link Domain Alignment:</span>
                <span className={emailScan.senderAnalysis.embeddedDomainMismatch ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {emailScan.senderAnalysis.embeddedDomainMismatch ? '🚨 EXTERNAL LINK ROUTING' : '✓ Aligned'}
                </span>
              </div>
            </div>
          </div>

          {/* Extracted URLs List */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h4 className="font-mono text-sm font-semibold text-slate-100">
                  Extracted URLs From Email Body ({emailScan.extractedUrls.length} Discovered)
                </h4>
              </div>
            </div>

            {emailScan.extractedUrls.length === 0 ? (
              <p className="text-xs font-mono text-slate-400">No embedded URLs detected in the email body.</p>
            ) : (
              <div className="space-y-2.5">
                {emailScan.extractedUrls.map((linkItem, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="space-y-0.5 overflow-hidden max-w-xl">
                      <span className="text-cyan-300 font-medium truncate block">{linkItem.url}</span>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span>Domain: {linkItem.domain}</span>
                        <span>•</span>
                        <span>Heuristic Score: {linkItem.heuristicScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <RiskBadge category={linkItem.classification} size="sm" />
                      <button
                        onClick={() => handleDeepScanUrl(linkItem.url)}
                        disabled={analyzingUrl === linkItem.url}
                        className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {analyzingUrl === linkItem.url ? 'Analyzing...' : 'Deep Analyze URL →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Why Was This Flagged? Security Indicators */}
      <div>
        <IndicatorsList indicators={scan.indicators} />
      </div>

      {/* Actionable Recommendations */}
      <div>
        <RecommendationsCard
          classification={scan.classification}
          recommendations={scan.recommendations}
        />
      </div>

      {/* Technical Metadata Inspection Details */}
      {isUrl && urlScan && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 font-mono text-xs text-slate-400">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-200">Raw Technical Inspection Metrics</span>
            <span className="text-[11px] text-slate-500">Heuristic Parser Output</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Apex TLD:</span>
              <span className="text-slate-200 font-bold">.{urlScan.domainHeuristics.tld || 'none'}</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Shannon Entropy:</span>
              <span className="text-slate-200 font-bold">{urlScan.domainHeuristics.entropy}</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Subdomains:</span>
              <span className="text-slate-200 font-bold">{urlScan.domainHeuristics.subdomainCount}</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Path Depth:</span>
              <span className="text-slate-200 font-bold">{urlScan.urlHeuristics.pathDepth}</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Punycode / IDN:</span>
              <span className={urlScan.domainHeuristics.isPunycode ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                {urlScan.domainHeuristics.isPunycode ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Direct IP Host:</span>
              <span className={urlScan.domainHeuristics.isIpAddress ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                {urlScan.domainHeuristics.isIpAddress ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">TLS Scheme:</span>
              <span className={urlScan.urlHeuristics.isHttps ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {urlScan.urlHeuristics.isHttps ? 'HTTPS' : 'HTTP (Cleartext)'}
              </span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 block">Query Parameters:</span>
              <span className="text-slate-200 font-bold">{urlScan.urlHeuristics.queryParamCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

