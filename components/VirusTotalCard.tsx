'use client';

import React, { useState } from 'react';
import { VirusTotalResult } from '@/types/security';
import { Zap, ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface VirusTotalCardProps {
  virusTotal: VirusTotalResult;
}

export default function VirusTotalCard({ virusTotal }: VirusTotalCardProps) {
  const [showEngines, setShowEngines] = useState(false);

  // When VT is not configured
  if (!virusTotal.available && !virusTotal.configured) {
    return (
      <div className="p-5 rounded-xl border border-amber-900/40 bg-amber-950/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-mono text-sm font-semibold text-slate-200">VirusTotal Threat Intelligence</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-700/80 text-amber-400 font-bold">
                  NOT CONFIGURED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Global vendor feed lookup inactive. Local heuristic analysis remains active.
              </p>
            </div>
          </div>

          <Link
            href="/settings"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            Configure Key →
          </Link>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400 leading-relaxed">
          {virusTotal.message ||
            'To query 90+ antivirus and web reputation engines simultaneously, provide a VirusTotal API key in application Settings or environment variable VIRUSTOTAL_API_KEY.'}
        </div>
      </div>
    );
  }

  // When VT is configured but had rate limit / timeout / error
  if (!virusTotal.available && virusTotal.configured) {
    return (
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-mono text-sm font-semibold text-slate-200">VirusTotal Threat Intelligence</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {virusTotal.detectionRatio}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{virusTotal.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Available VirusTotal Report
  const total = virusTotal.totalEngines || (virusTotal.malicious + virusTotal.suspicious + virusTotal.harmless + virusTotal.undetected) || 94;
  const malPct = (virusTotal.malicious / total) * 100;
  const suspPct = (virusTotal.suspicious / total) * 100;
  const harmPct = (virusTotal.harmless / total) * 100;

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-mono text-sm font-semibold text-slate-100">VirusTotal Multi-Engine Intelligence</h4>
              {virusTotal.isDemo && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-700">
                  DEMO DATA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated consensus across 90+ global security scanning engines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-xs px-2.5 py-1 rounded-md font-bold border ${
              virusTotal.malicious > 0
                ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
            }`}
          >
            {virusTotal.detectionRatio}
          </span>
        </div>
      </div>

      {/* Progress Bar Breakdown */}
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
          {virusTotal.malicious > 0 && (
            <div
              style={{ width: `${Math.max(malPct, 4)}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Malicious: ${virusTotal.malicious}`}
            />
          )}
          {virusTotal.suspicious > 0 && (
            <div
              style={{ width: `${Math.max(suspPct, 3)}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`Suspicious: ${virusTotal.suspicious}`}
            />
          )}
          {virusTotal.harmless > 0 && (
            <div
              style={{ width: `${harmPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Harmless: ${virusTotal.harmless}`}
            />
          )}
          <div
            style={{ width: `${100 - (malPct + suspPct + harmPct)}%` }}
            className="bg-slate-700 transition-all duration-500"
            title={`Undetected / Neutral: ${virusTotal.undetected}`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded border border-slate-800/80">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-400">Malicious:</span>
            <span className="font-bold text-rose-400 ml-auto">{virusTotal.malicious}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded border border-slate-800/80">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-400">Suspicious:</span>
            <span className="font-bold text-amber-400 ml-auto">{virusTotal.suspicious}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded border border-slate-800/80">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Harmless:</span>
            <span className="font-bold text-emerald-400 ml-auto">{virusTotal.harmless}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded border border-slate-800/80">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span className="text-slate-400">Undetected:</span>
            <span className="font-bold text-slate-300 ml-auto">{virusTotal.undetected}</span>
          </div>
        </div>
      </div>

      {/* Engine Details Accordion */}
      {virusTotal.engineDetails && virusTotal.engineDetails.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowEngines(!showEngines)}
            className="flex items-center justify-between w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <span>Inspect Engine Detection Details ({virusTotal.engineDetails.length} Providers)</span>
            {showEngines ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showEngines && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 text-xs font-mono">
              {virusTotal.engineDetails.map((eng, idx) => {
                const isMal = eng.category === 'malicious';
                const isSusp = eng.category === 'suspicious';
                const isHarm = eng.category === 'harmless';
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded border flex items-center justify-between ${
                      isMal
                        ? 'bg-rose-950/40 border-rose-800/70 text-rose-300'
                        : isSusp
                        ? 'bg-amber-950/40 border-amber-800/70 text-amber-300'
                        : isHarm
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="truncate pr-2 font-medium">{eng.engine}</span>
                    <span className="text-[10px] font-bold uppercase shrink-0">
                      {eng.result || eng.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer Disclaimer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-800/80 pt-2">
        <span>VirusTotal v3 API Protocol</span>
        {virusTotal.scanDate && (
          <span>Timestamp: {new Date(virusTotal.scanDate).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}

