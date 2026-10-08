'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mail,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { DEMO_URLS, DEMO_EMAILS } from '@/lib/sampleData';
import { ScanResult, URLAnalysisResult, EmailAnalysisResult } from '@/types/security';

export default function ScannerInterface({ initialTab = 'url' }: { initialTab?: 'url' | 'email' }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'url' | 'email'>(initialTab);

  // URL state
  const [urlInput, setUrlInput] = useState('');

  // Email state
  const [emailFrom, setEmailFrom] = useState('');
  const [emailReplyTo, setEmailReplyTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailHeaders, setEmailHeaders] = useState('');
  const [showHeaders, setShowHeaders] = useState(false);

  // Loading & Progress state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0 to 5
  const [errorMsg, setErrorMsg] = useState('');
  const [recentScanResult, setRecentScanResult] = useState<ScanResult | null>(null);

  const scanStepsList = [
    'Parsing & validating target format',
    'Extracting hostname and domain infrastructure',
    'Executing 20+ signature heuristic checks',
    'Querying VirusTotal threat intelligence',
    'Synthesizing risk matrix and confidence model'
  ];

  const handleUrlScan = async (targetToScan?: string) => {
    const raw = targetToScan || urlInput;
    if (!raw.trim()) {
      setErrorMsg('Please enter a URL to analyze.');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);
    setRecentScanResult(null);

    // Progressive step animation
    setScanStep(0);
    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch('/api/scan/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw.trim() })
      });

      const data = await res.json();
      clearInterval(stepInterval);
      setScanStep(5);

      if (!res.ok) {
        throw new Error(data.error || 'Scan failed');
      }

      setRecentScanResult(data);
      // Automatically redirect to detailed results page after a brief moment
      setTimeout(() => {
        router.push(`/results/${data.id}`);
      }, 700);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsScanning(false);
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed. Please check the URL.');
    }
  };

  const handleEmailScan = async () => {
    if (!emailBody.trim() && !emailSubject.trim()) {
      setErrorMsg('Please provide the email subject or body text.');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);
    setRecentScanResult(null);

    setScanStep(0);
    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch('/api/scan/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: emailFrom,
          replyTo: emailReplyTo,
          subject: emailSubject,
          body: emailBody,
          receivedHeaders: emailHeaders
        })
      });

      const data = await res.json();
      clearInterval(stepInterval);
      setScanStep(5);

      if (!res.ok) {
        throw new Error(data.error || 'Email analysis failed');
      }

      setRecentScanResult(data);
      setTimeout(() => {
        router.push(`/results/${data.id}`);
      }, 700);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsScanning(false);
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed.');
    }
  };

  const loadDemoEmail = (demo: (typeof DEMO_EMAILS)[0]) => {
    setEmailFrom(demo.from);
    setEmailReplyTo(demo.replyTo || '');
    setEmailSubject(demo.subject);
    setEmailBody(demo.body);
    setEmailHeaders(demo.receivedHeaders || '');
    if (demo.receivedHeaders) setShowHeaders(true);
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Platform Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Phishing Defense Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
          Phish<span className="text-cyan-400">Guard</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          AI-Assisted Phishing Email & URL Detection. Transparent heuristics, VirusTotal threat intelligence, and explainable risk scoring.
        </p>
      </div>

      {/* Main Interactive Scanner Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle top cyan line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 pb-4 mb-6 gap-2">
          <button
            onClick={() => {
              setActiveTab('url');
              setErrorMsg('');
            }}
            disabled={isScanning}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'url'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>URL Scanner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('email');
              setErrorMsg('');
            }}
            disabled={isScanning}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'email'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Analyzer</span>
          </button>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start gap-3 text-rose-300 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Analysis Halted</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Scanner Form Tab 1: URL Scanner */}
        {activeTab === 'url' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Target URL or Domain
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleUrlScan()}
                    placeholder="https://example.com/login"
                    disabled={isScanning}
                    className="w-full pl-10 pr-4 py-3.5 rounded-lg bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm transition-all shadow-inner"
                  />
                </div>

                <button
                  onClick={() => handleUrlScan()}
                  disabled={isScanning}
                  className="px-6 py-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Analyze URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Demo Presets */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Or Test Realistic Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {DEMO_URLS.map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUrlInput(demo.url);
                      handleUrlScan(demo.url);
                    }}
                    disabled={isScanning}
                    className="text-xs font-mono px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition-all text-left flex items-center gap-2 group cursor-pointer"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        demo.type.includes('Safe')
                          ? 'bg-emerald-400'
                          : demo.type.includes('Suspicious')
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span>{demo.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scanner Form Tab 2: Email Analyzer */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            {/* Quick Email Presets */}
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-800/60">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Demo Scenarios:</span>
              {DEMO_EMAILS.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadDemoEmail(demo)}
                  disabled={isScanning}
                  className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-all cursor-pointer"
                >
                  {demo.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  From: (Sender Display & Address)
                </label>
                <input
                  type="text"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  placeholder="PayPal Security <security@paypal-account-notice.example>"
                  disabled={isScanning}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Reply-To: (Optional)
                </label>
                <input
                  type="text"
                  value={emailReplyTo}
                  onChange={(e) => setEmailReplyTo(e.target.value)}
                  placeholder="billing-drop@untrusted.xyz"
                  disabled={isScanning}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Subject Line:
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="URGENT: Your account has been suspended"
                disabled={isScanning}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Email Body: (Plain text or HTML)
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Paste the email body here. PhishGuard will safely extract embedded hyperlinks, verify sender domains, and test urgency patterns without rendering executable code..."
                rows={5}
                disabled={isScanning}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
              />
            </div>

            {/* Optional Received Headers */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowHeaders(!showHeaders)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-mono transition-colors"
              >
                <span>{showHeaders ? 'Hide Received Headers' : '+ Add Received Headers (Optional for SPF/DKIM verification)'}</span>
                {showHeaders ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showHeaders && (
                <div className="mt-2">
                  <textarea
                    value={emailHeaders}
                    onChange={(e) => setEmailHeaders(e.target.value)}
                    placeholder="Received: from mail.phishrelay.xyz ([198.51.100.12]); spf=fail; dkim=fail..."
                    rows={2}
                    disabled={isScanning}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            <div className="pt-3">
              <button
                onClick={() => handleEmailScan()}
                disabled={isScanning}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Analyze Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step-by-step Scanning Experience (Framer Motion) */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-6 border-t border-slate-800/80 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Target Security Posture...
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {Math.min(100, Math.round(((scanStep + 1) / 5) * 100))}%
                </span>
              </div>

              <div className="space-y-2">
                {scanStepsList.map((stepDesc, idx) => {
                  const isDone = idx < scanStep;
                  const isCurrent = idx === scanStep;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-mono transition-all ${
                        isDone
                          ? 'bg-slate-950/80 border-cyan-900/60 text-cyan-300'
                          : isCurrent
                          ? 'bg-slate-900 border-cyan-500/50 text-white shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                      )}
                      <span>{stepDesc}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

