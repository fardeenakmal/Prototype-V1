import {
  RiskCategory,
  RiskWeightsConfig,
  ScoreBreakdown,
  SecurityIndicator,
  VirusTotalResult,
  DomainHeuristics,
  UrlHeuristics
} from '@/types/security';

export const DEFAULT_RISK_WEIGHTS: RiskWeightsConfig = {
  vtWeight: 40,
  urlHeuristicsWeight: 30,
  domainWeight: 15,
  brandWeight: 10,
  otherWeight: 5
};

export function classifyRisk(score: number): RiskCategory {
  if (score <= 20) return 'SAFE';
  if (score <= 40) return 'LOW_RISK';
  if (score <= 60) return 'MEDIUM_RISK';
  if (score <= 80) return 'HIGH_RISK';
  return 'CRITICAL';
}

export function getRiskLabel(category: RiskCategory): string {
  switch (category) {
    case 'SAFE':
      return 'SAFE';
    case 'LOW_RISK':
      return 'LOW RISK';
    case 'MEDIUM_RISK':
      return 'MEDIUM RISK';
    case 'HIGH_RISK':
      return 'HIGH RISK';
    case 'CRITICAL':
      return 'CRITICAL RISK';
  }
}

export function getRiskVerdict(category: RiskCategory): string {
  switch (category) {
    case 'SAFE':
      return 'No significant phishing indicators detected. Safe to browse with standard caution.';
    case 'LOW_RISK':
      return 'Minor anomalies detected, but insufficient evidence of malicious intent.';
    case 'MEDIUM_RISK':
      return 'Moderate risk indicators present. Exercise caution before entering data.';
    case 'HIGH_RISK':
      return '⚠ High probability of phishing or deceptive credential harvesting.';
    case 'CRITICAL':
      return '🚨 CRITICAL THREAT: Confirmed malicious indicators and brand impersonation detected.';
  }
}

/**
 * Calculates unified Prototype Risk Score from multiple intelligence signals
 */
export function calculateUrlRiskScore(
  domainScore: number,
  urlScore: number,
  domainHeuristics: DomainHeuristics,
  urlHeuristics: UrlHeuristics,
  virusTotal: VirusTotalResult,
  weights: RiskWeightsConfig = DEFAULT_RISK_WEIGHTS
): {
  finalScore: number;
  classification: RiskCategory;
  confidence: number;
  scoreBreakdown: ScoreBreakdown;
  vtIndicators: SecurityIndicator[];
} {
  const vtIndicators: SecurityIndicator[] = [];

  // VirusTotal component
  let rawVtScore = 0;
  if (virusTotal.available && (virusTotal.malicious > 0 || virusTotal.suspicious > 0)) {
    if (virusTotal.malicious >= 5) {
      rawVtScore = 100;
    } else if (virusTotal.malicious >= 2) {
      rawVtScore = 85;
    } else if (virusTotal.malicious === 1) {
      rawVtScore = 65;
    } else if (virusTotal.suspicious >= 2) {
      rawVtScore = 50;
    } else if (virusTotal.suspicious === 1) {
      rawVtScore = 30;
    }

    vtIndicators.push({
      id: 'ind_vt_detections',
      name: `VirusTotal Flagged (${virusTotal.malicious} Malicious Engines)`,
      category: 'virustotal',
      severity: virusTotal.malicious >= 3 ? 'CRITICAL' : virusTotal.malicious > 0 ? 'HIGH' : 'MEDIUM',
      description: `${virusTotal.malicious} threat intelligence engines flagged this target as malicious.`,
      technicalExplanation: `Global threat feeds analyzed this URL against known command-and-control, credential theft kits, and malware distribution databases. Ratio: ${virusTotal.detectionRatio}.`,
      scoreContribution: Math.round(rawVtScore * 0.4),
      evidence: `${virusTotal.malicious} malicious / ${virusTotal.suspicious} suspicious engines`
    });
  } else if (virusTotal.available && virusTotal.harmless > 10 && virusTotal.malicious === 0) {
    vtIndicators.push({
      id: 'ind_vt_clean',
      name: 'VirusTotal Clean Reputation Record',
      category: 'virustotal',
      severity: 'SAFE',
      description: `${virusTotal.harmless} security engines evaluated this destination as harmless.`,
      technicalExplanation: 'Multiple authoritative threat intelligence providers verified this domain as clean.',
      scoreContribution: 0,
      evidence: `${virusTotal.harmless} harmless evaluations`
    });
  }

  // Brand impersonation component
  const rawBrandScore = domainHeuristics.brandImpersonated ? 100 : 0;

  // Other indicators component (e.g. unencrypted HTTP, suspicious query parameters)
  let rawOtherScore = 0;
  if (!urlHeuristics.isHttps) rawOtherScore += 40;
  if (urlHeuristics.hasRedirectParam) rawOtherScore += 30;
  if (domainHeuristics.entropy > 4.0) rawOtherScore += 30;
  rawOtherScore = Math.min(rawOtherScore, 100);

  // If VirusTotal is unavailable or unconfigured, we dynamically re-normalize heuristic weights
  let weightedScore = 0;
  if (virusTotal.available) {
    const totalWeights = weights.vtWeight + weights.urlHeuristicsWeight + weights.domainWeight + weights.brandWeight + weights.otherWeight;
    weightedScore =
      (rawVtScore * weights.vtWeight +
        urlScore * weights.urlHeuristicsWeight +
        domainScore * weights.domainWeight +
        rawBrandScore * weights.brandWeight +
        rawOtherScore * weights.otherWeight) /
      totalWeights;
  } else {
    // Distribute VT weight proportionally across local signals
    const localTotal = weights.urlHeuristicsWeight + weights.domainWeight + weights.brandWeight + weights.otherWeight;
    weightedScore =
      (urlScore * weights.urlHeuristicsWeight +
        domainScore * weights.domainWeight +
        rawBrandScore * weights.brandWeight +
        rawOtherScore * weights.otherWeight) /
      localTotal;
  }

  // Hard floor/ceiling boosts for critical signals
  if (domainHeuristics.brandImpersonated && (urlScore > 20 || domainScore > 30)) {
    weightedScore = Math.max(weightedScore, 75);
  }
  if (domainHeuristics.isPunycode) {
    weightedScore = Math.max(weightedScore, 80);
  }
  if (urlHeuristics.hasAtSymbol) {
    weightedScore = Math.max(weightedScore, 82);
  }
  if (virusTotal.available && virusTotal.malicious >= 3) {
    weightedScore = Math.max(weightedScore, 85);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(weightedScore)));
  const classification = classifyRisk(finalScore);

  // Analytical confidence calculation based on corroboration and data availability
  let confidenceVal = 0.70;
  if (virusTotal.available) confidenceVal += 0.15;
  if (domainHeuristics.brandImpersonated) confidenceVal += 0.08;
  if (urlHeuristics.suspiciousKeywords.length >= 2) confidenceVal += 0.05;
  if (finalScore >= 80 || finalScore <= 15) confidenceVal += 0.05;
  const confidence = Math.min(0.98, Math.max(0.65, Number(confidenceVal.toFixed(2))));

  const scoreBreakdown: ScoreBreakdown = {
    vtScore: Math.round(rawVtScore),
    urlHeuristicScore: Math.round(urlScore),
    domainScore: Math.round(domainScore),
    brandScore: Math.round(rawBrandScore),
    otherScore: Math.round(rawOtherScore)
  };

  return {
    finalScore,
    classification,
    confidence,
    scoreBreakdown,
    vtIndicators
  };
}

/**
 * Generates tailored recommendations based on detected indicators
 */
export function generateRecommendations(
  classification: RiskCategory,
  indicators: SecurityIndicator[]
): string[] {
  const recommendations: string[] = [];

  if (classification === 'CRITICAL' || classification === 'HIGH_RISK') {
    recommendations.push('Do NOT enter any passwords, credentials, or personal identity details.');
    recommendations.push('Do NOT download, open, or execute any files or attachments from this link.');
    recommendations.push('Do NOT provide credit card, banking, or cryptocurrency wallet information.');
    recommendations.push('Verify the official domain independently via an external search engine or known bookmark.');
    recommendations.push('Report this incident and URL to your internal security operations / IT Helpdesk team.');
    recommendations.push('Block this domain at your perimeter firewall, DNS sinkhole, or secure web gateway.');
  } else if (classification === 'MEDIUM_RISK') {
    recommendations.push('Exercise caution before interacting with this web page.');
    recommendations.push('Verify the address bar carefully to ensure the domain matches the expected service.');
    recommendations.push('Avoid providing sensitive corporate or financial data without independent verification.');
    recommendations.push('Inspect the SSL/TLS certificate details in your browser address bar.');
  } else if (classification === 'LOW_RISK') {
    recommendations.push('Minor anomalies detected; standard caution is advised.');
    recommendations.push('Verify that you were expecting this communication or link.');
  } else {
    recommendations.push('No significant phishing indicators detected during automated analysis.');
    recommendations.push('Automated security scanners cannot guarantee absolute safety — stay vigilant.');
    recommendations.push('Always confirm that the browser shows a valid HTTPS padlock before submitting confidential information.');
  }

  return recommendations;
}

