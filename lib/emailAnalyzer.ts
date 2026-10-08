import {
  EmailAnalysisResult,
  SecurityIndicator,
  SenderAnalysis,
  SeverityLevel
} from '@/types/security';
import { extractUrlsFromText, triageExtractedUrls } from './urlExtractor';
import { classifyRisk, generateRecommendations } from './riskEngine';

const URGENCY_PATTERNS = [
  /urgent(ly)?/i,
  /action required/i,
  /account (has been )?suspended/i,
  /account (has been )?locked/i,
  /immediate(ly)? (action|attention)/i,
  /within (24|48|12) hours?/i,
  /final notice/i,
  /security warning/i,
  /unauthorized access/i,
  /click here immediately/i,
  /deadline/i,
  /risk of closure/i,
  /compromised/i
];

const CREDENTIAL_PATTERNS = [
  /verify your password/i,
  /update (your )?(login|credentials|account)/i,
  /confirm your password/i,
  /reset (your )?password/i,
  /enter your (pin|passcode|token)/i,
  /identity verification/i,
  /log in to verify/i,
  /sign in to review/i,
  /validate your identity/i,
  /two-factor|2fa code/i
];

const FINANCIAL_PATTERNS = [
  /invoice attached/i,
  /payment (failed|declined|overdue)/i,
  /wire transfer/i,
  /confirm your bank (account)?/i,
  /credit card expired/i,
  /billing problem/i,
  /crypto(currency)? wallet/i,
  /refund (pending|approved)/i,
  /bitcoin|usdt|eth/i,
  /transaction suspended/i,
  /remittance advice/i
];

const ATTACHMENT_PATTERNS = [
  /attached (file|document|invoice|statement|receipt|copy)/i,
  /see attached/i,
  /\.zip\b/i,
  /\.iso\b/i,
  /\.exe\b/i,
  /\.scr\b/i,
  /\.vbs\b/i,
  /\.tar\.gz\b/i,
  /\.html\.svg\b/i,
  /\.xlsm\b/i,
  /\.docm\b/i
];

/**
 * Extracts email address from strings like "PayPal Support <support@paypal.com>"
 */
export function parseEmailAddress(raw: string): { address: string; domain: string } {
  if (!raw) return { address: '', domain: '' };
  const match = raw.match(/<([^>]+)>/) || raw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const address = match ? match[1].toLowerCase().trim() : raw.toLowerCase().trim();
  const domain = address.includes('@') ? address.split('@')[1] : '';
  return { address, domain };
}

/**
 * Compares two domain names to check if they share apex domain (eTLD+1)
 */
function isDomainMatch(domainA: string, domainB: string): boolean {
  if (!domainA || !domainB) return true;
  const da = domainA.toLowerCase();
  const db = domainB.toLowerCase();
  if (da === db) return true;

  const partsA = da.split('.');
  const partsB = db.split('.');
  if (partsA.length >= 2 && partsB.length >= 2) {
    const apexA = partsA.slice(-2).join('.');
    const apexB = partsB.slice(-2).join('.');
    return apexA === apexB;
  }
  return false;
}

export function analyzeEmail(payload: {
  from: string;
  replyTo?: string;
  subject: string;
  body: string;
  receivedHeaders?: string;
}): EmailAnalysisResult {
  const indicators: SecurityIndicator[] = [];
  const fromParsed = parseEmailAddress(payload.from);
  const replyToParsed = payload.replyTo ? parseEmailAddress(payload.replyTo) : undefined;

  const combinedContent = `${payload.subject} \n ${payload.body}`;

  // 1. URL Extraction & Link Triage
  const rawUrls = extractUrlsFromText(payload.body);
  const extractedUrls = triageExtractedUrls(rawUrls);

  // 2. Sender vs Reply-To Mismatch Analysis
  let replyToMismatch = false;
  if (replyToParsed && replyToParsed.domain && fromParsed.domain) {
    replyToMismatch = !isDomainMatch(fromParsed.domain, replyToParsed.domain);
  }

  // 3. Sender vs Embedded Link Mismatch Analysis
  const mismatchedDomains: string[] = [];
  let embeddedDomainMismatch = false;
  if (fromParsed.domain && extractedUrls.length > 0) {
    for (const urlItem of extractedUrls) {
      if (!isDomainMatch(fromParsed.domain, urlItem.domain)) {
        mismatchedDomains.push(urlItem.domain);
      }
    }
    if (mismatchedDomains.length > 0) {
      embeddedDomainMismatch = true;
    }
  }

  let spoofingRisk: SeverityLevel = 'SAFE';
  if (replyToMismatch && embeddedDomainMismatch) {
    spoofingRisk = 'CRITICAL';
  } else if (replyToMismatch || embeddedDomainMismatch) {
    spoofingRisk = 'HIGH';
  }

  const senderAnalysis: SenderAnalysis = {
    fromAddress: fromParsed.address,
    fromDomain: fromParsed.domain,
    replyToAddress: replyToParsed?.address,
    replyToDomain: replyToParsed?.domain,
    replyToMismatch,
    embeddedDomainMismatch,
    mismatchedDomains: Array.from(new Set(mismatchedDomains)),
    spoofingRisk
  };

  // 4. Social Engineering / Keyword Detection
  const detectedKeywords: string[] = [];
  let hasUrgencyLanguage = false;
  for (const regex of URGENCY_PATTERNS) {
    const match = combinedContent.match(regex);
    if (match) {
      hasUrgencyLanguage = true;
      detectedKeywords.push(match[0]);
    }
  }

  let hasCredentialRequests = false;
  for (const regex of CREDENTIAL_PATTERNS) {
    const match = combinedContent.match(regex);
    if (match) {
      hasCredentialRequests = true;
      detectedKeywords.push(match[0]);
    }
  }

  let hasFinancialRequests = false;
  for (const regex of FINANCIAL_PATTERNS) {
    const match = combinedContent.match(regex);
    if (match) {
      hasFinancialRequests = true;
      detectedKeywords.push(match[0]);
    }
  }

  let hasAttachmentReferences = false;
  for (const regex of ATTACHMENT_PATTERNS) {
    const match = combinedContent.match(regex);
    if (match) {
      hasAttachmentReferences = true;
      detectedKeywords.push(match[0]);
    }
  }

  // Calculate Subscores
  let senderRepScore = 0;
  if (replyToMismatch) {
    indicators.push({
      id: 'ind_replyto_mismatch',
      name: 'Reply-To Domain Mismatch Detected',
      category: 'mismatch',
      severity: 'HIGH',
      description: `Sender claims to be from '${fromParsed.domain}', but responses route to '${replyToParsed?.domain}'.`,
      technicalExplanation: 'Legitimate corporate organizations send and receive messages on the same domain namespace. Mismatched Reply-To headers are a hallmark of Business Email Compromise (BEC) and phishing lures.',
      scoreContribution: 30,
      evidence: `From: ${fromParsed.address} vs Reply-To: ${replyToParsed?.address}`
    });
    senderRepScore += 35;
  }

  if (embeddedDomainMismatch && extractedUrls.length > 0) {
    indicators.push({
      id: 'ind_link_domain_mismatch',
      name: 'Embedded Link Domain Mismatch',
      category: 'mismatch',
      severity: 'CRITICAL',
      description: `Email displays sender '${fromParsed.domain}', but hyperlinks direct to '${mismatchedDomains.slice(0, 3).join(', ')}'.`,
      technicalExplanation: 'Deceptive phishing attacks impersonate legitimate brands in the sender identity while routing click-through traffic to external credential harvesting portals.',
      scoreContribution: 35,
      evidence: `From: ${fromParsed.domain} -> Links direct to: ${mismatchedDomains.join(', ')}`
    });
    senderRepScore += 40;
  }

  // URL Threat Score
  let urlThreatScore = 0;
  const highRiskUrls = extractedUrls.filter(u => u.classification === 'HIGH_RISK' || u.classification === 'CRITICAL');
  if (highRiskUrls.length > 0) {
    indicators.push({
      id: 'ind_malicious_urls_in_email',
      name: `Suspicious URLs Detected in Body (${highRiskUrls.length} Flags)`,
      category: 'url',
      severity: 'CRITICAL',
      description: `The email body contains ${highRiskUrls.length} destination link(s) exhibiting phishing heuristics.`,
      technicalExplanation: `Extracted links (${highRiskUrls.map(u => u.domain).join(', ')}) contain deceptive domain structures or known phishing markers.`,
      scoreContribution: 35,
      evidence: `${highRiskUrls.length} high-risk URL(s)`
    });
    urlThreatScore += 45;
  } else if (extractedUrls.length > 0) {
    indicators.push({
      id: 'ind_urls_present',
      name: `External URLs Embedded (${extractedUrls.length} Links)`,
      category: 'url',
      severity: 'LOW',
      description: `Email contains ${extractedUrls.length} external destination link(s).`,
      technicalExplanation: 'Automated triage parsed each link for domain reputation and path patterns.',
      scoreContribution: 5,
      evidence: `Extracted ${extractedUrls.length} links`
    });
    urlThreatScore += 10;
  }

  // Urgency Language Score
  let urgencyScore = 0;
  if (hasUrgencyLanguage) {
    indicators.push({
      id: 'ind_urgency_pressure',
      name: 'High Urgency / Coercive Language',
      category: 'content',
      severity: 'HIGH',
      description: 'The email uses artificial time pressure and threats of account suspension.',
      technicalExplanation: 'Social engineering psychological triggers (panic, fear of account loss, immediate deadlines) are designed to bypass recipient critical thinking and prompt impulsive clicks.',
      scoreContribution: 20,
      evidence: `Urgency keywords detected: ${detectedKeywords.filter(k => URGENCY_PATTERNS.some(p => p.test(k))).slice(0, 3).join(', ')}`
    });
    urgencyScore += 25;
  }

  // Credential Request Score
  let credentialScore = 0;
  if (hasCredentialRequests) {
    indicators.push({
      id: 'ind_credential_harvest_request',
      name: 'Direct Credential or Password Request',
      category: 'content',
      severity: 'HIGH',
      description: 'The message solicits login credentials, password resets, or identity re-verification.',
      technicalExplanation: 'Legitimate service providers rarely ask customers to click email links to reset passwords without a customer-initiated workflow.',
      scoreContribution: 25,
      evidence: 'Credential solicitation phrases matched in message body'
    });
    credentialScore += 30;
  }

  // Financial Request Score
  let financialScore = 0;
  if (hasFinancialRequests) {
    indicators.push({
      id: 'ind_financial_solicitation',
      name: 'Financial Transaction / Payment Prompt',
      category: 'content',
      severity: 'MEDIUM',
      description: 'The message references invoices, wire transfers, failed payments, or crypto transactions.',
      technicalExplanation: 'Financial lures are frequently coupled with fraudulent invoices or fake payment receipts to provoke immediate response.',
      scoreContribution: 15,
      evidence: 'Financial keywords present in message'
    });
    financialScore += 20;
  }

  // Attachment References
  if (hasAttachmentReferences) {
    indicators.push({
      id: 'ind_attachment_lure',
      name: 'Suspicious Attachment Reference / Lure',
      category: 'content',
      severity: 'MEDIUM',
      description: 'Text references attached invoices, ISO archives, or executable files.',
      technicalExplanation: 'Phishing campaigns often distribute malware droppers disguised as invoices or receipts in zip/iso/executable formats.',
      scoreContribution: 15,
      evidence: 'Attachment reference keywords detected'
    });
  }

  // Received Headers Inspection (if provided)
  if (payload.receivedHeaders) {
    const rawHeaders = payload.receivedHeaders.toLowerCase();
    if (rawHeaders.includes('spf=fail') || rawHeaders.includes('spf=softfail')) {
      indicators.push({
        id: 'ind_spf_fail',
        name: 'SPF Authentication Failure',
        category: 'reputation',
        severity: 'HIGH',
        description: 'Received email headers indicate an SPF (Sender Policy Framework) verification failure.',
        technicalExplanation: 'The originating mail server IP address is not authorized in the sender domain DNS SPF records.',
        scoreContribution: 25,
        evidence: 'Received header indicates SPF fail'
      });
      senderRepScore += 25;
    }
    if (rawHeaders.includes('dkim=fail')) {
      indicators.push({
        id: 'ind_dkim_fail',
        name: 'DKIM Cryptographic Signature Failure',
        category: 'reputation',
        severity: 'HIGH',
        description: 'DKIM signature could not be verified with sender public key.',
        technicalExplanation: 'The email body or headers were altered in transit or forged.',
        scoreContribution: 25,
        evidence: 'Received header indicates DKIM fail'
      });
      senderRepScore += 25;
    }
  }

  // Calculate Combined Weighted Email Risk Score
  let rawTotal =
    senderRepScore * 0.35 +
    urlThreatScore * 0.30 +
    urgencyScore * 0.15 +
    credentialScore * 0.10 +
    financialScore * 0.10;

  // Corroboration multiplier: if multiple severe indicators are present, elevate score
  if (senderAnalysis.spoofingRisk === 'CRITICAL' && (hasCredentialRequests || hasUrgencyLanguage)) {
    rawTotal = Math.max(rawTotal, 86);
  } else if (senderAnalysis.spoofingRisk === 'HIGH' && highRiskUrls.length > 0) {
    rawTotal = Math.max(rawTotal, 80);
  }

  const finalRiskScore = Math.min(100, Math.max(0, Math.round(rawTotal)));
  const classification = classifyRisk(finalRiskScore);

  let confidenceVal = 0.75;
  if (extractedUrls.length > 0) confidenceVal += 0.10;
  if (senderAnalysis.replyToMismatch || senderAnalysis.embeddedDomainMismatch) confidenceVal += 0.08;
  if (payload.receivedHeaders) confidenceVal += 0.05;
  const confidence = Math.min(0.97, Math.max(0.70, Number(confidenceVal.toFixed(2))));

  const recommendations = generateRecommendations(classification, indicators);

  return {
    id: `scan_email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: 'EMAIL',
    target: payload.subject || payload.from || 'Email Analysis',
    timestamp: new Date().toISOString(),
    from: payload.from,
    fromDomain: fromParsed.domain,
    replyTo: payload.replyTo,
    replyToDomain: replyToParsed?.domain,
    subject: payload.subject,
    bodyExcerpt: payload.body.substring(0, 300) + (payload.body.length > 300 ? '...' : ''),
    receivedHeaders: payload.receivedHeaders,
    riskScore: finalRiskScore,
    classification,
    confidence,
    senderAnalysis,
    extractedUrls,
    indicators,
    keywordsDetected: Array.from(new Set(detectedKeywords)),
    hasUrgencyLanguage,
    hasCredentialRequests,
    hasFinancialRequests,
    hasAttachmentReferences,
    recommendations,
    scoreBreakdown: {
      senderReputationScore: Math.min(100, senderRepScore),
      urlThreatScore: Math.min(100, urlThreatScore),
      urgencyLanguageScore: Math.min(100, urgencyScore),
      credentialRequestScore: Math.min(100, credentialScore),
      financialRequestScore: Math.min(100, financialScore)
    }
  };
}

