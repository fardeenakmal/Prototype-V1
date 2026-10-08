'use client';

import React, { useState } from 'react';
import { VirusTotalResult } from '@/types/security';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface VirusTotalCardProps {
  virusTotal: VirusTotalResult;
}

export default function VirusTotalCard({ virusTotal }: VirusTotalCardProps) {
  const [showEngines, setShowEngines] = useState(false);

  // When VT is not configured
  if (!virusTotal.available && !virusTotal.configured) {
    return (
      <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/10 space-y-2 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-950 border border-amber-800 text-amber-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase">VirusTotal Threat Intelligence</h4>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold">
                  UNCONFIGURED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Vendor reputation lookup inactive. Local heuristic analysis remains fully active.
              </p>
            </div>
          </div>

          <Link
            href="/settings"
            className="text-xs text-emerald-400 hover:text-emerald-300 underline"
          >
            Configure Key →
          </Link>
        </div>

        <div className="p-2.5 rounded bg-[#080d0b] border border-emerald-950 text-[11px] text-slate-400 leading-relaxed">
          {virusTotal.message ||
            'To query 90+ antivirus and web reputation engines simultaneously, provide a VirusTotal API key in Settings.'}
        </div>
      </div>
    );
  }

  // When VT is configured but had rate limit / timeout / error
  if (!virusTotal.available && virusTotal.configured) {
    return (
      <div className="p-4 rounded-xl border border-emerald-950 bg-[#0d1411] space-y-2 font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase">VirusTotal Threat Intelligence</h4>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#080d0b] text-slate-400 border border-emerald-950">
            {virusTotal.detectionRatio}
          </span>
        </div>
        <p className="text-xs text-slate-400">{virusTotal.message}</p>
      </div>
    );
  }

  const total = virusTotal.totalEngines || (virusTotal.malicious + virusTotal.suspicious + virusTotal.harmless + virusTotal.undetected) || 94;
  const malPct = (virusTotal.malicious / total) * 100;
  const suspPct = (virusTotal.suspicious / total) * 100;
  const harmPct = (virusTotal.harmless / total) * 100;

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-emerald-500/25 bg-[#0d1411]/95 shadow-lg space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-100 uppercase">VirusTotal Global Threat Intelligence</h4>
              {virusTotal.isDemo && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  DEMO DATA
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Aggregated consensus across 90+ security scanning vendors.
            </p>
          </div>
        </div>

        <div>
          <span
            className={`text-xs px-2.5 py-1 rounded font-bold border ${
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
        <div className="h-2.5 w-full rounded-full bg-[#080d0b] overflow-hidden flex border border-emerald-950">
          {virusTotal.malicious > 0 && (
            <div
              style={{ width: `${Math.max(malPct, 4)}%` }}
              className="bg-rose-500 transition-all duration-500"
            />
          )}
          {virusTotal.suspicious > 0 && (
            <div
              style={{ width: `${Math.max(suspPct, 3)}%` }}
              className="bg-amber-500 transition-all duration-500"
            />
          )}
          {virusTotal.harmless > 0 && (
            <div
              style={{ width: `${harmPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
            />
          )}
          <div
            style={{ width: `${100 - (malPct + suspPct + harmPct)}%` }}
            className="bg-slate-800 transition-all duration-500"
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="flex items-center gap-1.5 bg-[#080d0b] p-2 rounded border border-emerald-950">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-400">Malicious:</span>
            <span className="font-bold text-rose-400 ml-auto">{virusTotal.malicious}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#080d0b] p-2 rounded border border-emerald-950">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Suspicious:</span>
            <span className="font-bold text-amber-400 ml-auto">{virusTotal.suspicious}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#080d0b] p-2 rounded border border-emerald-950">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Harmless:</span>
            <span className="font-bold text-emerald-400 ml-auto">{virusTotal.harmless}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#080d0b] p-2 rounded border border-emerald-950">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="text-slate-400">Undetected:</span>
            <span className="font-bold text-slate-300 ml-auto">{virusTotal.undetected}</span>
          </div>
        </div>
      </div>

      {/* Engine Details Accordion */}
      {virusTotal.engineDetails && virusTotal.engineDetails.length > 0 && (
        <div className="pt-1">
          <button
            onClick={() => setShowEngines(!showEngines)}
            className="flex items-center justify-between w-full p-2 rounded bg-[#080d0b] border border-emerald-950 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>[+] Inspect Engine Detections ({virusTotal.engineDetails.length} Security Providers)</span>
            {showEngines ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showEngines && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 text-xs">
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
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                        : 'bg-[#080d0b] border-emerald-950 text-slate-400'
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
    </div>
  );
}
