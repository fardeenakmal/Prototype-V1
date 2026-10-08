import fs from 'fs';
import path from 'path';
import { ScanResult, DashboardStats, RiskWeightsConfig } from '@/types/security';
import { INITIAL_SEED_SCANS, getMockDashboardStats } from './sampleData';
import { DEFAULT_RISK_WEIGHTS } from './riskEngine';

const DATA_DIR = path.join(process.cwd(), '.data');
const SCANS_FILE = path.join(DATA_DIR, 'scans.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export interface AppSettings {
  apiKey?: string;
  demoMode: boolean;
  weights: RiskWeightsConfig;
  autoExtractUrls: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  demoMode: true,
  weights: DEFAULT_RISK_WEIGHTS,
  autoExtractUrls: true
};

// Memory cache to avoid constant disk reads
let memoryScans: ScanResult[] | null = null;
let memorySettings: AppSettings | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Fallback gracefully in restricted environments
  }
}

export function getAllScans(): ScanResult[] {
  if (memoryScans) {
    return memoryScans;
  }

  try {
    ensureDataDir();
    if (fs.existsSync(SCANS_FILE)) {
      const data = fs.readFileSync(SCANS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryScans = parsed;
        return memoryScans!;
      }
    }
  } catch (e) {
    console.error('Failed reading scans from disk, falling back to seed data:', e);
  }

  memoryScans = [...INITIAL_SEED_SCANS];
  saveAllScansToDisk(memoryScans);
  return memoryScans;
}

function saveAllScansToDisk(scans: ScanResult[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(SCANS_FILE, JSON.stringify(scans, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed writing scans to disk:', e);
  }
}

export function getScanById(id: string): ScanResult | undefined {
  const scans = getAllScans();
  return scans.find(s => s.id === id);
}

export function saveScan(scan: ScanResult): ScanResult {
  const scans = getAllScans();
  // Prepend new scan to start
  const updated = [scan, ...scans.filter(s => s.id !== scan.id)];
  memoryScans = updated;
  saveAllScansToDisk(updated);
  return scan;
}

export function deleteScan(id: string): boolean {
  const scans = getAllScans();
  const filtered = scans.filter(s => s.id !== id);
  if (filtered.length !== scans.length) {
    memoryScans = filtered;
    saveAllScansToDisk(filtered);
    return true;
  }
  return false;
}

export function clearScans(): void {
  memoryScans = [];
  saveAllScansToDisk([]);
}

export function getAppSettings(): AppSettings {
  if (memorySettings) {
    return memorySettings;
  }

  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      memorySettings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      return memorySettings!;
    }
  } catch (e) {
    console.error('Failed reading settings:', e);
  }

  memorySettings = { ...DEFAULT_SETTINGS };
  return memorySettings;
}

export function saveAppSettings(newSettings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const updated: AppSettings = {
    ...current,
    ...newSettings,
    weights: {
      ...current.weights,
      ...(newSettings.weights || {})
    }
  };

  memorySettings = updated;
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed writing settings to disk:', e);
  }
  return updated;
}

export function getDashboardData(): DashboardStats {
  const scans = getAllScans();
  return getMockDashboardStats(scans);
}

