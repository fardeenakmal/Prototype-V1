import { ExtractedUrl, RiskCategory } from '@/types/security';
import { normalizeUrl, analyzeDomainHeuristics, analyzeUrlHeuristics } from './urlAnalyzer';
import { calculateUrlRiskScore } from './riskEngine';

/**
 * Safely extracts all URLs from plain text or raw HTML email bodies without evaluating HTML/scripts
 */
export function extractUrlsFromText(text: string): string[] {
  if (!text) return [];

  // Match http/https URLs, and also www. domains
  const urlRegex = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/gi;
  const matches = text.match(urlRegex) || [];
  const cleanUrls = new Set<string>();

  for (const raw of matches) {
    let clean = raw.trim();
    // Strip trailing punctuation common in written prose (. , ; : ) ] } " ')
    clean = clean.replace(/[.,;:!?)"'>]+$/, '');
    clean = clean.replace(/^[<("'[\]]+/, '');

    if (clean.length > 5) {
      if (!/^https?:\/\//i.test(clean)) {
        clean = 'https://' + clean;
      }
      try {
        const parsed = new URL(clean);
        // Only accept valid http/https schemes
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          cleanUrls.add(parsed.toString());
        }
      } catch {
        // Ignore malformed strings
      }
    }
  }

  return Array.from(cleanUrls);
}

/**
 * Extracts and performs quick heuristic triage on each URL extracted from an email
 */
export function triageExtractedUrls(urls: string[]): ExtractedUrl[] {
  return urls.map((rawUrl) => {
    try {
      const { url: urlObj, normalized } = normalizeUrl(rawUrl);
      const domainResult = analyzeDomainHeuristics(urlObj);
      const urlResult = analyzeUrlHeuristics(urlObj);

      const dummyVt = {
        available: false,
        configured: false,
        malicious: 0,
        suspicious: 0,
        harmless: 0,
        undetected: 0,
        timeout: 0,
        totalEngines: 0,
        detectionRatio: 'Not Scanned'
      };

      const { finalScore, classification } = calculateUrlRiskScore(
        domainResult.score,
        urlResult.score,
        domainResult.heuristics,
        urlResult.heuristics,
        dummyVt
      );

      const indicatorsCount = domainResult.indicators.length + urlResult.indicators.length;

      return {
        url: normalized,
        domain: urlObj.hostname,
        heuristicScore: finalScore,
        classification,
        indicatorsCount,
        vtStatus: 'Pending analysis'
      };
    } catch {
      return {
        url: rawUrl,
        domain: 'malformed-url',
        heuristicScore: 50,
        classification: 'MEDIUM_RISK' as RiskCategory,
        indicatorsCount: 1,
        vtStatus: 'Malformed'
      };
    }
  });
}

