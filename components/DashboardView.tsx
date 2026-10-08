'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Activity,
  ArrowUpRight,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  RefreshCw,
  Globe,
  Mail,
  Database
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

  const threatColors = ['#EF4444', '#F97316', '#F59E0B', '#34D399', '#10B981'];

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-950 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white uppercase">SOC Operations Telemetry</h1>
            <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
              LIVE CONSOLE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time phishing indicators, email breach exposures, and VirusTotal multi-vendor consensus.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0b1410] hover:bg-[#12201a] text-slate-300 text-xs border border-emerald-950 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Poll Telemetry</span>
          </button>

          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Launch Triage</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Scans */}
        <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-[#0d1411] space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Ingested</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {data.totalScans}
          </div>
          <p className="text-[10px] text-slate-500">All targets triaged</p>
        </div>

        {/* Threats Detected */}
        <div className="p-3.5 rounded-lg border border-orange-900/40 bg-orange-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-orange-400">
            <span>Threats Flagged</span>
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-300 tracking-tight">
            {data.threatsDetected}
          </div>
          <p className="text-[10px] text-orange-400/80">Critical + High + Med</p>
        </div>

        {/* Critical Threats */}
        <div className="p-3.5 rounded-lg border border-rose-900/50 bg-rose-950/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>Critical IOCs</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 tracking-tight">
            {data.criticalScans}
          </div>
          <p className="text-[10px] text-rose-400/80">Urgent containment</p>
        </div>

        {/* High Risk */}
        <div className="p-3.5 rounded-lg border border-amber-900/40 bg-amber-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>High Risk</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            {data.highRiskScans}
          </div>
          <p className="text-[10px] text-amber-400/80">Phishing / Leaks</p>
        </div>

        {/* Safe Scans */}
        <div className="p-3.5 rounded-lg border border-emerald-900/40 bg-emerald-950/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>Safe Targets</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 tracking-tight">
            {data.safeScans}
          </div>
          <p className="text-[10px] text-emerald-400/80">Benign reputation</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Threat Distribution (Donut) */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-[#0d1411] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="font-bold text-xs text-slate-100 uppercase">Threat Distribution</h3>
            </div>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.threatDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.threatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || threatColors[index % threatColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080d0b',
                    borderColor: '#1e2e28',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  itemStyle={{ color: '#f0fdf4' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 border-t border-emerald-950 text-[10px]">
            {data.threatDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#080d0b] border border-emerald-950">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-bold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Scan Activity (Line) */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-[#0d1411] space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="font-bold text-xs text-slate-100 uppercase">Hourly Inspection Velocity</h3>
            </div>
            <span className="text-[10px] text-slate-500">Live operational window</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.scanActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#121c17" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080d0b',
                    borderColor: '#1e2e28',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#10B981' }}
                  name="Total Ingested"
                />
                <Line
                  type="monotone"
                  dataKey="threats"
                  stroke="#EF4444"
                  strokeWidth={1.5}
                  dot={{ r: 2, fill: '#EF4444' }}
                  name="Threats Detected"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-end gap-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-emerald-400" />
              <span>Total Ingested</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-rose-500" />
              <span>Threats Detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detection Sources & Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Detection Sources Bar */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-[#0d1411] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="font-bold text-xs text-slate-100 uppercase">Detection Sources</h3>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.detectionSources} layout="vertical" margin={{ top: 5, right: 15, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#121c17" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis
                  dataKey="source"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  fontFamily="monospace"
                  width={95}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080d0b',
                    borderColor: '#1e2e28',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="detections" fill="#10B981" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events Feed */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-[#0d1411] space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-100 uppercase">Recent Ingested IOCs</h3>
            <Link
              href="/history"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Full Audit Trail →</span>
            </Link>
          </div>

          <div className="space-y-2">
            {data.recentScans.slice(0, 5).map((scan) => (
              <Link
                key={scan.id}
                href={`/results/${scan.id}`}
                className="flex items-center justify-between p-2.5 rounded border border-emerald-950 bg-[#080d0b] hover:border-emerald-700/60 hover:bg-[#0c1511] transition-all group"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0d1411] text-emerald-400 border border-emerald-900 shrink-0 font-bold">
                    {scan.type}
                  </span>
                  <div className="overflow-hidden">
                    <span className="text-xs text-slate-200 group-hover:text-emerald-300 transition-colors truncate block">
                      {scan.target}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {scan.indicators?.length || 0} indicators flagged
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right hidden sm:block">
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
    </div>
  );
}
