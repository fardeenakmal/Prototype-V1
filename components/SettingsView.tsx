'use client';

import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Save,
  Lock,
  Zap,
  RotateCcw,
  Terminal
} from 'lucide-react';
import { RiskWeightsConfig } from '@/types/security';
import { DEFAULT_RISK_WEIGHTS } from '@/lib/riskEngine';

export default function SettingsView() {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [apiKeySource, setApiKeySource] = useState('none');
  const [demoMode, setDemoMode] = useState(true);
  const [autoExtractUrls, setAutoExtractUrls] = useState(true);

  // Risk Weights
  const [weights, setWeights] = useState<RiskWeightsConfig>(DEFAULT_RISK_WEIGHTS);

  // Status & Feedback
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setHasApiKey(data.hasApiKey);
          setMaskedKey(data.maskedKey || '');
          setApiKeySource(data.apiKeySource || 'none');
          setDemoMode(data.demoMode ?? true);
          setAutoExtractUrls(data.autoExtractUrls ?? true);
          if (data.weights) setWeights(data.weights);
        }
      })
      .catch(() => {});
  }, []);

  const totalWeight =
    Number(weights.vtWeight) +
    Number(weights.urlHeuristicsWeight) +
    Number(weights.domainWeight) +
    Number(weights.brandWeight) +
    Number(weights.otherWeight);

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) {
      setTestResult({
        valid: false,
        message: 'Please paste an API key to test.'
      });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/virustotal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest })
      });
      const data = await res.json();
      setTestResult({
        valid: data.valid,
        message: data.message || (data.valid ? 'VirusTotal API key validated successfully!' : 'Key rejected by VirusTotal.')
      });
    } catch {
      setTestResult({
        valid: false,
        message: 'Network error communicating with VirusTotal endpoint.'
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload: any = {
        demoMode,
        autoExtractUrls,
        weights
      };

      if (apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setHasApiKey(updated.hasApiKey);
        setMaskedKey(updated.maskedKey);
        setApiKeyInput('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      // Fallback
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_RISK_WEIGHTS);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      {/* Header */}
      <div className="border-b border-emerald-950 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white uppercase">System Calibration &amp; Credentials</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure external VirusTotal threat feeds, scoring weights, and simulation fallbacks.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded bg-emerald-950/60 border border-emerald-800 flex items-center gap-2 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configuration committed to runtime engine.</span>
        </div>
      )}

      {/* 1. VirusTotal API Configuration */}
      <div className="p-5 rounded-xl border border-emerald-500/25 bg-[#0d1411]/95 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white uppercase">VirusTotal API v3 Secret Key</h3>
              <p className="text-[11px] text-slate-400">
                Queries 90+ threat databases for URL &amp; domain breach reputation.
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              hasApiKey
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : 'bg-amber-950/80 text-amber-300 border-amber-800'
            }`}
          >
            {hasApiKey ? 'KEY CONFIGURED' : 'UNCONFIGURED'}
          </span>
        </div>

        {hasApiKey && (
          <div className="p-2.5 rounded bg-[#080d0b] border border-emerald-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Key:</span>
              <code className="text-emerald-300 font-bold bg-[#0d1411] px-1.5 py-0.5 rounded border border-emerald-950">
                {maskedKey}
              </code>
            </div>
            <span className="text-[10px] text-slate-500">Source: {apiKeySource}</span>
          </div>
        )}

        <div className="space-y-2.5">
          <label className="text-[11px] uppercase text-emerald-400 block font-bold">
            {hasApiKey ? 'Update API Key (Leaves existing active if empty)' : 'Paste VirusTotal API Key'}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste 64-character VirusTotal API v3 key"
              className="flex-1 px-3 py-2 rounded bg-[#080d0b] border border-emerald-900 text-emerald-100 placeholder-slate-600 text-xs focus:outline-none focus:border-emerald-400"
            />
            <button
              onClick={handleTestKey}
              disabled={isTestingKey || !apiKeyInput.trim()}
              className="px-4 py-2 rounded bg-[#0b1410] hover:bg-[#12201a] disabled:opacity-50 text-slate-200 text-xs border border-emerald-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingKey ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Test Key</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-2.5 rounded border text-xs flex items-center gap-2 ${
                testResult.valid
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.valid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <p className="text-[10px] text-slate-500">
            Security Guarantee: Keys remain server-side only in process memory. Never transmitted to client-side code.
          </p>
        </div>
      </div>

      {/* 2. Simulation & Demo Controls */}
      <div className="p-5 rounded-xl border border-emerald-500/25 bg-[#0d1411]/95 space-y-3">
        <h3 className="font-bold text-xs text-white uppercase flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Telemetry &amp; Offline Demo Fallbacks</span>
        </h3>

        <div className="space-y-2 text-xs">
          <label className="flex items-start gap-2.5 p-2.5 rounded bg-[#080d0b] border border-emerald-950 cursor-pointer">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="mt-0.5 accent-emerald-500 cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-200 block">Simulate Threat Telemetry When Key Is Missing</span>
              <span className="text-[11px] text-slate-400 block">
                Returns realistic vendor consensus for demo links with transparent [DEMO DATA] labels.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 rounded bg-[#080d0b] border border-emerald-950 cursor-pointer">
            <input
              type="checkbox"
              checked={autoExtractUrls}
              onChange={(e) => setAutoExtractUrls(e.target.checked)}
              className="mt-0.5 accent-emerald-500 cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-200 block">Automated Email URL Triage</span>
              <span className="text-[11px] text-slate-400 block">
                Automatically extracts and pre-screens hyperlinks found in submitted email bodies.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Transparent Risk Weights */}
      <div className="p-5 rounded-xl border border-emerald-500/25 bg-[#0d1411]/95 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs text-white uppercase">Risk Scoring Weights Matrix</h3>
          </div>

          <button
            onClick={handleResetWeights}
            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* VT Weight */}
          <div className="space-y-1 p-2.5 rounded bg-[#080d0b] border border-emerald-950">
            <div className="flex items-center justify-between text-slate-300">
              <span>VirusTotal Vendor Detections:</span>
              <span className="text-emerald-400 font-bold">{weights.vtWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              value={weights.vtWeight}
              onChange={(e) => setWeights({ ...weights, vtWeight: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* URL Heuristics */}
          <div className="space-y-1 p-2.5 rounded bg-[#080d0b] border border-emerald-950">
            <div className="flex items-center justify-between text-slate-300">
              <span>URL Signatures &amp; Auth Keywords:</span>
              <span className="text-emerald-400 font-bold">{weights.urlHeuristicsWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              value={weights.urlHeuristicsWeight}
              onChange={(e) => setWeights({ ...weights, urlHeuristicsWeight: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Domain Host */}
          <div className="space-y-1 p-2.5 rounded bg-[#080d0b] border border-emerald-950">
            <div className="flex items-center justify-between text-slate-300">
              <span>Domain Characteristics &amp; Shannon Entropy:</span>
              <span className="text-emerald-400 font-bold">{weights.domainWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.domainWeight}
              onChange={(e) => setWeights({ ...weights, domainWeight: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Brand Impersonation */}
          <div className="space-y-1 p-2.5 rounded bg-[#080d0b] border border-emerald-950">
            <div className="flex items-center justify-between text-slate-300">
              <span>Brand Impersonation &amp; Lookalike Tokens:</span>
              <span className="text-emerald-400 font-bold">{weights.brandWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={weights.brandWeight}
              onChange={(e) => setWeights({ ...weights, brandWeight: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Other */}
          <div className="space-y-1 p-2.5 rounded bg-[#080d0b] border border-emerald-950">
            <div className="flex items-center justify-between text-slate-300">
              <span>Other Structural Signals (HTTP, open redirects):</span>
              <span className="text-emerald-400 font-bold">{weights.otherWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.otherWeight}
              onChange={(e) => setWeights({ ...weights, otherWeight: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#090d0b] border border-emerald-950 text-xs">
            <span className="text-slate-400">Total Matrix Sum:</span>
            <span className={`font-bold ${totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalWeight}% {totalWeight !== 100 && '(Auto-normalized)'}
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Calibration</span>
        </button>
      </div>
    </div>
  );
}
