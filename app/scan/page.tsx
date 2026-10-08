import React from 'react';
import ScannerInterface from '@/components/ScannerInterface';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Security Scanner | PhishGuard',
  description: 'AI-assisted Phishing Email & URL Detection Scanner'
};

export default function ScanPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <ScannerInterface initialTab="url" />

      {/* Technical Guidance Card */}
      <div className="max-w-4xl mx-auto p-6 rounded-xl border border-slate-800 bg-slate-900/60 text-xs text-slate-400 space-y-4 font-mono">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Scanner Evaluation Methodology</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <span className="text-cyan-400 font-bold block">URL Scanner Pipeline:</span>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li>Syntactic URL normalization & scheme verification</li>
              <li>Punycode / IDN homograph character testing</li>
              <li>Brand impersonation & lookalike subdomain checks</li>
              <li>Shannon domain randomness / entropy analysis</li>
              <li>Multi-vendor VirusTotal threat reputation lookup</li>
            </ul>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
            <span className="text-cyan-400 font-bold block">Email Analyzer Pipeline:</span>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              <li>Header vs envelope spoofing verification</li>
              <li>Reply-To vs From apex domain mismatch flags</li>
              <li>Zero-execution HTML extraction of embedded links</li>
              <li>Social engineering urgency and coercion indicators</li>
              <li>Phishing lure detection (invoices, password resets, crypto)</li>
            </ul>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
          Disclaimer: This system computes a Prototype Risk Score based on heuristic signatures and external intelligence feeds. It should be used as a triage assistant alongside human SOC analyst review.
        </p>
      </div>
    </div>
  );
}

