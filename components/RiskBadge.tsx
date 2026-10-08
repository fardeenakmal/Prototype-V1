import React from 'react';
import { RiskCategory } from '@/types/security';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon, CheckCircle } from 'lucide-react';

interface RiskBadgeProps {
  category: RiskCategory;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function RiskBadge({ category, size = 'md', showIcon = true }: RiskBadgeProps) {
  const getBadgeStyle = () => {
    switch (category) {
      case 'SAFE':
        return {
          bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400',
          icon: CheckCircle,
          label: 'SAFE'
        };
      case 'LOW_RISK':
        return {
          bg: 'bg-sky-950/70 border-sky-500/50 text-sky-400',
          icon: ShieldCheck,
          label: 'LOW RISK'
        };
      case 'MEDIUM_RISK':
        return {
          bg: 'bg-amber-950/70 border-amber-500/50 text-amber-400',
          icon: AlertTriangle,
          label: 'MEDIUM RISK'
        };
      case 'HIGH_RISK':
        return {
          bg: 'bg-orange-950/70 border-orange-500/60 text-orange-400',
          icon: ShieldAlert,
          label: 'HIGH RISK'
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/80 border-rose-500/80 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
          icon: AlertOctagon,
          label: 'CRITICAL'
        };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold'
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded-md border tracking-wider uppercase transition-all ${style.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{style.label}</span>
    </span>
  );
}

