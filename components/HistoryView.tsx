'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ScanResult, URLAnalysisResult, EmailLeakResult } from '@/types/security';
import RiskBadge from './RiskBadge';
import {
  Search,
  Trash2,
  ExternalLink,
  Download,
  Globe,
  Mail,
  Database
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
        const matchesLeak = s.type === 'EMAIL_LEAK' && ((s as EmailLeakResult).email.toLowerCase().includes(q) || (s as EmailLeakResult).domain.toLowerCase().includes(q));
        if (!matchesTarget && !matchesDomain && !matchesEmail && !matchesLeak) return false;
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
    if (!confirm('Clear all audit logs? This action cannot be undone.')) return;
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
      const vt = s.type === 'URL' ? (s as URLAnalysisResult).virusTotal?.detectionRatio || 'N/A' : (s.type === 'EMAIL_LEAK' ? (s as EmailLeakResult).virusTotal?.detectionRatio || 'N/A' : 'N/A');
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
    link.setAttribute('download', `phishguard_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-950 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase">Security Audit Log &amp; IOC Archive</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical registry of triaged phishing links, email spoofs, and credential breach events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={filteredScans.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0b1410] hover:bg-[#12201a] disabled:opacity-50 text-slate-300 text-xs border border-emerald-950 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {scans.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs border border-rose-900/60 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Log</span>
            </button>
          )}

          <Link
            href="/scan"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          >
            <span>+ New Triage</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-[#0d1411] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500/60">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search targets, domains, breach identities..."
              className="w-full pl-8 pr-3 py-2 rounded bg-[#080d0b] border border-emerald-900 text-emerald-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Risk Filter */}
          <div className="sm:col-span-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded bg-[#080d0b] border border-emerald-900 text-slate-300 text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH_RISK">High Risk</option>
              <option value="MEDIUM_RISK">Medium</option>
              <option value="LOW_RISK">Low Risk</option>
              <option value="SAFE">Safe</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded bg-[#080d0b] border border-emerald-900 text-slate-300 text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="URL">URLs Only</option>
              <option value="EMAIL">Emails Only</option>
              <option value="EMAIL_LEAK">Breaches Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded bg-[#080d0b] border border-emerald-900 text-slate-300 text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="score_desc">Highest Risk</option>
              <option value="score_asc">Lowest Risk</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-emerald-950 pt-2">
          <span>Showing {filteredScans.length} of {scans.length} records</span>
          {(searchQuery || riskFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRiskFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-emerald-500/20 bg-[#0d1411] overflow-hidden">
        {filteredScans.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Search className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-300">No telemetry records match your filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080d0b] text-slate-400 uppercase text-[10px] border-b border-emerald-950">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Target / Identity</th>
                  <th className="py-2.5 px-3">Threat Score</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3">VT Intel</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950">
                {filteredScans.map((s) => {
                  const isUrl = s.type === 'URL';
                  const isLeak = s.type === 'EMAIL_LEAK';
                  const urlScan = isUrl ? (s as URLAnalysisResult) : null;
                  const leakScan = isLeak ? (s as EmailLeakResult) : null;

                  const vtRatio = urlScan?.virusTotal?.available
                    ? `${urlScan.virusTotal.malicious}/${urlScan.virusTotal.totalEngines || 94}`
                    : leakScan?.virusTotal?.available
                    ? `${leakScan.virusTotal.malicious}/${leakScan.virusTotal.totalEngines || 94}`
                    : urlScan?.virusTotal?.configured === false
                    ? 'Unconfigured'
                    : 'N/A';

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#080e0c] transition-colors group cursor-pointer"
                      onClick={() => (window.location.href = `/results/${s.id}`)}
                    >
                      {/* Time */}
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                        <div>{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-[#080d0b] border border-emerald-950 text-[10px] text-emerald-400 font-bold">
                          {isUrl ? <Globe className="w-3 h-3" /> : isLeak ? <Database className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                          <span>{s.type}</span>
                        </span>
                      </td>

                      {/* Target */}
                      <td className="py-3 px-3 max-w-xs truncate">
                        <div className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                          {s.target}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {isUrl ? s.domain : isLeak ? `Domain: ${leakScan?.domain}` : `From: ${(s as any).from}`}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`font-bold ${
                              s.riskScore >= 80
                                ? 'text-rose-400'
                                : s.riskScore >= 60
                                ? 'text-orange-400'
                                : s.riskScore >= 40
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {s.riskScore}
                          </span>
                          <span className="text-[10px] text-slate-500">/100</span>
                        </div>
                      </td>

                      {/* Verdict Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <RiskBadge category={s.classification} size="sm" />
                      </td>

                      {/* VirusTotal */}
                      <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-[#080d0b] border border-emerald-950 text-slate-400">
                          {vtRatio}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/results/${s.id}`}
                            className="p-1 rounded hover:bg-emerald-950 text-slate-400 hover:text-emerald-300 transition-colors"
                            title="Inspect Report"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={(e) => handleDelete(s.id, e)}
                            disabled={isDeleting === s.id}
                            className="p-1 rounded hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
