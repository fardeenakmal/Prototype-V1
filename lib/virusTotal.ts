import { VirusTotalResult, VirusTotalEngineResult } from '@/types/security';

/**
 * Encodes a URL to a base64url string without padding as required by VirusTotal API v3
 */
export function encodeUrlForVirusTotal(url: string): string {
  const base64 = Buffer.from(url).toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Returns pre-configured demo intelligence for test cases when no API key is provided
 */
function getDemoIntelligence(url: string): VirusTotalResult | null {
  const lower = url.toLowerCase();

  // 1. Phishing / High-Risk Demo Case
  if (
    lower.includes('paypal-security-verification.top') ||
    lower.includes('secure-login-example.com') ||
    lower.includes('phishing-demo.example') ||
    lower.includes('fake-account-update')
  ) {
    const engineDetails: VirusTotalEngineResult[] = [
      { engine: 'Google Safe Browsing', category: 'malicious', result: 'phishing' },
      { engine: 'Sophos', category: 'malicious', result: 'malicious site' },
      { engine: 'Kaspersky', category: 'malicious', result: 'phishing' },
      { engine: 'Fortinet', category: 'malicious', result: 'phishing' },
      { engine: 'ESET', category: 'malicious', result: 'phishing' },
      { engine: 'BitDefender', category: 'malicious', result: 'phishing' },
      { engine: 'Avast', category: 'malicious', result: 'malware' },
      { engine: 'CyRadar', category: 'suspicious', result: 'suspicious' },
      { engine: 'CRDF', category: 'malicious', result: 'malicious' },
      { engine: 'Netcraft', category: 'malicious', result: 'phishing' },
      { engine: 'CleanBrowsing', category: 'harmless', result: 'clean' },
      { engine: 'OpenDNS', category: 'harmless', result: 'clean' },
      { engine: 'Cloudflare', category: 'harmless', result: 'clean' },
      { engine: 'Yandex Safebrowsing', category: 'malicious', result: 'phishing' }
    ];

    return {
      available: true,
      configured: false,
      malicious: 10,
      suspicious: 2,
      harmless: 68,
      undetected: 14,
      timeout: 0,
      totalEngines: 94,
      detectionRatio: '10 / 94 security engines flagged this URL',
      scanDate: new Date().toISOString(),
      reputation: -78,
      engineDetails,
      isDemo: true,
      message: 'DEMO DATA — Simulated VirusTotal threat intelligence for demonstration'
    };
  }

  // 2. Safe Demo Case
  if (
    lower.includes('google.com') ||
    lower.includes('github.com') ||
    lower.includes('microsoft.com') ||
    lower.includes('wikipedia.org') ||
    lower.includes('apple.com')
  ) {
    const engineDetails: VirusTotalEngineResult[] = [
      { engine: 'Google Safe Browsing', category: 'harmless', result: 'clean' },
      { engine: 'Sophos', category: 'harmless', result: 'clean' },
      { engine: 'Kaspersky', category: 'harmless', result: 'clean' },
      { engine: 'Fortinet', category: 'harmless', result: 'clean' },
      { engine: 'ESET', category: 'harmless', result: 'clean' },
      { engine: 'BitDefender', category: 'harmless', result: 'clean' },
      { engine: 'Microsoft SmartScreen', category: 'harmless', result: 'clean' },
      { engine: 'Cloudflare', category: 'harmless', result: 'clean' }
    ];

    return {
      available: true,
      configured: false,
      malicious: 0,
      suspicious: 0,
      harmless: 89,
      undetected: 5,
      timeout: 0,
      totalEngines: 94,
      detectionRatio: '0 / 94 security engines flagged this URL',
      scanDate: new Date().toISOString(),
      reputation: 95,
      engineDetails,
      isDemo: true,
      message: 'DEMO DATA — Simulated clean VirusTotal response for demonstration'
    };
  }

  // 3. Suspicious Demo Case
  if (lower.includes('suspicious') || lower.includes('verify') || lower.includes('account-alert')) {
    const engineDetails: VirusTotalEngineResult[] = [
      { engine: 'CyRadar', category: 'suspicious', result: 'suspicious' },
      { engine: 'CRDF', category: 'suspicious', result: 'suspicious' },
      { engine: 'Google Safe Browsing', category: 'harmless', result: 'clean' },
      { engine: 'Fortinet', category: 'malicious', result: 'phishing' },
      { engine: 'Kaspersky', category: 'harmless', result: 'clean' },
      { engine: 'Cloudflare', category: 'harmless', result: 'clean' }
    ];

    return {
      available: true,
      configured: false,
      malicious: 1,
      suspicious: 3,
      harmless: 72,
      undetected: 18,
      timeout: 0,
      totalEngines: 94,
      detectionRatio: '4 / 94 security engines flagged this URL',
      scanDate: new Date().toISOString(),
      reputation: -15,
      engineDetails,
      isDemo: true,
      message: 'DEMO DATA — Simulated suspicious intelligence'
    };
  }

  return null;
}

/**
 * Server-side VirusTotal query handler with graceful fallbacks
 */
export async function queryVirusTotal(
  targetUrl: string,
  userApiKey?: string,
  forceDemoMode?: boolean
): Promise<VirusTotalResult> {
  const apiKey = (userApiKey || process.env.VIRUSTOTAL_API_KEY || '').trim();

  // If force demo mode or no API key, check demo simulation
  if (forceDemoMode || !apiKey) {
    const demo = getDemoIntelligence(targetUrl);
    if (demo) {
      return demo;
    }

    return {
      available: false,
      configured: false,
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      undetected: 0,
      timeout: 0,
      totalEngines: 0,
      detectionRatio: 'VirusTotal: Not Configured',
      message: 'VirusTotal: Not Configured. Add your API key in Settings or environment variables to enable live global reputation lookups. Local heuristics active.'
    };
  }

  try {
    const urlId = encodeUrlForVirusTotal(targetUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.status === 401) {
      return {
        available: false,
        configured: true,
        malicious: 0,
        suspicious: 0,
        harmless: 0,
        undetected: 0,
        timeout: 0,
        totalEngines: 0,
        detectionRatio: 'Auth Failed',
        message: 'VirusTotal: Authentication failed. Please check that your VIRUSTOTAL_API_KEY is valid.'
      };
    }

    if (response.status === 429) {
      return {
        available: false,
        configured: true,
        malicious: 0,
        suspicious: 0,
        harmless: 0,
        undetected: 0,
        timeout: 0,
        totalEngines: 0,
        detectionRatio: 'Rate Limited',
        message: 'VirusTotal API rate limit reached (Public API permits 4 requests/min). Proceeding with local heuristics.'
      };
    }

    if (response.status === 404) {
      // URL has not been analyzed by VT yet. Submit for analysis.
      try {
        const submitController = new AbortController();
        const submitTimeout = setTimeout(() => submitController.abort(), 6000);

        const submitRes = await fetch('https://www.virustotal.com/api/v3/urls', {
          method: 'POST',
          headers: {
            'x-apikey': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({ url: targetUrl }).toString(),
          signal: submitController.signal
        });

        clearTimeout(submitTimeout);

        if (submitRes.ok) {
          return {
            available: true,
            configured: true,
            malicious: 0,
            suspicious: 0,
            harmless: 0,
            undetected: 0,
            timeout: 0,
            totalEngines: 0,
            detectionRatio: 'Analysis Queued',
            message: 'URL was submitted to VirusTotal queue for initial analysis. No historical record found yet.'
          };
        }
      } catch {
        // Fall through to neutral response
      }

      return {
        available: false,
        configured: true,
        malicious: 0,
        suspicious: 0,
        harmless: 0,
        undetected: 0,
        timeout: 0,
        totalEngines: 0,
        detectionRatio: 'No Record',
        message: 'URL has not yet been scanned by VirusTotal engines.'
      };
    }

    if (!response.ok) {
      return {
        available: false,
        configured: true,
        malicious: 0,
        suspicious: 0,
        harmless: 0,
        undetected: 0,
        timeout: 0,
        totalEngines: 0,
        detectionRatio: 'API Error',
        message: `VirusTotal returned status HTTP ${response.status}. Local heuristic analysis will be used.`
      };
    }

    const data = await response.json();
    const attributes = data.data?.attributes;
    const stats = attributes?.last_analysis_stats || {};
    const results = attributes?.last_analysis_results || {};

    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const harmless = stats.harmless || 0;
    const undetected = stats.undetected || 0;
    const timeoutCount = stats.timeout || 0;
    const totalEngines = malicious + suspicious + harmless + undetected + timeoutCount;

    const engineDetails: VirusTotalEngineResult[] = Object.keys(results).map((engineName) => {
      const entry = results[engineName];
      return {
        engine: engineName,
        category: entry.category,
        result: entry.result
      };
    });

    return {
      available: true,
      configured: true,
      malicious,
      suspicious,
      harmless,
      undetected,
      timeout: timeoutCount,
      totalEngines: totalEngines || 90,
      detectionRatio: `${malicious} / ${totalEngines || 90} security engines flagged this URL`,
      scanDate: attributes?.last_analysis_date
        ? new Date(attributes.last_analysis_date * 1000).toISOString()
        : new Date().toISOString(),
      reputation: attributes?.reputation ?? 0,
      engineDetails: engineDetails.slice(0, 30), // top 30
      permalink: data.data?.links?.self,
      isDemo: false,
      message: malicious > 0
        ? `VirusTotal engines detected malicious activity (${malicious} detections)`
        : 'VirusTotal analysis completed with 0 malicious detections'
    };
  } catch (error: unknown) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return {
      available: false,
      configured: true,
      malicious: 0,
      suspicious: 0,
      harmless: 0,
      undetected: 0,
      timeout: 0,
      totalEngines: 0,
      detectionRatio: 'Timeout / Unreachable',
      message: isAbort
        ? 'VirusTotal request timed out after 8 seconds. Proceeding with local heuristics.'
        : 'Network error communicating with VirusTotal. Proceeding with local heuristics.'
    };
  }
}

