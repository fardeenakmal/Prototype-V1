import { ScanResult, DashboardStats } from '@/types/security';

export const DEMO_URLS = [
  {
    label: 'Safe URL (Google)',
    url: 'https://www.google.com',
    type: 'Safe',
    desc: 'Legitimate domain with clean reputation and standard TLS.'
  },
  {
    label: 'Suspicious URL (Multi-subdomain Auth)',
    url: 'https://secure-login-example.com/account/verify?token=89437&ref=portal',
    type: 'Suspicious',
    desc: 'Unregistered domain containing security keywords and auth parameters.'
  },
  {
    label: 'Phishing Demo (PayPal Brand Impersonation)',
    url: 'https://paypal-security-verification.top/auth/signin?session=verify-identity',
    type: 'Critical Phishing',
    desc: 'Impersonates PayPal with suspicious .top TLD, hyphen chains, and credential trap.'
  },
  {
    label: 'Homograph / Punycode URL',
    url: 'https://xn--pple-43d.com/support/login',
    type: 'Punycode Attack',
    desc: 'IDN Homograph attack using Cyrillic characters to visually spoof Apple.'
  },
  {
    label: 'IP Host with Redirect URL',
    url: 'http://198.51.100.42:8080/portal/login?redirect_to=https://evil-site.com',
    type: 'IP Host & Cleartext',
    desc: 'Direct IP host, unencrypted HTTP, custom port, and open redirect parameter.'
  }
];

export const DEMO_EMAILS = [
  {
    label: 'PayPal Account Suspension (Phishing)',
    from: 'PayPal Security Team <security-alert@paypal-account-notice.example>',
    replyTo: 'billing-recovery@dropbox-auth.xyz',
    subject: 'URGENT: Action Required - Your PayPal Account Has Been Suspended',
    body: `Dear Customer,

We detected unusual login attempts to your PayPal account from an unrecognized IP address. To prevent unauthorized financial transactions and identity theft, your account has been temporarily restricted.

You must verify your credentials and confirm your bank account within 24 hours to prevent permanent account termination.

Click the secure link below to unlock your account:
https://paypal-security-verification.top/auth/signin?session=verify-identity

If you do not verify your password immediately, your funds will remain frozen.

Sincerely,
PayPal Security & Fraud Department`,
    receivedHeaders: 'Received: from mail.phishrelay.xyz ([198.51.100.12]) by mx.google.com; spf=fail; dkim=fail'
  },
  {
    label: 'CEO Wire Transfer / BEC Lure',
    from: 'CEO Johnathan Vance <ceo-executive@internal-corp-desk.work>',
    replyTo: 'confidential-finance@inbox-crypto.org',
    subject: 'Urgent Wire Transfer Authorization Needed - Confidential Acquisition',
    body: `Hi Finance Team,

I am currently in an all-day executive board meeting with limited phone access. 

We need to execute an urgent payment for an invoice attached to our confidential international acquisition before 5:00 PM today. Please process the wire transfer of $48,500 immediately to the vendor account in the portal.

Review the invoice and wire details here:
https://secure-login-example.com/account/verify?invoice_id=98842

Please confirm once the payment has cleared. Do not discuss this via phone as the deal is under strict NDA.

Regards,
Johnathan Vance
Chief Executive Officer`,
    receivedHeaders: 'Received: from proxy.relay.net ([203.0.113.88]); spf=softfail'
  },
  {
    label: 'GitHub Security Alert (Legitimate / Clean)',
    from: 'GitHub <notifications@github.com>',
    replyTo: 'support@github.com',
    subject: '[GitHub] A new personal access token was generated for your account',
    body: `Hey developer,

We wanted to inform you that a new personal access token (Classic) was just generated on your GitHub account:

Token Name: CI-Automation-Runner
Scopes: repo, workflow
Created: October 8, 2026

If you generated this token, no further action is necessary.

If you did not generate this token, please visit your account settings immediately to revoke it:
https://github.com/settings/tokens

Thanks,
The GitHub Team`,
    receivedHeaders: 'Received: from mail.github.com ([140.82.112.4]); spf=pass; dkim=pass'
  }
];

export const INITIAL_SEED_SCANS: ScanResult[] = [
  {
    id: 'scan_seed_1',
    target: 'https://paypal-security-verification.top/auth/signin?session=verify-identity',
    domain: 'paypal-security-verification.top',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    type: 'URL',
    riskScore: 92,
    classification: 'CRITICAL',
    confidence: 0.94,
    indicators: [
      {
        id: 'ind_brand_seed1',
        name: 'Brand Impersonation (PayPal)',
        category: 'domain',
        severity: 'CRITICAL',
        description: 'Domain contains reference to PayPal, but does not belong to official infrastructure.',
        technicalExplanation: "The domain pattern matches trademark 'PayPal' on an unauthorized apex host (paypal-security-verification.top).",
        scoreContribution: 35,
        evidence: 'Impersonated brand: PayPal'
      },
      {
        id: 'ind_vt_seed1',
        name: 'VirusTotal Flagged (10 Malicious Engines)',
        category: 'virustotal',
        severity: 'CRITICAL',
        description: '10 threat intelligence engines flagged this target as malicious.',
        technicalExplanation: 'Global threat feeds (Kaspersky, Sophos, Google Safe Browsing) categorized this URL as a live credential harvester.',
        scoreContribution: 40,
        evidence: '10 malicious / 2 suspicious engines'
      },
      {
        id: 'ind_tld_seed1',
        name: 'High-Risk Top-Level Domain (.top)',
        category: 'domain',
        severity: 'MEDIUM',
        description: 'The .top TLD is statistically correlated with disposable phishing campaigns.',
        technicalExplanation: 'High abuse rate registry with frequent automated domain churn.',
        scoreContribution: 15,
        evidence: 'TLD: .top'
      },
      {
        id: 'ind_hyphens_seed1',
        name: 'Multiple Hyphens in Domain Name',
        category: 'domain',
        severity: 'MEDIUM',
        description: 'Domain contains 3 hyphens used to string together deceptive brand and security words.',
        technicalExplanation: 'Hyphen chaining simulates legitimate corporate URLs.',
        scoreContribution: 12,
        evidence: 'Hyphen count: 3'
      },
      {
        id: 'ind_kw_seed1',
        name: 'Credential / Urgency Keywords Detected (auth, signin, verify, identity)',
        category: 'url',
        severity: 'HIGH',
        description: 'URL contains 4 security/auth keywords commonly targeted in phishing traps.',
        technicalExplanation: 'Designed to prompt victims into authenticating on a spoofed portal.',
        scoreContribution: 22,
        evidence: 'auth, signin, verify, identity'
      }
    ],
    domainHeuristics: {
      domain: 'paypal-security-verification.top',
      length: 32,
      subdomainCount: 0,
      subdomains: [],
      tld: 'top',
      isSuspiciousTld: true,
      isIpAddress: false,
      isPunycode: false,
      hyphenCount: 2,
      dotCount: 1,
      suspiciousCharacters: [],
      brandImpersonated: 'PayPal',
      lookalikeTarget: 'paypal',
      entropy: 3.42
    },
    urlHeuristics: {
      url: 'https://paypal-security-verification.top/auth/signin?session=verify-identity',
      length: 74,
      queryParamCount: 1,
      hasAtSymbol: false,
      hasEncodedChars: false,
      pathDepth: 2,
      suspiciousKeywords: ['auth', 'signin', 'verify', 'identity'],
      protocol: 'https:',
      isHttps: true,
      hasRedirectParam: false
    },
    virusTotal: {
      available: true,
      configured: false,
      malicious: 10,
      suspicious: 2,
      harmless: 68,
      undetected: 14,
      timeout: 0,
      totalEngines: 94,
      detectionRatio: '10 / 94 security engines flagged this URL',
      scanDate: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      reputation: -78,
      isDemo: true,
      message: 'DEMO DATA — Simulated VirusTotal threat intelligence'
    },
    recommendations: [
      'Do NOT enter any passwords, credentials, or personal identity details.',
      'Do NOT download, open, or execute any files or attachments from this link.',
      'Do NOT provide credit card, banking, or cryptocurrency wallet information.',
      'Verify the official domain independently via an external search engine or known bookmark.',
      'Report this incident and URL to your internal security operations / IT Helpdesk team.',
      'Block this domain at your perimeter firewall, DNS sinkhole, or secure web gateway.'
    ],
    scoreBreakdown: {
      vtScore: 100,
      urlHeuristicScore: 68,
      domainScore: 82,
      brandScore: 100,
      otherScore: 20
    },
    isDemo: true
  },
  {
    id: 'scan_seed_2',
    target: 'https://www.google.com',
    domain: 'google.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    type: 'URL',
    riskScore: 2,
    classification: 'SAFE',
    confidence: 0.98,
    indicators: [
      {
        id: 'ind_vt_seed2',
        name: 'VirusTotal Clean Reputation Record',
        category: 'virustotal',
        severity: 'SAFE',
        description: '89 security engines evaluated this destination as harmless.',
        technicalExplanation: 'Multiple authoritative threat intelligence providers verified this domain as clean.',
        scoreContribution: 0,
        evidence: '89 harmless evaluations'
      }
    ],
    domainHeuristics: {
      domain: 'google.com',
      length: 10,
      subdomainCount: 1,
      subdomains: ['www'],
      tld: 'com',
      isSuspiciousTld: false,
      isIpAddress: false,
      isPunycode: false,
      hyphenCount: 0,
      dotCount: 1,
      suspiciousCharacters: [],
      entropy: 2.12
    },
    urlHeuristics: {
      url: 'https://www.google.com',
      length: 22,
      queryParamCount: 0,
      hasAtSymbol: false,
      hasEncodedChars: false,
      pathDepth: 0,
      suspiciousKeywords: [],
      protocol: 'https:',
      isHttps: true,
      hasRedirectParam: false
    },
    virusTotal: {
      available: true,
      configured: false,
      malicious: 0,
      suspicious: 0,
      harmless: 89,
      undetected: 5,
      timeout: 0,
      totalEngines: 94,
      detectionRatio: '0 / 94 security engines flagged this URL',
      scanDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      reputation: 95,
      isDemo: true,
      message: 'DEMO DATA — Simulated clean VirusTotal response'
    },
    recommendations: [
      'No significant phishing indicators detected during automated analysis.',
      'Automated security scanners cannot guarantee absolute safety — stay vigilant.',
      'Always confirm that the browser shows a valid HTTPS padlock before submitting confidential information.'
    ],
    scoreBreakdown: {
      vtScore: 0,
      urlHeuristicScore: 0,
      domainScore: 0,
      brandScore: 0,
      otherScore: 0
    },
    isDemo: true
  },
  {
    id: 'scan_seed_3',
    type: 'EMAIL',
    target: 'URGENT: Action Required - Your PayPal Account Has Been Suspended',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    from: 'PayPal Security Team <security-alert@paypal-account-notice.example>',
    fromDomain: 'paypal-account-notice.example',
    replyTo: 'billing-recovery@dropbox-auth.xyz',
    replyToDomain: 'dropbox-auth.xyz',
    subject: 'URGENT: Action Required - Your PayPal Account Has Been Suspended',
    bodyExcerpt: 'Dear Customer, We detected unusual login attempts to your PayPal account from an unrecognized IP address. You must verify your credentials within 24 hours...',
    riskScore: 89,
    classification: 'CRITICAL',
    confidence: 0.95,
    senderAnalysis: {
      fromAddress: 'security-alert@paypal-account-notice.example',
      fromDomain: 'paypal-account-notice.example',
      replyToAddress: 'billing-recovery@dropbox-auth.xyz',
      replyToDomain: 'dropbox-auth.xyz',
      replyToMismatch: true,
      embeddedDomainMismatch: true,
      mismatchedDomains: ['paypal-security-verification.top'],
      spoofingRisk: 'CRITICAL'
    },
    extractedUrls: [
      {
        url: 'https://paypal-security-verification.top/auth/signin?session=verify-identity',
        domain: 'paypal-security-verification.top',
        heuristicScore: 92,
        classification: 'CRITICAL',
        indicatorsCount: 5,
        vtStatus: '10/94 engines'
      }
    ],
    indicators: [
      {
        id: 'ind_replyto_mismatch_seed',
        name: 'Reply-To Domain Mismatch Detected',
        category: 'mismatch',
        severity: 'HIGH',
        description: "Sender claims to be from 'paypal-account-notice.example', but responses route to 'dropbox-auth.xyz'.",
        technicalExplanation: 'Mismatched Reply-To headers are a hallmark of Business Email Compromise (BEC) and phishing lures.',
        scoreContribution: 30,
        evidence: 'From: paypal-account-notice.example vs Reply-To: dropbox-auth.xyz'
      },
      {
        id: 'ind_link_domain_mismatch_seed',
        name: 'Embedded Link Domain Mismatch',
        category: 'mismatch',
        severity: 'CRITICAL',
        description: 'Email displays sender brand, but hyperlinks direct to external untrusted infrastructure.',
        technicalExplanation: 'Phishing attacks route click-through traffic to external credential harvesting portals.',
        scoreContribution: 35,
        evidence: 'From: paypal-account-notice.example -> Links direct to: paypal-security-verification.top'
      },
      {
        id: 'ind_malicious_urls_in_email_seed',
        name: 'Suspicious URLs Detected in Body (1 Flag)',
        category: 'url',
        severity: 'CRITICAL',
        description: 'The email body contains 1 destination link exhibiting phishing heuristics.',
        technicalExplanation: 'Extracted link points to an unauthorized PayPal brand lookalike with .top TLD.',
        scoreContribution: 35,
        evidence: '1 high-risk URL'
      },
      {
        id: 'ind_urgency_seed',
        name: 'High Urgency / Coercive Language',
        category: 'content',
        severity: 'HIGH',
        description: 'The email uses artificial time pressure (within 24 hours) and threats of account suspension.',
        technicalExplanation: 'Social engineering psychological triggers bypass victim critical thinking.',
        scoreContribution: 20,
        evidence: 'urgent, action required, suspended, within 24 hours'
      },
      {
        id: 'ind_credential_seed',
        name: 'Direct Credential or Password Request',
        category: 'content',
        severity: 'HIGH',
        description: 'The message solicits login credentials, password verification, and identity re-authentication.',
        technicalExplanation: 'Credential harvesting mechanism paired with artificial urgency.',
        scoreContribution: 25,
        evidence: 'verify your credentials, confirm your bank account'
      }
    ],
    keywordsDetected: ['urgent', 'action required', 'suspended', 'verify credentials', 'within 24 hours'],
    hasUrgencyLanguage: true,
    hasCredentialRequests: true,
    hasFinancialRequests: true,
    hasAttachmentReferences: false,
    recommendations: [
      'Do NOT click any links or buttons inside this email message.',
      'Do NOT reply to this message or send sensitive corporate or personal details.',
      'Mark this email as Phishing / Junk in your email client.',
      'Report the sender address and headers to your SOC / Information Security team.',
      'If you already clicked the link, immediately change your PayPal password on the official website and enable 2FA.'
    ],
    scoreBreakdown: {
      senderReputationScore: 85,
      urlThreatScore: 92,
      urgencyLanguageScore: 80,
      credentialRequestScore: 75,
      financialRequestScore: 60
    },
    isDemo: true
  },
  {
    id: 'scan_seed_4',
    target: 'https://secure-login-example.com/account/verify?token=89437&ref=portal',
    domain: 'secure-login-example.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    type: 'URL',
    riskScore: 58,
    classification: 'MEDIUM_RISK',
    confidence: 0.88,
    indicators: [
      {
        id: 'ind_vt_seed4',
        name: 'VirusTotal Flagged (4 Suspicious/Malicious Engines)',
        category: 'virustotal',
        severity: 'MEDIUM',
        description: '4 threat intelligence engines flagged this target as suspicious.',
        technicalExplanation: 'Heuristic engines on VirusTotal flagged potential credential harvesting patterns.',
        scoreContribution: 20,
        evidence: '1 malicious / 3 suspicious engines'
      },
      {
        id: 'ind_hyphens_seed4',
        name: 'Multiple Hyphens in Domain Name',
        category: 'domain',
        severity: 'MEDIUM',
        description: 'Domain contains 2 hyphens simulating an official login service.',
        technicalExplanation: 'Deceptive stringing of auth keywords.',
        scoreContribution: 10,
        evidence: 'secure-login-example.com'
      },
      {
        id: 'ind_kw_seed4',
        name: 'Credential / Urgency Keywords Detected (login, account, verify)',
        category: 'url',
        severity: 'MEDIUM',
        description: 'URL contains 3 security/auth keywords.',
        technicalExplanation: 'Commonly seen in credential harvesting URLs.',
        scoreContribution: 14,
        evidence: 'login, account, verify'
      }
    ],
    domainHeuristics: {
      domain: 'secure-login-example.com',
      length: 24,
      subdomainCount: 0,
      subdomains: [],
      tld: 'com',
      isSuspiciousTld: false,
      isIpAddress: false,
      isPunycode: false,
      hyphenCount: 2,
      dotCount: 1,
      suspiciousCharacters: [],
      entropy: 3.1
    },
    urlHeuristics: {
      url: 'https://secure-login-example.com/account/verify?token=89437&ref=portal',
      length: 68,
      queryParamCount: 2,
      hasAtSymbol: false,
      hasEncodedChars: false,
      pathDepth: 2,
      suspiciousKeywords: ['login', 'account', 'verify'],
      protocol: 'https:',
      isHttps: true,
      hasRedirectParam: false
    },
    virusTotal: {
      available: true,
      configured: false,
      malicious: 1,
      suspicious: 3,
      harmless: 72,
      undetected: 18,
      timeout: 0,
      totalEngines: 94,
      detectionRatio: '4 / 94 security engines flagged this URL',
      scanDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      reputation: -15,
      isDemo: true,
      message: 'DEMO DATA — Simulated suspicious intelligence'
    },
    recommendations: [
      'Exercise caution before interacting with this web page.',
      'Verify the address bar carefully to ensure the domain matches the expected service.',
      'Avoid providing sensitive corporate or financial data without independent verification.',
      'Inspect the SSL/TLS certificate details in your browser address bar.'
    ],
    scoreBreakdown: {
      vtScore: 50,
      urlHeuristicScore: 54,
      domainScore: 40,
      brandScore: 0,
      otherScore: 10
    },
    isDemo: true
  }
];

export function getMockDashboardStats(scans: ScanResult[]): DashboardStats {
  const total = scans.length;
  const critical = scans.filter(s => s.classification === 'CRITICAL').length;
  const high = scans.filter(s => s.classification === 'HIGH_RISK').length;
  const medium = scans.filter(s => s.classification === 'MEDIUM_RISK').length;
  const low = scans.filter(s => s.classification === 'LOW_RISK').length;
  const safe = scans.filter(s => s.classification === 'SAFE').length;

  const threatsDetected = critical + high + medium;

  return {
    totalScans: total,
    threatsDetected,
    safeScans: safe + low,
    highRiskScans: high,
    criticalScans: critical,
    threatDistribution: [
      { name: 'Critical', value: critical || 1, color: '#EF4444' },
      { name: 'High Risk', value: high || 1, color: '#F97316' },
      { name: 'Medium Risk', value: medium || 2, color: '#F59E0B' },
      { name: 'Low Risk', value: low || 1, color: '#38BDF8' },
      { name: 'Safe', value: safe || 3, color: '#10B981' }
    ],
    scanActivity: [
      { date: '10:00 AM', scans: 14, threats: 4 },
      { date: '11:00 AM', scans: 22, threats: 7 },
      { date: '12:00 PM', scans: 35, threats: 11 },
      { date: '01:00 PM', scans: 28, threats: 8 },
      { date: '02:00 PM', scans: 41, threats: 14 },
      { date: '03:00 PM', scans: 31, threats: 9 },
      { date: '04:00 PM', scans: 18, threats: 5 }
    ],
    detectionSources: [
      { source: 'VirusTotal API', detections: 24 },
      { source: 'URL Heuristics', detections: 31 },
      { source: 'Domain Analysis', detections: 28 },
      { source: 'Email Mismatch', detections: 19 },
      { source: 'Social Engineering', detections: 15 }
    ],
    recentScans: scans.slice(0, 10)
  };
}

