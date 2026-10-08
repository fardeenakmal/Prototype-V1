'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  Sliders,
  SlidersHorizontal,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  Lock,
  Zap,
  Sparkles,
  RotateCcw
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
        message: data.message || (data.valid ? 'Key verified successfully!' : 'Key rejected.')
      });
    } catch {
      setTestResult({
        valid: false,
        message: 'Network error communicating with validation service.'
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold font-mono text-white">System Settings & Calibration</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure external threat feeds, risk scoring weight distribution, and prototype modes.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-800/80 flex items-center gap-2.5 text-emerald-300 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuration saved successfully and applied to active analysis engine.</span>
        </div>
      )}

      {/* 1. VirusTotal API Configuration */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-mono">VirusTotal API v3 Credentials</h3>
              <p className="text-xs text-slate-400">
                Connects PhishGuard to VirusTotal's global database of 90+ security engines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border uppercase ${
                hasApiKey
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}
            >
              {hasApiKey ? 'ACTIVE KEY CONFIGURED' : 'NOT CONFIGURED'}
            </span>
          </div>
        </div>

        {/* Existing key indicator */}
        {hasApiKey && (
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Current Key:</span>
              <code className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {maskedKey}
              </code>
            </div>
            <span className="text-[11px] text-slate-500">Source: {apiKeySource}</span>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">
            {hasApiKey ? 'Update API Key (Leaves untouched if blank)' : 'Enter VirusTotal API Key'}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste 64-character API key from virustotal.com"
              className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleTestKey}
              disabled={isTestingKey || !apiKeyInput.trim()}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-mono text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingKey ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Test Key</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                testResult.valid
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 font-mono">
            Security Notice: API keys are securely stored server-side only. They are never sent to the browser or logged. You can also supply the key via the <code className="text-cyan-400 font-mono">VIRUSTOTAL_API_KEY</code> environment variable.
          </p>
        </div>
      </div>

      {/* 2. Demo Mode & Simulation Controls */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white font-mono">Demo Mode & Simulation</h3>
            <p className="text-xs text-slate-400">
              Ensures the prototype demonstrates complete functionality even without external API credentials.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
            />
            <div className="space-y-0.5 text-xs font-mono">
              <span className="font-bold text-slate-200 block">Enable Demo Threat Intelligence Simulation</span>
              <span className="text-slate-400 text-[11px] leading-relaxed block">
                When enabled and no live VirusTotal key is present, test domains (e.g. PayPal spoof, Google safe) return simulated vendor consensus marked with "DEMO DATA" badges.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={autoExtractUrls}
              onChange={(e) => setAutoExtractUrls(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
            />
            <div className="space-y-0.5 text-xs font-mono">
              <span className="font-bold text-slate-200 block">Automatic Email URL Extraction & Triage</span>
              <span className="text-slate-400 text-[11px] leading-relaxed block">
                Automatically isolates hyperlinks from submitted emails and calculates immediate preliminary risk indices for each link.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Transparent Risk Scoring Weights Configuration */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-mono">Prototype Risk Scoring Engine Weights</h3>
              <p className="text-xs text-slate-400">
                Adjust how heavily each intelligence signal factors into the composite 0–100 threat score.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetWeights}
              className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>

        {/* Weights Sliders */}
        <div className="space-y-4 font-mono text-xs">
          {/* VT Weight */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span>VirusTotal Malicious Detections:</span>
              <span className="text-cyan-400 font-bold">{weights.vtWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              value={weights.vtWeight}
              onChange={(e) => setWeights({ ...weights, vtWeight: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* URL Heuristics Weight */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span>URL Signature & Keyword Heuristics:</span>
              <span className="text-cyan-400 font-bold">{weights.urlHeuristicsWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              value={weights.urlHeuristicsWeight}
              onChange={(e) => setWeights({ ...weights, urlHeuristicsWeight: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Domain Characteristics */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span>Domain Characteristics & TLD / Entropy:</span>
              <span className="text-cyan-400 font-bold">{weights.domainWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.domainWeight}
              onChange={(e) => setWeights({ ...weights, domainWeight: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Brand Impersonation */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span>Brand Impersonation & Lookalike Subdomains:</span>
              <span className="text-cyan-400 font-bold">{weights.brandWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={weights.brandWeight}
              onChange={(e) => setWeights({ ...weights, brandWeight: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Other Indicators */}
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span>Other Structural Indicators (HTTP scheme, ports, open redirects):</span>
              <span className="text-cyan-400 font-bold">{weights.otherWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.otherWeight}
              onChange={(e) => setWeights({ ...weights, otherWeight: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Cumulative Weight Sum:</span>
            <span className={`font-bold ${totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalWeight}% {totalWeight !== 100 && '(Auto-normalized during score computation)'}
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold font-mono text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}

