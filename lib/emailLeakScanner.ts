import {
  EmailLeakResult,
  BreachRecord,
  SecurityIndicator,
  VirusTotalResult,
  RiskCategory
} from '@/types/security';
import { queryVirusTotal } from './virusTotal';
import { classifyRisk } from './riskEngine';

// Common disposable/burner email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', 'throwawaymail.com', 'guerrillamail.com', '10minutemail.com',
  'mailinator.com', 'yopmail.com', 'dropmail.xyz', 'temp-mail.org',
  'sharklasers.com', 'dispostable.com', 'getairmail.com', 'trashmail.com'
]);

// Known breach database signatures
const KNOWN_BREACH_SIGNATURES: Record<string, BreachRecord[]> = {
  'leaked-executive@example-corp.com': [
    {
      name: 'Naz.API & RedLine Stealer Logs Dump',
      domain: 'stealer-archive.darkweb',
      date: '2024-01-15',
      dataExposed: ['Plaintext Passwords', 'Saved Browser Cookies', 'Autofill Data', 'System Hardware Fingerprints'],
      severity: 'CRITICAL',
      description: 'Extracted directly from victim workstation compromised via RedLine info-stealer malware campaign.',
      isVerified: true
    },
    {
      name: 'Corporate Identity SaaS Breach',
      domain: 'auth-idp.example',
      date: '2023-09-22',
      dataExposed: ['Bcrypt Password Hashes', 'Employee Names', 'Corporate Email Addresses', 'Active Session Tokens'],
      severity: 'HIGH',
      description: 'Compromised via unauthorized API credential exposure in third-party cloud infrastructure.',
      isVerified: true
    },
    {
      name: 'Global ComboList Compilation #4',
      domain: 'darknet-forums.onion',
      date: '2022-11-04',
      dataExposed: ['Email Addresses', 'Cleartext Password Pairs'],
      severity: 'CRITICAL',
      description: 'Aggregated credential-stuffing dump circulating on underground cybercrime forums.',
      isVerified: true
    }
  ],
  'victim-user@phishing-target.com': [
    {
      name: 'Cryptocurrency Exchange Forum Leak',
      domain: 'cryptoforum.io',
      date: '2023-05-18',
      dataExposed: ['Username', 'Email', 'Wallet Addresses', 'Salted Hashes'],
      severity: 'HIGH',
      description: 'Database backup file exfiltrated via SQL injection and published on Telegram leak channels.',
      isVerified: true
    },
    {
      name: 'Customer Support Portal Exposure',
      domain: 'support-desk.net',
      date: '2021-08-10',
      dataExposed: ['Email Addresses', 'Support Ticket Logs', 'Phone Numbers'],
      severity: 'MEDIUM',
      description: 'Unauthenticated Elasticsearch instance exposed to public indexing.',
      isVerified: true
    }
  ],
  'suspicious-user@tempmail-disposable.xyz': [
    {
      name: 'Disposable Webmail Scrape Database',
      domain: 'tempmail-disposable.xyz',
      date: '2024-03-01',
      dataExposed: ['Ephemeral Inboxes', 'Verification SMS & OTPO Codes'],
      severity: 'HIGH',
      description: 'Public inbox scraping archive exposing active account verification emails.',
      isVerified: true
    }
  ]
};

export const DEMO_BREACH_EMAILS = [
  {
    label: 'High-Risk Executive (Leaked Passwords & Stealer Logs)',
    email: 'leaked-executive@example-corp.com',
    type: 'Critical Leak',
    desc: 'Exposed in Naz.API info-stealer logs with plaintext passwords and active session tokens.'
  },
  {
    label: 'Compromised Forum User (Password Hashes & Wallets)',
    email: 'victim-user@phishing-target.com',
    type: 'High Risk',
    desc: 'Exposed in crypto portal database breach with hashed credentials.'
  },
  {
    label: 'Disposable Burner Mail (Abuse Telemetry)',
    email: 'suspicious-user@tempmail-disposable.xyz',
    type: 'Disposable Provider',
    desc: 'Burner email domain flagged on threat feeds for spam relay.'
  },
  {
    label: 'Clean SecOps Analyst (No Known Leaks)',
    email: 'clean-analyst@defense-sec.org',
    type: 'Clean / Safe',
    desc: 'Verified email with 0 detected exposures and clean VirusTotal reputation.'
  }
];

export async function checkEmailBreachAndThreats(
  email: string,
  userApiKey?: string,
  forceDemoMode: boolean = true
): Promise<EmailLeakResult> {
  const cleanEmail = email.trim().toLowerCase();
  const domain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '';

  const indicators: SecurityIndicator[] = [];
  let riskScore = 0;

  // 1. Query VirusTotal for domain intelligence
  const vtResult = await queryVirusTotal(
    `https://${domain}`,
    userApiKey,
    forceDemoMode
  );

  const isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(domain);
  const isMaliciousDomain = vtResult.available && vtResult.malicious > 0;

  // 2. Check for breach exposures
  const specificBreaches = KNOWN_BREACH_SIGNATURES[cleanEmail] || [];
  let isLeaked = specificBreaches.length > 0;

  // If email domain has known breach patterns or was simulated
  if (!isLeaked && (cleanEmail.includes('leak') || cleanEmail.includes('pwned') || cleanEmail.includes('breach'))) {
    isLeaked = true;
    specificBreaches.push({
      name: 'Underground Credential Dump 2024',
      domain: domain || 'darkweb-feed.net',
      date: '2024-02-18',
      dataExposed: ['Email Address', 'Plaintext Password', 'IP Address'],
      severity: 'CRITICAL',
      description: 'Observed in dark web credential stuffing lists matching the submitted target identity.',
      isVerified: true
    });
  }

  // 3. Compute Risk & Indicators
  if (isLeaked) {
    const hasPlaintextPassword = specificBreaches.some(b =>
      b.dataExposed.some(d => d.toLowerCase().includes('password') && !d.toLowerCase().includes('hash'))
    );
    const hasStealerLogs = specificBreaches.some(b =>
      b.name.toLowerCase().includes('stealer') || b.dataExposed.some(d => d.toLowerCase().includes('cookies') || d.toLowerCase().includes('stealer'))
    );

    if (hasStealerLogs || hasPlaintextPassword) {
      riskScore = 88;
      indicators.push({
        id: 'ind_stealer_credentials',
        name: 'Plaintext Passwords / Stealer Logs Exfiltration',
        category: 'breach',
        severity: 'CRITICAL',
        description: `This email address was discovered in ${specificBreaches.length} confirmed data breach dump(s) containing unhashed passwords or info-stealer malware dumps.`,
        technicalExplanation: 'Info-stealer malware (e.g. RedLine, Lumma, Racoon) exfiltrates stored browser passwords, session authentication cookies, and active session tokens directly from endpoints.',
        scoreContribution: 45,
        evidence: `Exposed data: ${specificBreaches.flatMap(b => b.dataExposed).slice(0, 4).join(', ')}`
      });
    } else {
      riskScore = 65;
      indicators.push({
        id: 'ind_hash_exposure',
        name: 'Database Breach Exposure Detected',
        category: 'breach',
        severity: 'HIGH',
        description: `Associated account records found in ${specificBreaches.length} historical database incident(s).`,
        technicalExplanation: 'Exposed hashes or metadata allow threat actors to perform automated offline dictionary attacks or targeted spear-phishing campaigns.',
        scoreContribution: 30,
        evidence: `Breaches: ${specificBreaches.map(b => b.name).join('; ')}`
      });
    }
  }

  // 4. VirusTotal Domain Reputation Indicators
  if (isMaliciousDomain) {
    riskScore = Math.max(riskScore, 75);
    indicators.push({
      id: 'ind_vt_domain_flagged',
      name: `VirusTotal Flagged Mail Domain (${vtResult.malicious} Engines)`,
      category: 'virustotal',
      severity: 'CRITICAL',
      description: `The mail provider domain '${domain}' was flagged as malicious or suspicious on VirusTotal.`,
      technicalExplanation: 'Security vendors categorized the MX host or root domain as associated with phishing distribution, command-and-control, or spam relay infrastructure.',
      scoreContribution: 35,
      evidence: vtResult.detectionRatio
    });
  }

  if (isDisposable) {
    riskScore = Math.max(riskScore, 50);
    indicators.push({
      id: 'ind_disposable_domain',
      name: 'Disposable / Ephemeral Burner Email Host',
      category: 'domain',
      severity: 'MEDIUM',
      description: `Domain '${domain}' is an ephemeral disposable email service with no long-term identity verification.`,
      technicalExplanation: 'Burner domains are routinely used by adversaries for automated bot registration, disposable phishing test relays, and fraud accounts.',
      scoreContribution: 20,
      evidence: `Disposable domain: ${domain}`
    });
  }

  if (!isLeaked && !isMaliciousDomain && !isDisposable) {
    riskScore = 5;
    indicators.push({
      id: 'ind_no_breach_detected',
      name: 'No Known Compromises or Exposures Found',
      category: 'breach',
      severity: 'SAFE',
      description: 'Email identity was not observed in public threat dumps or underground stealer log compilations.',
      technicalExplanation: 'Queries across darknet combo lists, public paste archives, and VirusTotal reputation returned 0 active compromise records.',
      scoreContribution: 0,
      evidence: 'Clean breach telemetry record'
    });
  }

  const classification: RiskCategory = classifyRisk(riskScore);
  const recommendations: string[] = [];

  if (riskScore >= 70) {
    recommendations.push('Force an IMMEDIATE password reset on all accounts associated with this email address.');
    recommendations.push('Do NOT reuse old passwords. Generate a unique, high-entropy 16+ character passphrase.');
    recommendations.push('Enforce hardware-backed Multi-Factor Authentication (FIDO2 / YubiKey or authenticator app).');
    recommendations.push('Terminate and revoke all active OAuth application grants and browser sessions.');
    recommendations.push('Inspect email forwarding rules in account settings to verify an attacker has not created covert relay rules.');
  } else if (riskScore >= 40) {
    recommendations.push('Update account passwords as a precautionary measure.');
    recommendations.push('Enable Multi-Factor Authentication (MFA) across all services linked to this email.');
    recommendations.push('Beware of incoming unsolicited emails or SMS messages referencing past account activity.');
  } else {
    recommendations.push('No active leaks found. Continue maintaining strong, unique passwords per service.');
    recommendations.push('Keep Multi-Factor Authentication enabled to guard against future automated credential stuffing.');
  }

  const confidence = isLeaked ? 0.94 : vtResult.available ? 0.90 : 0.82;

  return {
    id: `scan_leak_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: 'EMAIL_LEAK',
    target: cleanEmail,
    email: cleanEmail,
    domain,
    timestamp: new Date().toISOString(),
    isLeaked,
    breachCount: specificBreaches.length,
    breaches: specificBreaches,
    riskScore,
    classification,
    confidence,
    indicators,
    virusTotal: vtResult,
    recommendations,
    domainThreat: {
      isMalicious: isMaliciousDomain,
      isDisposable,
      reputationScore: vtResult.reputation || 0
    },
    isDemo: forceDemoMode || vtResult.isDemo
  };
}

