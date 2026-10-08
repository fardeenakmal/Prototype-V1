export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | 'SAFE';

export type RiskCategory = 'SAFE' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL';

export type ScanType = 'URL' | 'EMAIL';

export interface SecurityIndicator {
  id: string;
  name: string;
  category: 'domain' | 'url' | 'content' | 'virustotal' | 'reputation' | 'mismatch' | 'behavior';
  severity: SeverityLevel;
  description: string;
  technicalExplanation: string;
  scoreContribution: number;
  evidence?: string;
}

export interface VirusTotalEngineResult {
  engine: string;
  category: 'malicious' | 'suspicious' | 'harmless' | 'undetected' | 'timeout';
  result?: string;
}

export interface VirusTotalResult {
  available: boolean;
  configured: boolean;
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  timeout: number;
  totalEngines: number;
  detectionRatio: string; // e.g. "8 / 95"
  scanDate?: string;
  reputation?: number;
  engineDetails?: VirusTotalEngineResult[];
  permalink?: string;
  isDemo?: boolean;
  message?: string;
}

export interface DomainHeuristics {
  domain: string;
  length: number;
  subdomainCount: number;
  subdomains: string[];
  tld: string;
  isSuspiciousTld: boolean;
  isIpAddress: boolean;
  isPunycode: boolean;
  hyphenCount: number;
  dotCount: number;
  suspiciousCharacters: string[];
  brandImpersonated?: string;
  lookalikeTarget?: string;
  entropy: number;
}

export interface UrlHeuristics {
  url: string;
  length: number;
  queryParamCount: number;
  hasAtSymbol: boolean;
  hasEncodedChars: boolean;
  pathDepth: number;
  suspiciousKeywords: string[];
  protocol: string;
  isHttps: boolean;
  port?: string;
  hasRedirectParam: boolean;
}

export interface ScoreBreakdown {
  vtScore: number;
  urlHeuristicScore: number;
  domainScore: number;
  brandScore: number;
  otherScore: number;
}

export interface URLAnalysisResult {
  id: string;
  target: string;
  domain: string;
  timestamp: string;
  type: 'URL';
  riskScore: number; // 0 - 100
  classification: RiskCategory;
  confidence: number; // e.g. 0.89 (89%)
  indicators: SecurityIndicator[];
  domainHeuristics: DomainHeuristics;
  urlHeuristics: UrlHeuristics;
  virusTotal: VirusTotalResult;
  recommendations: string[];
  scoreBreakdown: ScoreBreakdown;
  isDemo?: boolean;
}

export interface ExtractedUrl {
  url: string;
  domain: string;
  heuristicScore: number;
  classification: RiskCategory;
  vtStatus?: string;
  scanId?: string;
  indicatorsCount: number;
}

export interface SenderAnalysis {
  fromAddress: string;
  fromDomain: string;
  replyToAddress?: string;
  replyToDomain?: string;
  replyToMismatch: boolean;
  embeddedDomainMismatch: boolean;
  mismatchedDomains: string[];
  spoofingRisk: SeverityLevel;
}

export interface EmailAnalysisResult {
  id: string;
  type: 'EMAIL';
  target: string; // Subject or sender summary
  timestamp: string;
  from: string;
  fromDomain: string;
  replyTo?: string;
  replyToDomain?: string;
  subject: string;
  bodyExcerpt: string;
  receivedHeaders?: string;
  riskScore: number;
  classification: RiskCategory;
  confidence: number;
  senderAnalysis: SenderAnalysis;
  extractedUrls: ExtractedUrl[];
  indicators: SecurityIndicator[];
  keywordsDetected: string[];
  hasUrgencyLanguage: boolean;
  hasCredentialRequests: boolean;
  hasFinancialRequests: boolean;
  hasAttachmentReferences: boolean;
  recommendations: string[];
  scoreBreakdown: {
    senderReputationScore: number;
    urlThreatScore: number;
    urgencyLanguageScore: number;
    credentialRequestScore: number;
    financialRequestScore: number;
  };
  isDemo?: boolean;
}

export type ScanResult = URLAnalysisResult | EmailAnalysisResult;

export interface RiskWeightsConfig {
  vtWeight: number; // default 40
  urlHeuristicsWeight: number; // default 30
  domainWeight: number; // default 15
  brandWeight: number; // default 10
  otherWeight: number; // default 5
}

export interface DashboardStats {
  totalScans: number;
  threatsDetected: number;
  safeScans: number;
  highRiskScans: number;
  criticalScans: number;
  threatDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  scanActivity: {
    date: string;
    scans: number;
    threats: number;
  }[];
  detectionSources: {
    source: string;
    detections: number;
  }[];
  recentScans: ScanResult[];
}

