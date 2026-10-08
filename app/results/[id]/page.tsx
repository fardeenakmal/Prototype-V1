import React, { Suspense } from 'react';
import { getScanById } from '@/lib/storage';
import ResultDetailsView from '@/components/ResultDetailsView';
import Link from 'next/link';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Detailed Threat Report | PhishGuard',
  description: 'In-depth heuristic and VirusTotal security report'
};

async function ScanContent({
  paramsPromise
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const scan = getScanById(id);

  if (!scan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
          <ShieldAlert className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold font-mono text-white uppercase">Report Record Not Found</h1>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            The requested scan ID <code className="text-emerald-400 font-mono">{id}</code> was not found in the local telemetry store.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-3">
          <Link
            href="/history"
            className="px-3.5 py-1.5 rounded bg-[#0b1410] hover:bg-[#12201a] text-slate-300 font-mono text-xs border border-emerald-950 transition-colors"
          >
            ← View Audit Log
          </Link>
          <Link
            href="/scan"
            className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          >
            Launch New Triage
          </Link>
        </div>
      </div>
    );
  }

  return <ResultDetailsView scan={scan} />;
}

export default function ResultPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Suspense
        fallback={
          <div className="p-12 text-center text-emerald-400 font-mono flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading Threat Telemetry...</span>
          </div>
        }
      >
        <ScanContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
