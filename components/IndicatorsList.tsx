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
  Zap
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
          border: 'border-sky-900/40 bg-sky-950/10',
          badge: 'bg-sky-950/70 text-sky-300 border-sky-700/50',
          icon: Info,
          iconColor: 'text-sky-400'
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'virustotal':
        return Zap;
      case 'domain':
        return Globe;
      case 'url':
        return LinkIcon;
      case 'mismatch':
        return Mail;
      default:
        return Cpu;
    }
  };

  if (!indicators || indicators.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-sm text-slate-300 font-medium">No threat indicators triggered</p>
        <p className="text-xs text-slate-500 mt-1">
          Heuristic analysis and threat feeds detected no abnormal indicators for this target.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-white tracking-tight">Why was this flagged?</h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
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
          className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
        >
          {indicators.every(i => expandedIds[i.id]) ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-2.5">
        {indicators.map((ind) => {
          const style = getSeverityStyle(ind.severity);
          const SeverityIcon = style.icon;
          const CategoryIcon = getCategoryIcon(ind.category);
          const isExpanded = Boolean(expandedIds[ind.id]);

          return (
            <div
              key={ind.id}
              className={`rounded-lg border transition-all ${style.border}`}
            >
              {/* Header row */}
              <div
                onClick={() => toggleExpand(ind.id)}
                className="p-3.5 flex items-start justify-between cursor-pointer gap-3 select-none"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1 rounded bg-slate-950/80 border border-slate-800 ${style.iconColor}`}>
                    <SeverityIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-100">{ind.name}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${style.badge}`}
                      >
                        {ind.severity}
                      </span>
                      {ind.scoreContribution > 0 && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          +{ind.scoreContribution} pts
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{ind.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500 hover:text-slate-300 pt-0.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider hidden sm:inline">
                    {ind.category}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Expandable Technical Explanation */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/60 bg-slate-950/40 text-xs">
                  <div className="p-3 rounded bg-slate-900/80 border border-slate-800/80 space-y-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block mb-0.5">
                        Technical Explanation
                      </span>
                      <p className="text-slate-300 leading-relaxed">{ind.technicalExplanation}</p>
                    </div>

                    {ind.evidence && (
                      <div className="pt-2 border-t border-slate-800 flex items-start gap-2">
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">Evidence:</span>
                        <code className="text-[11px] font-mono text-cyan-300 break-all bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">
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

