'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ShieldAlert, Activity, History, Settings, Search, ExternalLink } from 'lucide-react';

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
    { label: 'Scan History', href: '/history', icon: History },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-lg font-mono">
                  Phish<span className="text-cyan-400">Guard</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/80 text-cyan-400 font-semibold tracking-wider">
                  SOC v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI-Assisted Phishing & Threat Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
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
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all text-xs"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                vtStatus.configured
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
              }`}
            />
            <span className="font-mono text-slate-300 hidden sm:inline">VT:</span>
            <span
              className={`font-mono font-medium ${
                vtStatus.configured ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {vtStatus.configured ? 'Active' : 'Demo / Heuristics'}
            </span>
          </Link>

          {/* New Scan CTA */}
          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)]"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Launch Scan</span>
          </Link>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-900/90 py-2 px-3 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded ${
                isActive ? 'text-cyan-400 font-medium' : 'text-slate-400'
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

