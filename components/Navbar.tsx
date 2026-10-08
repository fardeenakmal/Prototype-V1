'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Activity, History, Settings, Search, Terminal, AlertCircle } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [vtStatus, setVtStatus] = useState<{ configured: boolean; maskedKey: string; demoMode: boolean }>({
    configured: false,
    maskedKey: 'Not Configured',
    demoMode: true
  });

  useEffect(() => {
    fetch('/api/virustotal')
      .then(r => r.json())
      .then(data => {
        if (data && typeof data.configured === 'boolean') {
          setVtStatus(data);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { label: 'Scanner', href: '/scan', icon: Search },
    { label: 'SOC Dashboard', href: '/dashboard', icon: Activity },
    { label: 'Audit Log', href: '/history', icon: History },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/80 bg-[#090d0b]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.15)]">
              <Terminal className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base font-mono">
                  PHISH<span className="text-emerald-400">GUARD</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-bold tracking-wider">
                  SOC-OPS
                </span>
              </div>
              <p className="text-[11px] text-emerald-500/70 font-mono hidden sm:block">Threat Intelligence & Heuristics Console</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-emerald-950">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status / Indicators */}
        <div className="flex items-center gap-3">
          {/* VirusTotal Status Indicator Badge */}
          <Link
            href="/settings"
            title="VirusTotal Integration Status - Click to configure"
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0d1411] border border-emerald-900/60 hover:border-emerald-600 transition-all text-xs font-mono"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                vtStatus.configured
                  ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                  : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]'
              }`}
            />
            <span className="text-slate-400 hidden sm:inline">VT API:</span>
            <span
              className={`font-semibold ${
                vtStatus.configured ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {vtStatus.configured ? 'CONNECTED' : 'HEURISTICS ONLY'}
            </span>
          </Link>

          {/* New Scan CTA */}
          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono tracking-wider uppercase transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Launch Triage</span>
          </Link>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-emerald-950 bg-[#090d0b] py-2 px-3 text-xs font-mono">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
