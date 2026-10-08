import React from 'react';
import ScannerInterface from '@/components/ScannerInterface';
import { Info } from 'lucide-react';

export const metadata = {
  title: 'Threat Triage Scanner | PhishGuard',
  description: 'Heuristic Phishing URL, Email Spoof & Identity Breach Scanner'
};

export default function ScanPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-mono">
      <ScannerInterface initialTab="url" />

      {/* Technical Guidance Card */}
      <div className="max-w-4xl mx-auto p-5 rounded-xl border border-emerald-500/20 bg-[#0d1411] text-xs text-slate-400 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-bold uppercase">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Triage Engine Inspection Protocols</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1 p-2.5 rounded bg-[#080d0b] border border-emerald-950">
            <span className="text-emerald-400 font-bold block">[1] URL Scanner Pipeline:</span>
            <ul className="space-y-0.5 text-slate-400 text-[11px] list-disc list-inside">
              <li>Punycode &amp; IDN homograph checks</li>
              <li>Brand impersonation substring matching</li>
              <li>Shannon domain randomness entropy</li>
              <li>VirusTotal v3 URL vendor consensus</li>
            </ul>
          </div>

          <div className="space-y-1 p-2.5 rounded bg-[#080d0b] border border-emerald-950">
            <span className="text-emerald-400 font-bold block">[2] Email Analyzer Pipeline:</span>
            <ul className="space-y-0.5 text-slate-400 text-[11px] list-disc list-inside">
              <li>From vs Reply-To domain divergence</li>
              <li>Embedded link destination mismatch</li>
              <li>Zero-execution HTML link extraction</li>
              <li>Coercion, urgency &amp; credential lures</li>
            </ul>
          </div>

          <div className="space-y-1 p-2.5 rounded bg-[#080d0b] border border-emerald-950">
            <span className="text-emerald-400 font-bold block">[3] Breach &amp; Leak Pipeline:</span>
            <ul className="space-y-0.5 text-slate-400 text-[11px] list-disc list-inside">
              <li>Darknet stealer logs exfiltration test</li>
              <li>Plaintext password &amp; cookie exposure</li>
              <li>VirusTotal mail host reputation</li>
              <li>Remediation &amp; credential rotation</li>
            </ul>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 border-t border-emerald-950 pt-2">
          Notice: Prototype Risk Score is computed via heuristic weights and threat intelligence consensus to assist SOC triage.
        </p>
      </div>
    </div>
  );
}
