import React from 'react';
import Link from 'next/link';
import ScannerInterface from '@/components/ScannerInterface';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Cpu,
  BarChart3,
  Layers,
  ArrowRight,
  Lock,
  Globe,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { getAllScans } from '@/lib/storage';
import RiskBadge from '@/components/RiskBadge';

export default function HomePage() {
  const scans = getAllScans();
  const recentAlerts = scans.slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Scanner Section */}
      <section className="pt-8 sm:pt-12 cyber-grid pb-6 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScannerInterface initialTab="url" />
        </div>
      </section>

      {/* Real-time Threat Activity Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                Recent PhishGuard Threat Triage
              </h2>
            </div>
            <Link
              href="/history"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Full History ({scans.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAlerts.map((item) => (
              <Link
                key={item.id}
                href={`/results/${item.id}`}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all space-y-2.5 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {item.type}
                  </span>
                  <RiskBadge category={item.classification} size="sm" />
                </div>

                <div className="font-mono text-xs text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                  {item.target}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
                  <span>Score: {item.riskScore}/100</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            Multi-Signal Defense Architecture
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            PhishGuard pairs local signature heuristics with global threat feeds to evaluate zero-hour deception campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100 font-mono">20+ Local Heuristic Signals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes Shannon domain entropy, Punycode IDN homograph lookalikes, high-risk TLD abuse (.top, .xyz), excessive hyphenation, and auth parameter harvesting tokens.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100 font-mono">VirusTotal Threat Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Queries 90+ antivirus engines and URL reputation databases. Corroborates vendor detections without relying on any single engine.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100 font-mono">Email Sender & Link Mismatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects domain impersonation where From headers, Reply-To mailboxes, and embedded hyperlinks mismatch, alongside urgency and credential solicitation patterns.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Protocol Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl border border-cyan-900/50 bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-950 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base font-mono">Zero-Execution Sandbox Inspection</h4>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                PhishGuard safely inspects URLs and emails as textual entities. Malicious JavaScript is never executed and client browsers are shielded from dangerous redirects.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs border border-slate-700 transition-colors"
            >
              Open SOC Dashboard
            </Link>
            <Link
              href="/scan"
              className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-colors shadow-[0_0_12px_rgba(34,211,238,0.3)]"
            >
              Start Analysis →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
