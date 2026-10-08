'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ScanResult, URLAnalysisResult } from '@/types/security';
import RiskBadge from './RiskBadge';
import {
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  Globe,
  Mail,
  ArrowUpDown,
  RefreshCw,
  AlertOctagon,
  ShieldCheck,
  Check
} from 'lucide-react';

interface HistoryViewProps {
  initialScans: ScanResult[];
}

export default function HistoryView({ initialScans }: HistoryViewProps) {
  const [scans, setScans] = useState<ScanResult[]>(initialScans);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredScans = scans
    .filter((s) => {
      if (typeFilter !== 'ALL' && s.type !== typeFilter) return false;
      if (riskFilter !== 'ALL' && s.classification !== riskFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTarget = s.target.toLowerCase().includes(q);
        const matchesDomain = s.type === 'URL' && s.domain.toLowerCase().includes(q);
        const matchesEmail = s.type === 'EMAIL' && (s.from.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q));
        if (!matchesTarget && !matchesDomain && !matchesEmail) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === 'score_desc') {
        return b.riskScore - a.riskScore;
      }
      if (sortBy === 'score_asc') {
        return a.riskScore - b.riskScore;
      }
      return 0;
    });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this scan report?')) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScans((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // Fallback
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all scan history logs? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/history?id=all', { method: 'DELETE' });
      if (res.ok) {
        setScans([]);
      }
    } catch {
      // Fallback
    }
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Type', 'Target', 'RiskScore', 'Classification', 'Confidence', 'VirusTotal'];
    const rows = filteredScans.map((s) => {
      const vt = s.type === 'URL' ? (s as URLAnalysisResult).virusTotal?.detectionRatio || 'N/A' : 'N/A';
      return [
        s.id,
        new Date(s.timestamp).toISOString(),
        s.type,
        `"${s.target.replace(/"/g, '""')}"`,
        s.riskScore,
        s.classification,
        s.confidence,
        `"${vt}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phishguard_scans_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-mono text-white">Scan Log & Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical repository of evaluated URLs, emails, and triage verdicts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={filteredScans.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {scans.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-mono text-xs border border-rose-800/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-[0_0_12px_rgba(34,211,238,0.25)]"
          >
            <span>+ Scan New</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search targets, domains, subjects..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Risk Filter */}
          <div className="sm:col-span-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH_RISK">High Risk</option>
              <option value="MEDIUM_RISK">Medium Risk</option>
              <option value="LOW_RISK">Low Risk</option>
              <option value="SAFE">Safe</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="URL">URLs Only</option>
              <option value="EMAIL">Emails Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="score_desc">Highest Risk</option>
              <option value="score_asc">Lowest Risk</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-800/80 pt-2">
          <span>Showing {filteredScans.length} of {scans.length} recorded scans</span>
          {(searchQuery || riskFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRiskFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        {filteredScans.length === 0 ? (
          <div className="p-12 text-center space-y-3 font-mono">
            <Search className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300">No scan logs matched your filter criteria.</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or launch a new scan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Target / Subject</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">VirusTotal</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredScans.map((s) => {
                  const isUrl = s.type === 'URL';
                  const urlScan = isUrl ? (s as URLAnalysisResult) : null;
                  const vtRatio = urlScan?.virusTotal?.available
                    ? `${urlScan.virusTotal.malicious}/${urlScan.virusTotal.totalEngines || 94}`
                    : urlScan?.virusTotal?.configured === false
                    ? 'Unconfigured'
                    : 'N/A';

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => (window.location.href = `/results/${s.id}`)}
                    >
                      {/* Time */}
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        <div>
                          {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                          {isUrl ? <Globe className="w-3 h-3 text-cyan-400" /> : <Mail className="w-3 h-3 text-cyan-400" />}
                          <span>{s.type}</span>
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md truncate">
                        <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                          {s.target}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {isUrl ? s.domain : `From: ${(s as any).from}`}
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`font-bold text-sm ${
                              s.riskScore >= 80
                                ? 'text-rose-400'
                                : s.riskScore >= 60
                                ? 'text-orange-400'
                                : s.riskScore >= 40
                                ? 'text-amber-400'
                                : s.riskScore >= 20
                                ? 'text-sky-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {s.riskScore}
                          </span>
                          <span className="text-[10px] text-slate-500">/100</span>
                        </div>
                      </td>

                      {/* Verdict Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <RiskBadge category={s.classification} size="sm" />
                      </td>

                      {/* VirusTotal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded ${
                            urlScan?.virusTotal?.malicious
                              ? 'bg-rose-950/70 text-rose-300 border border-rose-800/80 font-bold'
                              : 'text-slate-400 bg-slate-950 border border-slate-800'
                          }`}
                        >
                          {vtRatio}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/results/${s.id}`}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                            title="View Detailed Report"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={(e) => handleDelete(s.id, e)}
                            disabled={isDeleting === s.id}
                            className="p-1.5 rounded hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Scan Log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

