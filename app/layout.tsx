import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Shield, Lock, Terminal, Activity, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PhishGuard — Phishing Email & URL Detection Platform',
  description: 'AI-assisted cybersecurity analysis platform with local heuristics, VirusTotal threat intelligence, and explainable risk scoring.'
};

import { Suspense } from 'react';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
        <Suspense fallback={<div className="h-16 border-b border-slate-800 bg-slate-900" />}>
          <Navbar />
        </Suspense>

        <main className="flex-1 w-full">
          {children}
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-xs font-mono text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-200">PhishGuard Security Platform</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-500">Autonomous SOC Triage Prototype</span>
            </div>

            <div className="flex items-center gap-6 text-slate-400">
              <Link href="/scan" className="hover:text-cyan-400 transition-colors">
                Scanner
              </Link>
              <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                SOC Dashboard
              </Link>
              <Link href="/history" className="hover:text-cyan-400 transition-colors">
                Audit Trail
              </Link>
              <Link href="/settings" className="hover:text-cyan-400 transition-colors">
                Settings & API
              </Link>
            </div>

            <div className="text-slate-500 text-[11px] text-center md:text-right">
              Heuristic Engine + VirusTotal API v3 • Prototype Risk Score
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
