import React from 'react';
import { RiskCategory } from '@/types/security';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RecommendationsCardProps {
  classification: RiskCategory;
  recommendations: string[];
}

export default function RecommendationsCard({
  classification,
  recommendations
}: RecommendationsCardProps) {
  const isHighOrCritical = classification === 'CRITICAL' || classification === 'HIGH_RISK';
  const isMedium = classification === 'MEDIUM_RISK';

  const getHeader = () => {
    if (isHighOrCritical) {
      return {
        title: 'Actionable SOC Incident Response & Containment Protocol',
        badge: 'URGENT MITIGATION',
        border: 'border-rose-900/60 bg-rose-950/20',
        badgeStyle: 'bg-rose-950 text-rose-300 border-rose-700',
        icon: AlertOctagon,
        iconColor: 'text-rose-400'
      };
    }
    if (isMedium) {
      return {
        title: 'Security Advisory & Precautionary Guidance',
        badge: 'SUSPICIOUS ADVISORY',
        border: 'border-amber-900/60 bg-amber-950/20',
        badgeStyle: 'bg-amber-950 text-amber-300 border-amber-700',
        icon: AlertTriangle,
        iconColor: 'text-amber-400'
      };
    }
    return {
      title: 'Standard Security Guidance',
      badge: 'SAFE TARGET',
      border: 'border-emerald-900/50 bg-emerald-950/10',
      badgeStyle: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400'
    };
  };

  const header = getHeader();
  const Icon = header.icon;

  return (
    <div className={`p-4 sm:p-5 rounded-xl border ${header.border} shadow-lg space-y-3 font-mono`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded bg-[#080d0b] border border-emerald-950 ${header.iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-100 uppercase">{header.title}</h4>
            <p className="text-[11px] text-slate-400">Prescribed operational procedures for analysts &amp; endpoints</p>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${header.badgeStyle}`}>
          {header.badge}
        </span>
      </div>

      <div className="space-y-1.5 pt-1">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 p-2.5 rounded bg-[#080d0b] border border-emerald-950 text-xs text-slate-200"
          >
            <span className="text-emerald-400 font-bold mt-0.2">&gt;</span>
            <span className="leading-relaxed">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
