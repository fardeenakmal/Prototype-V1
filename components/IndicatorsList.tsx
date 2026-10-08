'use client';

import React, { useState } from 'react';
import { SecurityIndicator, SeverityLevel } from '@/types/security';
import {
  AlertOctagon,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe,
  Link as LinkIcon,
  Mail,
  Zap,
  Database
} from 'lucide-react';

interface IndicatorsListProps {
  indicators: SecurityIndicator[];
}

export default function IndicatorsList({ indicators }: IndicatorsListProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    [indicators[0]?.id || '']: true
  });

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSeverityStyle = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-rose-900/60 bg-rose-950/20',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
          icon: AlertOctagon,
          iconColor: 'text-rose-400'
        };
      case 'HIGH':
        return {
          border: 'border-orange-900/60 bg-orange-950/20',
          badge: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
          icon: ShieldAlert,
          iconColor: 'text-orange-400'
        };
      case 'MEDIUM':
        return {
          border: 'border-amber-900/60 bg-amber-950/20',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
          icon: AlertTriangle,
          iconColor: 'text-amber-400'
        };
      case 'LOW':
        return {
          border: 'border-emerald-900/40 bg-emerald-950/10',
          badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
          icon: Info,
          iconColor: 'text-emerald-400'
        };
      case 'SAFE':
        return {
          border: 'border-emerald-900/40 bg-emerald-950/10',
          badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50',
          icon: CheckCircle,
          iconColor: 'text-emerald-400'
        };
      default:
        return {
          border: 'border-slate-800 bg-slate-900/40',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Info,
          iconColor: 'text-slate-400'
        };
    }
  };

  if (!indicators || indicators.length === 0) {
    return (
      <div className="p-5 rounded-xl border border-emerald-950 bg-[#0d1411] text-center font-mono">
        <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
        <p className="text-xs text-slate-200 font-bold uppercase">No threat indicators triggered</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Target exhibited zero abnormal heuristic signatures or vendor detections.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white uppercase">Detected Security Indicators</h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#080d0b] text-emerald-400 border border-emerald-900">
            {indicators.length} Signals
          </span>
        </div>
        <button
          onClick={() => {
            const allExpanded = indicators.every(i => expandedIds[i.id]);
            const nextState: Record<string, boolean> = {};
            indicators.forEach(i => {
              nextState[i.id] = !allExpanded;
            });
            setExpandedIds(nextState);
          }}
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          {indicators.every(i => expandedIds[i.id]) ? '[-] Collapse All' : '[+] Expand All'}
        </button>
      </div>

      <div className="space-y-2">
        {indicators.map((ind) => {
          const style = getSeverityStyle(ind.severity);
          const SeverityIcon = style.icon;
          const isExpanded = Boolean(expandedIds[ind.id]);

          return (
            <div
              key={ind.id}
              className={`rounded border transition-all ${style.border}`}
            >
              <div
                onClick={() => toggleExpand(ind.id)}
                className="p-3 flex items-start justify-between cursor-pointer gap-2.5 select-none"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`mt-0.5 p-1 rounded bg-[#080d0b] border border-emerald-950 ${style.iconColor}`}>
                    <SeverityIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-100">{ind.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${style.badge}`}
                      >
                        {ind.severity}
                      </span>
                      {ind.scoreContribution > 0 && (
                        <span className="text-[9px] text-slate-400 bg-[#080d0b] px-1.5 py-0.2 rounded border border-emerald-950">
                          +{ind.scoreContribution} pts
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">{ind.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 pt-0.5">
                  <span className="text-[10px] uppercase hidden sm:inline">
                    {ind.category}
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 pt-0.5 border-t border-emerald-950/60 bg-[#080d0b]/80 text-xs">
                  <div className="p-2.5 rounded bg-[#0d1411] border border-emerald-950 space-y-1.5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-0.5">
                        Technical Telemetry Explanation:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{ind.technicalExplanation}</p>
                    </div>

                    {ind.evidence && (
                      <div className="pt-1.5 border-t border-emerald-950 flex items-start gap-2">
                        <span className="text-[10px] text-slate-500 shrink-0">Evidence:</span>
                        <code className="text-[10px] text-emerald-300 break-all bg-[#080d0b] px-1.5 py-0.5 rounded border border-emerald-950">
                          {ind.evidence}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
