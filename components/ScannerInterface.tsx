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
  Terminal,
  Database,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  UserX
} from 'lucide-react';
import { DEMO_URLS, DEMO_EMAILS } from '@/lib/sampleData';
import { DEMO_BREACH_EMAILS } from '@/lib/emailLeakScanner';
import { ScanResult } from '@/types/security';

export default function ScannerInterface({ initialTab = 'url' }: { initialTab?: 'url' | 'email' | 'leak' }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'url' | 'email' | 'leak'>(initialTab);

  // URL state
  const [urlInput, setUrlInput] = useState('');

  // Email Analyzer state
  const [emailFrom, setEmailFrom] = useState('');
  const [emailReplyTo, setEmailReplyTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailHeaders, setEmailHeaders] = useState('');
  const [showHeaders, setShowHeaders] = useState(false);

  // Email Leak / Breach Scanner state
  const [leakEmailInput, setLeakEmailInput] = useState('');

  // Execution & Progress state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const urlSteps = [
    '[01/05] Normalizing URI scheme & canonicalizing target host',
    '[02/05] Evaluating Shannon domain entropy & Punycode homographs',
    '[03/05] Scanning path & query strings against credential harvesting patterns',
    '[04/05] Querying VirusTotal multi-vendor threat intelligence v3 API',
    '[05/05] Generating SOC threat matrix & analytical confidence index'
  ];

  const emailSteps = [
    '[01/05] Parsing RFC 5322 email headers & envelope addresses',
    '[02/05] Checking From vs Reply-To domain alignment & spoofing vectors',
    '[03/05] Extracting embedded hyperlinks without evaluating untrusted code',
    '[04/05] Screening for social engineering coercion & credential lures',
    '[05/05] Synthesizing sender risk score & containment recommendations'
  ];

  const leakSteps = [
    '[01/05] Validating target mailbox syntax & extracting mail domain',
    '[02/05] Querying VirusTotal domain reputation & MX server status',
    '[03/05] Searching known stealer logs (RedLine, Lumma) & combo dumps',
    '[04/05] Inspecting compromised attributes (plaintext passwords, session tokens)',
    '[05/05] Calculating identity exposure level & remediation protocols'
  ];

  const currentSteps = activeTab === 'url' ? urlSteps : activeTab === 'email' ? emailSteps : leakSteps;

  const handleUrlScan = async (targetToScan?: string) => {
    const raw = targetToScan || urlInput;
    if (!raw.trim()) {
      setErrorMsg('Error: Specify a valid URL or host to inspect.');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 400);

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
        throw new Error(data.error || 'Inspection halted.');
      }

      setTimeout(() => {
        router.push(`/results/${data.id}`);
      }, 600);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsScanning(false);
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed.');
    }
  };

  const handleEmailScan = async () => {
    if (!emailBody.trim() && !emailSubject.trim()) {
      setErrorMsg('Error: Email subject or body content required for triage.');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 400);

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
        throw new Error(data.error || 'Email analysis halted.');
      }

      setTimeout(() => {
        router.push(`/results/${data.id}`);
      }, 600);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsScanning(false);
      setErrorMsg(err instanceof Error ? err.message : 'Analysis failed.');
    }
  };

  const handleLeakScan = async (targetEmail?: string) => {
    const raw = targetEmail || leakEmailInput;
    if (!raw.trim() || !raw.includes('@')) {
      setErrorMsg('Error: Specify a valid email address (e.g. user@target.com).');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 400);

    try {
      const res = await fetch('/api/scan/email-leak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: raw.trim() })
      });

      const data = await res.json();
      clearInterval(stepInterval);
      setScanStep(5);

      if (!res.ok) {
        throw new Error(data.error || 'Breach lookup failed.');
      }

      setTimeout(() => {
        router.push(`/results/${data.id}`);
      }, 600);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsScanning(false);
      setErrorMsg(err instanceof Error ? err.message : 'Breach lookup failed.');
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
    <div className="w-full max-w-4xl mx-auto space-y-6 font-mono">
      {/* Console Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0c1511] border border-emerald-500/30 text-emerald-400 text-xs">
          <Terminal className="w-3.5 h-3.5" />
          <span>CYBERSECURITY THREAT & IOC INSPECTION TERMINAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
          PHISH<span className="text-emerald-400">GUARD</span> CONSOLE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          High-assurance phishing detection, email spoofing triage, and VirusTotal threat & breach intelligence.
        </p>
      </div>

      {/* Main Terminal Box */}
      <div className="rounded-xl border border-emerald-500/30 bg-[#0d1411]/95 shadow-[0_0_25px_rgba(16,185,129,0.06)] p-5 sm:p-7 relative">
        {/* Terminal top titlebar */}
        <div className="flex items-center justify-between border-b border-emerald-950 pb-3 mb-5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-emerald-400 font-bold uppercase">sec-ops@phishguard-terminal:~$</span>
          </div>
          <span className="text-[11px] text-emerald-500/60 hidden sm:inline">VT_API_V3 // ACTIVE</span>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap border-b border-emerald-950 pb-3 mb-5 gap-2">
          <button
            onClick={() => {
              setActiveTab('url');
              setErrorMsg('');
            }}
            disabled={isScanning}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-900/40'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>[1] URL Scanner</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('email');
              setErrorMsg('');
            }}
            disabled={isScanning}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-900/40'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>[2] Email Body & Headers</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('leak');
              setErrorMsg('');
            }}
            disabled={isScanning}
            className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'leak'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-900/40'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>[3] Email Leak & Breach Checker</span>
          </button>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded bg-rose-950/60 border border-rose-700/80 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase block">Analysis Interrupted</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Tab 1: URL Scanner */}
        {activeTab === 'url' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <span>Target URL / Domain Endpoint</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/70">
                    <span className="text-xs font-bold">&gt;</span>
                  </div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleUrlScan()}
                    placeholder="https://example.com/login"
                    disabled={isScanning}
                    className="w-full pl-8 pr-3 py-2.5 rounded bg-[#080d0b] border border-emerald-900 text-emerald-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 text-xs"
                  />
                </div>

                <button
                  onClick={() => handleUrlScan()}
                  disabled={isScanning}
                  className="px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Inspecting...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Inspect URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Demo Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-500 uppercase block font-semibold">
                Test Telemetry Presets:
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
                    className="text-[11px] px-2.5 py-1 rounded bg-[#090e0c] hover:bg-[#121c18] text-slate-300 hover:text-emerald-300 border border-emerald-950 hover:border-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer"
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

        {/* Tab 2: Email Analyzer */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-emerald-950 text-xs">
              <span className="text-slate-500 uppercase font-semibold">Presets:</span>
              {DEMO_EMAILS.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadDemoEmail(demo)}
                  disabled={isScanning}
                  className="px-2.5 py-0.5 rounded bg-[#090e0c] hover:bg-[#121c18] text-slate-300 hover:text-emerald-300 border border-emerald-950 text-[11px] cursor-pointer"
                >
                  {demo.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase text-emerald-400 block mb-1">
                  From: (Sender Display &amp; Address)
                </label>
                <input
                  type="text"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  placeholder="Security Team <security@paypal-notice.example>"
                  disabled={isScanning}
                  className="w-full px-3 py-2 rounded bg-[#080d0b] border border-emerald-900 text-emerald-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase text-emerald-400 block mb-1">
                  Reply-To: (Optional Mailbox)
                </label>
                <input
                  type="text"
                  value={emailReplyTo}
                  onChange={(e) => setEmailReplyTo(e.target.value)}
                  placeholder="attacker-drop@external-domain.xyz"
                  disabled={isScanning}
                  className="w-full px-3 py-2 rounded bg-[#080d0b] border border-emerald-900 text-emerald-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase text-emerald-400 block mb-1">
                Subject Line:
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="URGENT: Action Required - Account Suspended"
                disabled={isScanning}
                className="w-full px-3 py-2 rounded bg-[#080d0b] border border-emerald-900 text-emerald-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase text-emerald-400 block mb-1">
                Email Body Text:
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Paste message contents here. System will isolate hyperlinks, analyze domain mismatches, and flag social engineering keywords..."
                rows={4}
                disabled={isScanning}
                className="w-full px-3 py-2 rounded bg-[#080d0b] border border-emerald-900 text-emerald-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-400 resize-y"
              />
            </div>

            {/* Optional Headers */}
            <div>
              <button
                type="button"
                onClick={() => setShowHeaders(!showHeaders)}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
              >
                <span>{showHeaders ? '[-] Hide RFC Headers' : '[+] Add Received Headers (SPF/DKIM inspection)'}</span>
              </button>

              {showHeaders && (
                <textarea
                  value={emailHeaders}
                  onChange={(e) => setEmailHeaders(e.target.value)}
                  placeholder="Received: from mail.relay.org ([198.51.100.12]); spf=fail; dkim=fail..."
                  rows={2}
                  disabled={isScanning}
                  className="w-full mt-2 px-3 py-1.5 rounded bg-[#080d0b] border border-emerald-900 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-400"
                />
              )}
            </div>

            <button
              onClick={() => handleEmailScan()}
              disabled={isScanning}
              className="px-6 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  <span>Triage Email</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 3: Email Leak & Breach Scanner (Requested Feature) */}
        {activeTab === 'leak' && (
          <div className="space-y-5">
            <div className="p-3.5 rounded bg-[#080e0c] border border-emerald-500/20 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase">
                <Database className="w-4 h-4" />
                <span>Email Breach &amp; VirusTotal Exposure Checker</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Checks if a target email address was exfiltrated in known stealer logs (RedLine, Lumma, Naz.API), combo lists, or credential breach dumps, and checks VirusTotal domain threat reputation.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-emerald-400 font-bold block">
                Target Email Address to Check:
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/70">
                    <span className="text-xs font-bold">&gt;</span>
                  </div>
                  <input
                    type="email"
                    value={leakEmailInput}
                    onChange={(e) => setLeakEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleLeakScan()}
                    placeholder="victim-executive@company.com"
                    disabled={isScanning}
                    className="w-full pl-8 pr-3 py-2.5 rounded bg-[#080d0b] border border-emerald-900 text-emerald-100 placeholder-slate-600 focus:outline-none focus:border-emerald-400 text-xs"
                  />
                </div>

                <button
                  onClick={() => handleLeakScan()}
                  disabled={isScanning}
                  className="px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning Breaches...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>Check Breaches &amp; VT</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Demo Presets for Leak Check */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-500 uppercase block font-semibold">
                Test Breach Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                {DEMO_BREACH_EMAILS.map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLeakEmailInput(demo.email);
                      handleLeakScan(demo.email);
                    }}
                    disabled={isScanning}
                    className="text-[11px] px-2.5 py-1 rounded bg-[#090e0c] hover:bg-[#121c18] text-slate-300 hover:text-emerald-300 border border-emerald-950 hover:border-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        demo.type.includes('Clean')
                          ? 'bg-emerald-400'
                          : demo.type.includes('High') || demo.type.includes('Critical')
                          ? 'bg-rose-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span>{demo.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Terminal Execution Feedback (Framer Motion) */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-5 border-t border-emerald-950 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span className="font-bold flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  PIPELINE EXECUTION IN PROGRESS...
                </span>
                <span>{Math.min(100, Math.round(((scanStep + 1) / 5) * 100))}%</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {currentSteps.map((stepDesc, idx) => {
                  const isDone = idx < scanStep;
                  const isCurrent = idx === scanStep;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded border ${
                        isDone
                          ? 'bg-[#080e0c] border-emerald-900/60 text-emerald-400'
                          : isCurrent
                          ? 'bg-[#0b1712] border-emerald-500/50 text-white'
                          : 'bg-[#080d0b] border-emerald-950/40 text-slate-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                      )}
                      <span>{stepDesc}</span>
                    </div>
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
