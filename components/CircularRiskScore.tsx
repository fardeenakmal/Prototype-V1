'use client';

import React from 'react';
import { RiskCategory } from '@/types/security';
import RiskBadge from './RiskBadge';

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
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(score, 100)) / 100;

  const getColor = () => {
    if (score <= 20) return { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400' };
    if (score <= 40) return { stroke: '#34D399', glow: 'rgba(52, 211, 153, 0.4)', text: 'text-emerald-300' };
    if (score <= 60) return { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400' };
    if (score <= 80) return { stroke: '#F97316', glow: 'rgba(249, 115, 22, 0.4)', text: 'text-orange-400' };
    return { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.5)', text: 'text-rose-400' };
  };

  const colorConfig = getColor();
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-[#0d1411]/95 rounded-xl border border-emerald-500/25 shadow-lg relative overflow-hidden font-mono">
      {/* Background glow */}
      <div
        className="absolute w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-15 -top-10"
        style={{ backgroundColor: colorConfig.stroke }}
      />

      <div className="text-center mb-2">
        <span className="text-[10px] tracking-widest uppercase text-emerald-400 block font-bold">
          THREAT SCORE ASSESSMENT
        </span>
        <span className="text-[11px] text-slate-500">Heuristic Consensus</span>
      </div>

      {/* Circular Gauge */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.82 }}>
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
            stroke="#121c17"
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
              transition: 'stroke-dashoffset 0.8s ease-out',
              filter: `drop-shadow(0 0 6px ${colorConfig.glow})`
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-bold tracking-tight ${colorConfig.text}`}>
              {score}
            </span>
            <span className="text-slate-500 text-sm">/100</span>
          </div>

          <div className="mt-1.5">
            <RiskBadge category={classification} size="sm" />
          </div>

          <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-1">
            Prototype Risk Score
          </span>
        </div>
      </div>

      {/* Analytical Confidence readout */}
      <div className="mt-3 w-full pt-3 border-t border-emerald-950 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span>Confidence:</span>
          <span className="text-emerald-400 font-bold">{confidencePercent}%</span>
        </div>
        <div className="text-[10px] text-slate-500 bg-[#080d0b] px-2 py-0.5 rounded border border-emerald-950">
          Corroborated
        </div>
      </div>
    </div>
  );
}
