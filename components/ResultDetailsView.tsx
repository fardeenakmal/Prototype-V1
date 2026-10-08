'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ScanResult,
  URLAnalysisResult,
  EmailAnalysisResult,
  EmailLeakResult,
  ExtractedUrl
} from '@/types/security';
import CircularRiskScore from './CircularRiskScore';
import RiskBadge from './RiskBadge';
import IndicatorsList from './IndicatorsList';
import VirusTotalCard from './VirusTotalCard';
import Timeline from './Timeline';
import RecommendationsCard from './RecommendationsCard';
import {
  Globe,
  Mail,
  ArrowLeft,
  Download,
  AlertTriangle,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Database,
  Lock,
  Key,
  ShieldAlert,
  AlertOctagon
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
  const isEmail = scan.type === 'EMAIL';
  const isLeak = scan.type === 'EMAIL_LEAK';

  const urlScan = isUrl ? (scan as URLAnalysisResult) : null;
  const emailScan = isEmail ? (scan as EmailAnalysisResult) : null;
  const leakScan = isLeak ? (scan as EmailLeakResult) : null;

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
    <div className="space-y-6 font-mono">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-950 pb-3">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>[←] Back to Audit Log</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0b1410] hover:bg-[#12201a] text-slate-300 text-xs border border-emerald-950 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share IOC'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0b1410] hover:bg-[#12201a] text-slate-300 text-xs border border-emerald-950 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>New Triage</span>
          </Link>
        </div>
      </div>

      {/* Target Identity Banner */}
      <div className="p-5 rounded-xl border border-emerald-500/25 bg-[#0d1411]/95 shadow-lg space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#080d0b] text-emerald-400 border border-emerald-900 font-bold">
              REPORT_ID: {scan.id}
            </span>
            <span className="text-[10px] text-slate-500">
              {new Date(scan.timestamp).toLocaleString()}
            </span>
            {scan.isDemo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                DEMO DATA
              </span>
            )}
          </div>

          <RiskBadge category={scan.classification} size="md" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase text-emerald-500/80 font-bold block">
            {isUrl
              ? 'Target Web Destination'
              : isEmail
              ? 'Subject Line'
              : 'Target Mailbox Identity'}
          </span>
          <div className="text-base sm:text-lg font-bold text-white break-all flex items-center gap-2">
            {isUrl && (
              <>
                <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{scan.target}</span>
              </>
            )}
            {isEmail && (
              <>
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{emailScan?.subject}</span>
              </>
            )}
            {isLeak && (
              <>
                <Database className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{leakScan?.email}</span>
              </>
            )}
          </div>
        </div>

        {/* Email Header Details */}
        {emailScan && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs border-t border-emerald-950">
            <div>
              <span className="text-slate-500">From:</span>{' '}
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

        {/* Email Leak Target Details */}
        {leakScan && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs border-t border-emerald-950">
            <div>
              <span className="text-slate-500">Domain:</span>{' '}
              <span className="text-slate-200">{leakScan.domain}</span>
            </div>
            <div>
              <span className="text-slate-500">Breach Incidents:</span>{' '}
              <span className={leakScan.breachCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {leakScan.breachCount} Records
              </span>
            </div>
            <div>
              <span className="text-slate-500">VT Mail Host Intel:</span>{' '}
              <span className={leakScan.domainThreat.isMalicious ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {leakScan.domainThreat.isMalicious ? 'Flagged Malicious' : 'Clean'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Analysis Section: Gauge + Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Circular Risk Score Visualizer */}
        <div>
          <CircularRiskScore
            score={scan.riskScore}
            classification={scan.classification}
            confidence={scan.confidence}
          />
        </div>

        {/* Right: SOC Assessment Verdict */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-emerald-500/25 bg-[#0d1411]/95 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-2">
              <div>
                <span className="text-[10px] uppercase text-emerald-500/80 font-bold block">
                  SOC VERDICT &amp; THREAT CLASSIFICATION
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  {scan.classification === 'CRITICAL' || scan.classification === 'HIGH_RISK'
                    ? 'CRITICAL EXPOSURE / DECEPTIVE MALICIOUS ENTITY'
                    : scan.classification === 'MEDIUM_RISK'
                    ? 'SUSPICIOUS / ELEVATED RISK ANOMALY'
                    : 'BENIGN / NO ANOMALIES DETECTED'}
                </h2>
              </div>
              <RiskBadge category={scan.classification} size="md" />
            </div>

            {/* Verdict Callout */}
            <div
              className={`p-3.5 rounded border text-xs leading-relaxed ${
                scan.riskScore >= 60
                  ? 'bg-rose-950/40 border-rose-800/70 text-rose-200'
                  : scan.riskScore >= 40
                  ? 'bg-amber-950/40 border-amber-800/70 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-800/70 text-emerald-200'
              }`}
            >
              <div className="text-[10px] uppercase font-bold mb-1 opacity-80">
                Primary Assessment Verdict
              </div>
              <p>{verdictText}</p>
            </div>

            {/* Analytical Confidence */}
            <div className="p-3 rounded bg-[#080d0b] border border-emerald-950 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-emerald-400 font-bold">Analytical Confidence: {Math.round(scan.confidence * 100)}%</span>
                <span className="text-slate-500 text-[10px]">Multi-Signal Corroboration</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Represents cross-validation consensus between heuristic signatures, darknet breach records, and VirusTotal vendor telemetry.
              </p>
            </div>
          </div>

          {/* Scoring Matrix Weights Breakdown (For URL Scans) */}
          {urlScan?.scoreBreakdown && (
            <div className="pt-2 border-t border-emerald-950 space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Signal Weights:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2 rounded bg-[#080d0b] border border-emerald-950">
                  <span className="text-slate-500 text-[10px] block">VirusTotal</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.vtScore}/100</span>
                </div>
                <div className="p-2 rounded bg-[#080d0b] border border-emerald-950">
                  <span className="text-slate-500 text-[10px] block">URL Heuristics</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.urlHeuristicScore}/100</span>
                </div>
                <div className="p-2 rounded bg-[#080d0b] border border-emerald-950">
                  <span className="text-slate-500 text-[10px] block">Domain Host</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.domainScore}/100</span>
                </div>
                <div className="p-2 rounded bg-[#080d0b] border border-emerald-950">
                  <span className="text-slate-500 text-[10px] block">Brand Spoof</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.brandScore}/100</span>
                </div>
                <div className="p-2 rounded bg-[#080d0b] border border-emerald-950">
                  <span className="text-slate-500 text-[10px] block">Other Anomalies</span>
                  <span className="font-bold text-white">{urlScan.scoreBreakdown.otherScore}/100</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Sequence */}
      <Timeline
        type={isUrl ? 'URL' : 'EMAIL'}
        riskScore={scan.riskScore}
        vtAvailable={isUrl ? Boolean(urlScan?.virusTotal.available) : Boolean(leakScan?.virusTotal.available)}
      />

      {/* Special Module: EMAIL LEAK / BREACH SCAN RESULTS */}
      {isLeak && leakScan && (
        <div className="space-y-5">
          {/* Breach Incidents Card */}
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-[#0d1411]/95 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100 uppercase">
                  Data Breach &amp; Stealer Log Compromise Telemetry
                </h4>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                  leakScan.isLeaked
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}
              >
                {leakScan.isLeaked ? `EXPOSED IN ${leakScan.breachCount} BREACHES` : '0 EXPOSURES DETECTED'}
              </span>
            </div>

            {leakScan.breaches.length === 0 ? (
              <div className="p-4 rounded bg-[#080d0b] border border-emerald-950 text-xs text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No active credential leaks or info-stealer exfiltrations detected for this identity.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {leakScan.breaches.map((breach, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded bg-[#080d0b] border border-rose-950/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="font-bold text-white text-sm">{breach.name}</span>
                        <span className="text-[10px] text-slate-500">[{breach.date}]</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                        {breach.severity} EXPOSURE
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">{breach.description}</p>

                    <div className="pt-2 border-t border-emerald-950/60 flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="text-slate-500">Exposed Data:</span>
                      {breach.dataExposed.map((item, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-2 py-0.5 rounded bg-[#121c17] text-emerald-300 border border-emerald-900/60"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VirusTotal Domain Threat Card for Email Provider */}
          <VirusTotalCard virusTotal={leakScan.virusTotal} />
        </div>
      )}

      {/* VirusTotal Card for URL Scans */}
      {isUrl && urlScan && (
        <VirusTotalCard virusTotal={urlScan.virusTotal} />
      )}

      {/* Email Body & Sender Analysis */}
      {isEmail && emailScan && (
        <div className="space-y-5">
          {/* Sender Analysis Card */}
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-[#0d1411]/95 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100 uppercase">Sender Domain Alignment</h4>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded bg-[#080d0b] border border-emerald-950">
                <span className="text-slate-500 block text-[10px] uppercase">From Domain:</span>
                <span className="text-white font-bold">{emailScan.senderAnalysis.fromDomain || 'None'}</span>
              </div>

              <div className="p-2.5 rounded bg-[#080d0b] border border-emerald-950">
                <span className="text-slate-500 block text-[10px] uppercase">Reply-To Alignment:</span>
                <span className={emailScan.senderAnalysis.replyToMismatch ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {emailScan.senderAnalysis.replyToMismatch ? '⚠ MISMATCH DETECTED' : '✓ Verified Match'}
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#080d0b] border border-emerald-950">
                <span className="text-slate-500 block text-[10px] uppercase">Link Destination Domain:</span>
                <span className={emailScan.senderAnalysis.embeddedDomainMismatch ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {emailScan.senderAnalysis.embeddedDomainMismatch ? '🚨 EXTERNAL ROUTING' : '✓ Aligned'}
                </span>
              </div>
            </div>
          </div>

          {/* Extracted URLs List */}
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-[#0d1411]/95 space-y-3">
            <h4 className="text-sm font-bold text-slate-100 uppercase">
              Extracted URLs From Email Body ({emailScan.extractedUrls.length} Discovered)
            </h4>

            {emailScan.extractedUrls.length === 0 ? (
              <p className="text-xs text-slate-400">No embedded URLs detected in the email body.</p>
            ) : (
              <div className="space-y-2">
                {emailScan.extractedUrls.map((linkItem, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded bg-[#080d0b] border border-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="overflow-hidden max-w-xl">
                      <span className="text-emerald-300 font-medium truncate block">{linkItem.url}</span>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span>Domain: {linkItem.domain}</span>
                        <span>•</span>
                        <span>Score: {linkItem.heuristicScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <RiskBadge category={linkItem.classification} size="sm" />
                      <button
                        onClick={() => handleDeepScanUrl(linkItem.url)}
                        disabled={analyzingUrl === linkItem.url}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {analyzingUrl === linkItem.url ? 'Analyzing...' : 'Deep Inspect →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Why Was This Flagged? Indicators */}
      <div>
        <IndicatorsList indicators={scan.indicators} />
      </div>

      {/* Actionable Incident Response Protocol */}
      <div>
        <RecommendationsCard
          classification={scan.classification}
          recommendations={scan.recommendations}
        />
      </div>
    </div>
  );
}
