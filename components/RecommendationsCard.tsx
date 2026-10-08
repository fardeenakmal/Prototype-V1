import React from 'react';
import { RiskCategory } from '@/types/security';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, AlertOctagon } from 'lucide-react';

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
        title: 'Actionable SOC Response & Containment Protocol',
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
      title: 'Standard User Guidance',
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
    <div className={`p-5 rounded-xl border ${header.border} shadow-lg space-y-3`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded bg-slate-950 border border-slate-800 ${header.iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-100">{header.title}</h4>
            <p className="text-xs text-slate-400">Recommended operational steps for users and analysts</p>
          </div>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${header.badgeStyle}`}>
          {header.badge}
        </span>
      </div>

      <div className="space-y-2 pt-1">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200"
          >
            <span className="font-mono text-cyan-400 font-bold mt-0.5">›</span>
            <span className="leading-relaxed">{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

