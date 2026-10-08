import React from 'react';
import { CheckCircle2, Activity } from 'lucide-react';

interface TimelineProps {
  type: 'URL' | 'EMAIL' | 'EMAIL_LEAK';
  riskScore: number;
  vtAvailable: boolean;
}

export default function Timeline({ type, riskScore, vtAvailable }: TimelineProps) {
  const steps = [
    {
      title: 'Target Ingestion',
      desc: type === 'URL' ? 'Normalized URI' : type === 'EMAIL' ? 'Extracted RFC headers' : 'Validated mailbox identity',
      status: 'complete'
    },
    {
      title: type === 'URL' ? 'Host & DNS Parsing' : type === 'EMAIL' ? 'Domain Alignment' : 'Darknet Dump Triage',
      desc: type === 'URL' ? 'Hostname & TLD metrics' : type === 'EMAIL' ? 'From vs Reply-To match' : 'Known stealer log index',
      status: 'complete'
    },
    {
      title: 'Heuristic Scoring',
      desc: 'Tested 20+ IOC signatures',
      status: 'complete'
    },
    {
      title: 'VirusTotal Threat Intel',
      desc: vtAvailable ? 'Consensus from 90+ vendors' : 'Local fallback mode',
      status: vtAvailable ? 'complete' : 'neutral'
    },
    {
      title: 'Scoring Normalization',
      desc: 'Aggregated weighted matrix',
      status: 'complete'
    },
    {
      title: 'SOC Classification',
      desc: `Risk Score: ${riskScore}/100`,
      status: 'complete',
      isFinal: true
    }
  ];

  return (
    <div className="p-4 rounded-xl border border-emerald-500/20 bg-[#0d1411] shadow-md font-mono">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <h4 className="text-xs font-bold uppercase text-slate-200">Analysis Pipeline Sequence</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-col p-2.5 rounded border border-emerald-950 bg-[#080d0b] hover:border-emerald-700/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold">
                0{idx + 1}
              </span>
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  step.status === 'complete' ? 'text-emerald-400' : 'text-slate-600'
                }`}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-200 mb-0.5">
              {step.title}
            </span>
            <span className="text-[10px] text-slate-500">
              {step.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
