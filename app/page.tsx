import React from 'react';
import Link from 'next/link';
import ScannerInterface from '@/components/ScannerInterface';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Globe,
  Mail,
  Database,
  Terminal,
  ArrowRight,
  Lock
} from 'lucide-react';
import { getAllScans } from '@/lib/storage';
import RiskBadge from '@/components/RiskBadge';

export default function HomePage() {
  const scans = getAllScans();
  const recentAlerts = scans.slice(0, 4);

  return (
    <div className="space-y-12 pb-16 font-mono">
      {/* Hero Scanner Terminal Section */}
      <section className="pt-6 sm:pt-10 cyber-grid pb-6 border-b border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScannerInterface initialTab="url" />
        </div>
      </section>

      {/* Live Threat Feed Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 rounded-xl border border-emerald-500/20 bg-[#0d1411] shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-950 mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Live Ingested Threat Feed &amp; Audit Log
              </h2>
            </div>
            <Link
              href="/history"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View Audit Log ({scans.length}) →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentAlerts.map((item) => (
              <Link
                key={item.id}
                href={`/results/${item.id}`}
                className="p-3.5 rounded border border-emerald-950 bg-[#080d0b] hover:border-emerald-700/60 hover:bg-[#0c1511] transition-all space-y-2 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0d1411] text-emerald-400 border border-emerald-900 font-bold">
                    {item.type}
                  </span>
                  <RiskBadge category={item.classification} size="sm" />
                </div>

                <div className="text-xs text-slate-200 truncate group-hover:text-emerald-300 transition-colors">
                  {item.target}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-emerald-950 pt-1.5">
                  <span>Score: {item.riskScore}/100</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tri-Pillar Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
            Comprehensive Phishing &amp; Exposure Triage
          </h2>
          <p className="text-slate-400 text-xs max-w-xl mx-auto">
            Combines local heuristics, email spoofing detection, and VirusTotal multi-vendor intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-[#0d1411] space-y-2 hover:border-emerald-700/60 transition-colors">
            <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 uppercase">20+ Local Heuristic Signatures</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes Shannon domain entropy, Punycode IDN lookalikes, high-risk TLDs (.top, .xyz), auth tokens, and credential harvesting patterns.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-[#0d1411] space-y-2 hover:border-emerald-700/60 transition-colors">
            <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 uppercase">Email Spoofing &amp; Link Mismatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flags From vs Reply-To domain divergence, deceptive brand impersonation, urgency triggers, and extracts embedded URLs safely without execution.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-[#0d1411] space-y-2 hover:border-emerald-700/60 transition-colors">
            <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-100 uppercase">Email Breach &amp; VirusTotal Intel</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Checks whether target email identities have leaked in stealer logs (RedLine, Naz.API) and queries VirusTotal domain reputation.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Protocol Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 rounded-xl border border-emerald-500/30 bg-[#0b1310] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm uppercase">Air-Gapped Zero-Execution Inspection</h4>
              <p className="text-xs text-slate-400 max-w-xl mt-0.5">
                All URLs and emails are analyzed strictly as strings and metadata. Untrusted scripts or downloads are blocked from reaching the client browser.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard"
              className="px-3.5 py-2 rounded bg-[#080d0b] hover:bg-[#121c17] text-slate-200 text-xs border border-emerald-900 transition-colors"
            >
              SOC Dashboard
            </Link>
            <Link
              href="/scan"
              className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            >
              Launch Scanner →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
