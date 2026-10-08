import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Activity } from 'lucide-react';

interface TimelineProps {
  type: 'URL' | 'EMAIL';
  riskScore: number;
  vtAvailable: boolean;
}

export default function Timeline({ type, riskScore, vtAvailable }: TimelineProps) {
  const steps = [
    {
      title: 'Target Ingestion',
      desc: type === 'URL' ? 'Normalized URL string' : 'Extracted RFC headers & body',
      status: 'complete'
    },
    {
      title: type === 'URL' ? 'Syntax & Host Parsing' : 'URL & Identity Extraction',
      desc: type === 'URL' ? 'Extracted hostname, TLD & path' : 'Parsed sender & embedded links',
      status: 'complete'
    },
    {
      title: 'Heuristic Evaluation',
      desc: 'Tested 20+ phishing signatures',
      status: 'complete'
    },
    {
      title: 'VirusTotal Threat Intel',
      desc: vtAvailable ? 'Consensus from 90+ engines' : 'Skipped (Local fallback mode)',
      status: vtAvailable ? 'complete' : 'neutral'
    },
    {
      title: 'Weighted Risk Engine',
      desc: 'Aggregated normalized scoring matrix',
      status: 'complete'
    },
    {
      title: 'Final SOC Classification',
      desc: `Risk Score: ${riskScore}/100`,
      status: 'complete',
      isFinal: true
    }
  ];

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h4 className="text-sm font-mono font-semibold text-slate-200">Analysis Pipeline Sequence</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 relative">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-col p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 relative group hover:border-cyan-500/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                0{idx + 1}
              </span>
              <CheckCircle2
                className={`w-4 h-4 ${
                  step.status === 'complete' ? 'text-cyan-400' : 'text-slate-600'
                }`}
              />
            </div>
            <span className="text-xs font-semibold text-slate-200 leading-tight mb-1">
              {step.title}
            </span>
            <span className="text-[11px] text-slate-400 font-mono leading-tight">
              {step.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

