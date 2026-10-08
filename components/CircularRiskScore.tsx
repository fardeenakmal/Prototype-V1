'use client';

import React from 'react';
import { RiskCategory } from '@/types/security';
import RiskBadge from './RiskBadge';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon, HelpCircle } from 'lucide-react';

interface CircularRiskScoreProps {
  score: number;
  classification: RiskCategory;
  confidence: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircularRiskScore({
  score,
  classification,
  confidence,
  size = 220,
  strokeWidth = 14
}: CircularRiskScoreProps) {
  // SVG calculation
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc is 240 degrees (leaving 120 degree open bottom)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(score, 100)) / 100;

  const getColor = () => {
    if (score <= 20) return { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400' };
    if (score <= 40) return { stroke: '#38BDF8', glow: 'rgba(56, 189, 248, 0.4)', text: 'text-sky-400' };
    if (score <= 60) return { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400' };
    if (score <= 80) return { stroke: '#F97316', glow: 'rgba(249, 115, 22, 0.4)', text: 'text-orange-400' };
    return { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.5)', text: 'text-rose-400' };
  };

  const colorConfig = getColor();
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 -top-10"
        style={{ backgroundColor: colorConfig.stroke }}
      />

      <div className="text-center mb-3">
        <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 block font-semibold">
          THREAT ANALYSIS
        </span>
        <span className="text-xs text-slate-500 font-mono">Prototype Risk Engine</span>
      </div>

      {/* Circular Gauge */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-[135deg]"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background track arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorConfig.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 8px ${colorConfig.glow})`
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-mono font-bold tracking-tight ${colorConfig.text}`}>
              {score}
            </span>
            <span className="text-slate-500 font-mono text-base">/100</span>
          </div>

          <div className="mt-2">
            <RiskBadge category={classification} size="sm" />
          </div>

          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">
            Prototype Risk Score
          </span>
        </div>
      </div>

      {/* Analytical Confidence readout */}
      <div className="mt-4 w-full pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5" title="Analytical confidence of the prototype heuristics and intelligence signals">
          <span>Analytical Confidence:</span>
          <span className="text-cyan-400 font-bold">{confidencePercent}%</span>
        </div>
        <div className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
          Corroborated Signals
        </div>
      </div>
    </div>
  );
}

