'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Activity,
  ArrowUpRight,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  Search,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { DashboardStats, ScanResult } from '@/types/security';
import RiskBadge from './RiskBadge';

interface DashboardViewProps {
  initialData: DashboardStats;
}

export default function DashboardView({ initialData }: DashboardViewProps) {
  const [data, setData] = useState<DashboardStats>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Keep existing data
    } finally {
      setIsRefreshing(false);
    }
  };

  const threatColors = ['#EF4444', '#F97316', '#F59E0B', '#38BDF8', '#10B981'];

  return (
    <div className="space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-mono text-white">SOC Security Overview</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated threat intelligence, detection sources, and phishing campaign analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)]"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Launch Scanner</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Scans */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Scans</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white tracking-tight">
            {data.totalScans}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">All ingested targets</p>
        </div>

        {/* Threats Detected */}
        <div className="p-4 rounded-xl border border-orange-900/40 bg-orange-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-orange-400 font-mono">
            <span>Threats Flagged</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-orange-300 tracking-tight">
            {data.threatsDetected}
          </div>
          <p className="text-[11px] text-orange-400/80 font-mono">Critical + High + Med</p>
        </div>

        {/* Critical Threats */}
        <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 space-y-1 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
          <div className="flex items-center justify-between text-xs text-rose-400 font-mono">
            <span>Critical Severity</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-rose-300 tracking-tight">
            {data.criticalScans}
          </div>
          <p className="text-[11px] text-rose-400/80 font-mono">Urgent triage needed</p>
        </div>

        {/* High Risk */}
        <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
            <span>High Risk</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-300 tracking-tight">
            {data.highRiskScans}
          </div>
          <p className="text-[11px] text-amber-400/80 font-mono">Suspected phishing</p>
        </div>

        {/* Safe Scans */}
        <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
            <span>Safe Targets</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-emerald-300 tracking-tight">
            {data.safeScans}
          </div>
          <p className="text-[11px] text-emerald-400/80 font-mono">Verified benign</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Threat Distribution (Donut) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm text-slate-100 font-mono">Threat Severity Distribution</h3>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.threatDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.threatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || threatColors[index % threatColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 border-t border-slate-800/80 text-xs font-mono">
            {data.threatDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-bold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Scan Activity (Line) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm text-slate-100 font-mono">Scan Ingestion Velocity</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Hourly activity window</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.scanActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke="#22D3EE"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#22D3EE' }}
                  name="Total Scans"
                />
                <Line
                  type="monotone"
                  dataKey="threats"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#EF4444' }}
                  name="Threats Detected"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-end gap-4 text-xs font-mono pt-1 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400" />
              <span>Total Scans</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500" />
              <span>Threats Detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detection Sources & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Detection Sources (Bar) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm text-slate-100 font-mono">Detection Signals by Source</h3>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.detectionSources} layout="vertical" margin={{ top: 5, right: 20, left: 25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis
                  dataKey="source"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  fontFamily="monospace"
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="detections" fill="#22D3EE" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Threat Events Feed */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-100 font-mono">Recent Target Detections</h3>
            <Link
              href="/history"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Full Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {data.recentScans.slice(0, 5).map((scan) => (
              <Link
                key={scan.id}
                href={`/results/${scan.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                    {scan.type}
                  </span>
                  <div className="overflow-hidden">
                    <span className="text-xs font-mono text-slate-200 group-hover:text-cyan-300 transition-colors truncate block">
                      {scan.target}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {scan.indicators?.length || 0} indicators flagged
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono hidden sm:block">
                    <span className="text-xs font-bold text-slate-200">{scan.riskScore}</span>
                    <span className="text-[10px] text-slate-500">/100</span>
                  </div>
                  <RiskBadge category={scan.classification} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mock Telemetry Disclaimer */}
      <div className="text-center text-[11px] font-mono text-slate-500 border-t border-slate-800/80 pt-4">
        <span>SOC METRICS MODE: Live local scans are immediately appended to telemetry database.</span>
      </div>
    </div>
  );
}

