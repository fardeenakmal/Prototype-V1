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
          <h1 className="text-2xl font-bold font-mono text-white">Scan Report Not Found</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            The requested scan ID <code className="text-cyan-400 font-mono">{id}</code> was not found in the local telemetry store.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/history"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
          >
            ← View Scan History
          </Link>
          <Link
            href="/scan"
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-colors shadow-[0_0_12px_rgba(34,211,238,0.3)]"
          >
            Launch New Scan
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense
        fallback={
          <div className="p-16 text-center text-cyan-400 font-mono flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading Threat Report Telemetry...</span>
          </div>
        }
      >
        <ScanContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
