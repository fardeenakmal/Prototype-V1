import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'PhishGuard — Threat Intelligence & Phishing Inspection Platform',
  description: 'Cybersecurity IOC inspection console with local heuristics, email breach telemetry, and VirusTotal threat intelligence.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#080d0b] text-[#f0fdf4] font-mono antialiased selection:bg-emerald-500 selection:text-slate-950">
        <Suspense fallback={<div className="h-16 border-b border-emerald-950 bg-[#090d0b]" />}>
          <Navbar />
        </Suspense>

        <main className="flex-1 w-full">
          {children}
        </main>

        <footer className="border-t border-emerald-950 bg-[#060908] py-6 text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <Terminal className="w-3 h-3" />
              </div>
              <span className="font-bold text-slate-300">PHISHGUARD SOC CONSOLE</span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">Heuristic Engine &amp; Breach Telemetry</span>
            </div>

            <div className="flex items-center gap-5 text-slate-400 text-xs">
              <Link href="/scan" className="hover:text-emerald-400 transition-colors">
                [Scanner]
              </Link>
              <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                [SOC Dashboard]
              </Link>
              <Link href="/history" className="hover:text-emerald-400 transition-colors">
                [Audit Trail]
              </Link>
              <Link href="/settings" className="hover:text-emerald-400 transition-colors">
                [Credentials]
              </Link>
            </div>

            <div className="text-slate-600 text-[10px]">
              VT_V3_API // PROTOTYPE_RISK_ENGINE
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
