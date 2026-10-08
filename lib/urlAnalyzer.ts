import { DomainHeuristics, SecurityIndicator, UrlHeuristics, SeverityLevel } from '@/types/security';

const SUSPICIOUS_TLDS = new Set([
  'top', 'xyz', 'work', 'buzz', 'icu', 'cam', 'monster', 'rest', 'live', 'sbs',
  'click', 'fit', 'gq', 'cf', 'ga', 'ml', 'tk', 'support', 'accountant', 'date',
  'faith', 'racing', 'loan', 'review', 'stream', 'download', 'win', 'bid'
]);

const POPULAR_BRANDS = [
  { name: 'PayPal', patterns: ['paypal', 'paypa1', 'pay-pal', 'paypol', 'paypaI'] },
  { name: 'Microsoft', patterns: ['microsoft', 'micros0ft', 'office365', 'outlook', 'live-login', 'ms-login', 'onedrive'] },
  { name: 'Google', patterns: ['google', 'g00gle', 'gmail', 'google-drive', 'google-verify'] },
  { name: 'Apple', patterns: ['apple', 'appl-id', 'appleid', 'icloud-verify', 'icloud'] },
  { name: 'Amazon', patterns: ['amazon', 'amaz0n', 'amz-security', 'aws-verify'] },
  { name: 'Netflix', patterns: ['netflix', 'netfIix', 'net-flix'] },
  { name: 'Chase Bank', patterns: ['chase', 'chase-security', 'chase-bank'] },
  { name: 'Wells Fargo', patterns: ['wellsfargo', 'wells-fargo'] },
  { name: 'Bank of America', patterns: ['bankofamerica', 'bofa'] },
  { name: 'Meta / Facebook', patterns: ['facebook', 'faceb00k', 'instagram', 'meta-support', 'whatsapp'] },
  { name: 'Binance', patterns: ['binance', 'binan-ce', 'binance-auth'] },
  { name: 'Coinbase', patterns: ['coinbase', 'c0inbase', 'coin-base'] },
  { name: 'MetaMask', patterns: ['metamask', 'meta-mask'] },
  { name: 'DHL / FedEx', patterns: ['dhl-delivery', 'dhl-tracking', 'fedex-tracking', 'fedex-delivery'] },
  { name: 'Adobe', patterns: ['adobe', 'ad0be', 'adobe-document'] }
];

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'verification', 'account', 'secure', 'security',
  'update', 'password', 'signin', 'wallet', 'payment', 'invoice',
  'refund', 'bank', 'confirm', 'unlock', 'suspended', 'urgent',
  'authenticate', 're-verify', 'recover', 'billing', 'support',
  'session', 'validate', 'portal', 'alert', 'identity'
];

const OPEN_REDIRECT_PARAMS = [
  'redirect', 'redirect_to', 'redirect_uri', 'url', 'next', 'return',
  'return_to', 'return_url', 'target', 'dest', 'destination', 'link', 'goto'
];

/**
 * Calculates Shannon entropy of a string (measures randomness/disorder)
 */
function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const frequencies = new Map<string, number>();
  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }
  let entropy = 0;
  const len = str.length;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

/**
 * Checks if string is an IPv4 or IPv6 address
 */
function isIp(host: string): boolean {
  // IPv4 regex (including port exclusion)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(host)) {
    const parts = host.split('.').map(Number);
    return parts.every(p => p >= 0 && p <= 255);
  }
  // Basic IPv6 check
  return host.includes(':') && /^[0-9a-fA-F:]+$/.test(host);
}

/**
 * Normalizes input string to a valid URL object
 */
export function normalizeUrl(input: string): { url: URL; normalized: string } {
  let cleanInput = input.trim();
  // Strip enclosing quotes or angle brackets
  cleanInput = cleanInput.replace(/^[<"']+|[>"']+$/g, '');

  if (!/^https?:\/\//i.test(cleanInput)) {
    cleanInput = 'https://' + cleanInput;
  }

  const parsed = new URL(cleanInput);
  return {
    url: parsed,
    normalized: parsed.toString()
  };
}

/**
 * Analyzes domain heuristics and returns metrics and indicators
 */
export function analyzeDomainHeuristics(urlObj: URL): {
  heuristics: DomainHeuristics;
  indicators: SecurityIndicator[];
  score: number;
} {
  const indicators: SecurityIndicator[] = [];
  const hostname = urlObj.hostname.toLowerCase();
  const domainParts = hostname.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
  const subdomains = domainParts.length > 2 ? domainParts.slice(0, -2) : [];
  const mainDomain = domainParts.length >= 2 ? domainParts.slice(-2).join('.') : hostname;

  const isIpAddress = isIp(hostname);
  const isPunycode = hostname.includes('xn--') || /[^\u0000-\u007F]/.test(hostname);
  const isSuspiciousTld = SUSPICIOUS_TLDS.has(tld);
  const hyphenCount = (hostname.match(/-/g) || []).length;
  const dotCount = (hostname.match(/\./g) || []).length;
  const entropy = calculateShannonEntropy(hostname.replace(/\./g, ''));

  const suspiciousChars: string[] = [];
  if (hostname.includes('_')) suspiciousChars.push('Underscore in domain');
  if (hostname.includes('%')) suspiciousChars.push('URL-encoded characters in hostname');
  if (isPunycode) suspiciousChars.push('Punycode / IDN internationalized script');

  // Brand impersonation detection
  let brandImpersonated: string | undefined;
  let lookalikeTarget: string | undefined;

  for (const brand of POPULAR_BRANDS) {
    for (const pattern of brand.patterns) {
      if (hostname.includes(pattern)) {
        // Check if it's the legitimate brand domain (e.g. google.com, paypal.com)
        const isLegitDomain = hostname === `${pattern}.com` ||
          hostname.endsWith(`.${pattern}.com`) ||
          hostname === `${brand.name.toLowerCase().replace(/\s+/g, '')}.com` ||
          hostname.endsWith(`.${brand.name.toLowerCase().replace(/\s+/g, '')}.com`);

        if (!isLegitDomain) {
          brandImpersonated = brand.name;
          lookalikeTarget = pattern;
          break;
        }
      }
    }
    if (brandImpersonated) break;
  }

  let domainRiskScore = 0;

  // 1. IP Address Host indicator
  if (isIpAddress) {
    indicators.push({
      id: 'ind_ip_host',
      name: 'Direct IP Address Used As Hostname',
      category: 'domain',
      severity: 'HIGH',
      description: 'The URL connects directly to an IP address instead of a registered domain name.',
      technicalExplanation: 'Legitimate services use registered domains with SSL certificates. Direct IP addresses are frequently used in phishing kits to bypass domain reputation scanners and fast-flux DNS monitoring.',
      scoreContribution: 25,
      evidence: `Host: ${hostname}`
    });
    domainRiskScore += 25;
  }

  // 2. Punycode / IDN Homograph Attack
  if (isPunycode) {
    indicators.push({
      id: 'ind_punycode',
      name: 'Punycode / IDN Homograph Detected',
      category: 'domain',
      severity: 'CRITICAL',
      description: 'Domain uses Punycode (xn--) or non-ASCII characters that visually mimic legitimate Latin characters.',
      technicalExplanation: 'IDN Homograph attacks register domains with Cyrillic or Greek glyphs that look identical to ASCII characters (e.g., Cyrillic "а" instead of Latin "a") to deceive human inspection.',
      scoreContribution: 30,
      evidence: `Punycode domain: ${hostname}`
    });
    domainRiskScore += 30;
  }

  // 3. Brand Impersonation
  if (brandImpersonated) {
    indicators.push({
      id: 'ind_brand_impersonation',
      name: `Brand Impersonation (${brandImpersonated})`,
      category: 'domain',
      severity: 'CRITICAL',
      description: `Domain contains reference to ${brandImpersonated}, but does not belong to official infrastructure.`,
      technicalExplanation: `The domain pattern matches trademark '${brandImpersonated}' on an unauthorized apex host (${mainDomain}). Phishing actors commonly nest recognized brand names within subdomains or hyphenated strings.`,
      scoreContribution: 35,
      evidence: `Impersonated token: "${lookalikeTarget}" on domain: ${hostname}`
    });
    domainRiskScore += 35;
  }

  // 4. Excessive Subdomains
  if (subdomains.length >= 3) {
    indicators.push({
      id: 'ind_excessive_subdomains',
      name: 'Excessive Subdomain Nesting',
      category: 'domain',
      severity: subdomains.length >= 4 ? 'HIGH' : 'MEDIUM',
      description: `The URL contains ${subdomains.length} subdomains, which is typical for phishing obfuscation.`,
      technicalExplanation: 'Attackers create long chains of subdomains (e.g., login.security.verify.evil.com) to push the actual deceptive destination domain out of view on mobile or truncated browser address bars.',
      scoreContribution: subdomains.length >= 4 ? 20 : 12,
      evidence: `Subdomains: ${subdomains.join('.')}`
    });
    domainRiskScore += subdomains.length >= 4 ? 20 : 12;
  }

  // 5. Suspicious TLD
  if (isSuspiciousTld) {
    indicators.push({
      id: 'ind_suspicious_tld',
      name: `High-Risk Top-Level Domain (.${tld})`,
      category: 'domain',
      severity: 'MEDIUM',
      description: `The .${tld} TLD is statistically correlated with disposable, low-cost phishing campaigns.`,
      technicalExplanation: 'Certain free or ultra-low-cost TLD registries have minimal fraud verification, leading to high abuse rates in automated spam and phishing distribution feeds.',
      scoreContribution: 15,
      evidence: `TLD: .${tld}`
    });
    domainRiskScore += 15;
  }

  // 6. Excessive Hyphens
  if (hyphenCount >= 3) {
    indicators.push({
      id: 'ind_excessive_hyphens',
      name: 'Multiple Hyphens in Domain Name',
      category: 'domain',
      severity: hyphenCount >= 4 ? 'HIGH' : 'MEDIUM',
      description: `Domain contains ${hyphenCount} hyphens, often used to string together deceptive words.`,
      technicalExplanation: 'Legitimate commercial domains rarely contain more than 1 or 2 hyphens. Phishers use multi-hyphen strings (e.g. secure-login-account-update-portal) to simulate security notices.',
      scoreContribution: hyphenCount >= 4 ? 18 : 10,
      evidence: `Hyphen count: ${hyphenCount}`
    });
    domainRiskScore += hyphenCount >= 4 ? 18 : 10;
  }

  // 7. High Entropy (DGA or randomized subdomain)
  if (entropy > 3.8 && hostname.length > 14 && !isIpAddress) {
    indicators.push({
      id: 'ind_high_entropy',
      name: 'High Domain Name Entropy (Randomized)',
      category: 'domain',
      severity: 'MEDIUM',
      description: 'The domain name exhibits statistical randomness characteristic of automated generation.',
      technicalExplanation: `Calculated Shannon entropy is ${entropy} (threshold: 3.8). High entropy indicates potential Domain Generation Algorithms (DGA) or disposable dynamic DNS hosts.`,
      scoreContribution: 12,
      evidence: `Shannon Entropy: ${entropy}`
    });
    domainRiskScore += 12;
  }

  // 8. Long Domain Length
  if (hostname.length > 40) {
    indicators.push({
      id: 'ind_domain_length',
      name: 'Abnormally Long Hostname',
      category: 'domain',
      severity: 'LOW',
      description: `Hostname is ${hostname.length} characters long.`,
      technicalExplanation: 'Long domains are frequently used to deceive users on smaller screens or embed multiple misleading security keywords.',
      scoreContribution: 8,
      evidence: `Length: ${hostname.length} characters`
    });
    domainRiskScore += 8;
  }

  return {
    heuristics: {
      domain: hostname,
      length: hostname.length,
      subdomainCount: subdomains.length,
      subdomains,
      tld,
      isSuspiciousTld,
      isIpAddress,
      isPunycode,
      hyphenCount,
      dotCount,
      suspiciousCharacters: suspiciousChars,
      brandImpersonated,
      lookalikeTarget,
      entropy
    },
    indicators,
    score: Math.min(domainRiskScore, 100)
  };
}

/**
 * Analyzes URL path, query params, scheme and structure heuristics
 */
export function analyzeUrlHeuristics(urlObj: URL): {
  heuristics: UrlHeuristics;
  indicators: SecurityIndicator[];
  score: number;
} {
  const indicators: SecurityIndicator[] = [];
  const fullUrl = urlObj.toString();
  const pathname = urlObj.pathname.toLowerCase();
  const search = urlObj.search.toLowerCase();
  const searchParams = urlObj.searchParams;

  const hasAtSymbol = urlObj.username !== '' || fullUrl.includes('@');
  const hasEncodedChars = /%[0-9a-fA-F]{2}/.test(fullUrl);
  const pathSegments = pathname.split('/').filter(p => p.length > 0);
  const pathDepth = pathSegments.length;
  const isHttps = urlObj.protocol === 'https:';

  // Suspicious keywords scan
  const matchedKeywords: string[] = [];
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (pathname.includes(kw) || search.includes(kw) || urlObj.hash.toLowerCase().includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  // Open redirect parameter check
  let hasRedirectParam = false;
  for (const param of OPEN_REDIRECT_PARAMS) {
    if (searchParams.has(param)) {
      hasRedirectParam = true;
      break;
    }
  }

  let urlRiskScore = 0;

  // 1. Insecure HTTP protocol
  if (!isHttps) {
    indicators.push({
      id: 'ind_insecure_http',
      name: 'Unencrypted HTTP Connection',
      category: 'url',
      severity: 'MEDIUM',
      description: 'The target URL uses cleartext HTTP instead of secure TLS/HTTPS.',
      technicalExplanation: 'Unencrypted connections expose credentials to interception (MitM attacks). Any login or verification prompt transmitted over HTTP is fundamentally unsafe.',
      scoreContribution: 15,
      evidence: `Protocol: ${urlObj.protocol}`
    });
    urlRiskScore += 15;
  }

  // 2. Embedded '@' symbol in URL
  if (hasAtSymbol) {
    indicators.push({
      id: 'ind_at_symbol',
      name: 'Deceptive Authentication "@" Symbol in URL',
      category: 'url',
      severity: 'CRITICAL',
      description: 'The URL uses the "@" character in the authority portion.',
      technicalExplanation: 'RFC 3986 specifies that text preceding "@" represents userinfo. Browsers will discard everything before "@" and route the request to the host immediately following it (e.g., https://paypal.com@evil-site.com routes to evil-site.com).',
      scoreContribution: 30,
      evidence: `URL contains authority separator '@'`
    });
    urlRiskScore += 30;
  }

  // 3. Credential Harvesting Keywords
  if (matchedKeywords.length >= 2) {
    const sev: SeverityLevel = matchedKeywords.length >= 4 ? 'HIGH' : 'MEDIUM';
    const contrib = matchedKeywords.length >= 4 ? 22 : 14;
    indicators.push({
      id: 'ind_suspicious_keywords',
      name: `Credential / Urgency Keywords Detected (${matchedKeywords.slice(0, 5).join(', ')})`,
      category: 'url',
      severity: sev,
      description: `URL contains ${matchedKeywords.length} security/auth keywords commonly targeted in phishing traps.`,
      technicalExplanation: `The path or query string contains terms (${matchedKeywords.join(', ')}) aimed at convincing users to provide credentials or verify compromised accounts.`,
      scoreContribution: contrib,
      evidence: `Keywords: ${matchedKeywords.join(', ')}`
    });
    urlRiskScore += contrib;
  } else if (matchedKeywords.length === 1) {
    indicators.push({
      id: 'ind_single_keyword',
      name: `Authentication Keyword in Path (${matchedKeywords[0]})`,
      category: 'url',
      severity: 'LOW',
      description: `URL path mentions '${matchedKeywords[0]}'. Evaluated in combination with host reputation.`,
      technicalExplanation: 'Legitimate login URLs also contain authentication terms, so this is treated as a low-weight corroborating signal.',
      scoreContribution: 5,
      evidence: `Keyword: ${matchedKeywords[0]}`
    });
    urlRiskScore += 5;
  }

  // 4. Excessive Query Parameters
  const paramCount = Array.from(searchParams.keys()).length;
  if (paramCount >= 5) {
    indicators.push({
      id: 'ind_excessive_params',
      name: 'High Query Parameter Complexity',
      category: 'url',
      severity: 'MEDIUM',
      description: `The URL passes ${paramCount} query parameters, frequently used to track phishing campaign targets.`,
      technicalExplanation: 'Phishing kits commonly pass victim email addresses, campaign tracking hashes, and redirect tokens in extensive query strings to customize the spoofed landing page.',
      scoreContribution: 12,
      evidence: `Query params count: ${paramCount}`
    });
    urlRiskScore += 12;
  }

  // 5. Open Redirect Vulnerability Pattern
  if (hasRedirectParam) {
    indicators.push({
      id: 'ind_open_redirect',
      name: 'Suspected Open Redirect Parameter',
      category: 'url',
      severity: 'HIGH',
      description: 'The URL includes a redirection query parameter that may bounce users to an external rogue host.',
      technicalExplanation: 'Attackers abuse open redirect parameters on trusted websites to deliver victims to malicious landing pages while displaying a trustworthy domain in email previews.',
      scoreContribution: 18,
      evidence: `Redirection parameter present in query string`
    });
    urlRiskScore += 18;
  }

  // 6. Excessive Path Depth
  if (pathDepth >= 5) {
    indicators.push({
      id: 'ind_excessive_path_depth',
      name: 'Deep Nested Path Structure',
      category: 'url',
      severity: 'LOW',
      description: `Path depth is ${pathDepth} segments, often concealing directory index files.`,
      technicalExplanation: 'Deeply nested paths are characteristic of compromised WordPress or CMS sites where phishing kits are uploaded into deeply nested plugin/upload folders.',
      scoreContribution: 8,
      evidence: `Path depth: ${pathDepth}`
    });
    urlRiskScore += 8;
  }

  // 7. Excessive URL Length
  if (fullUrl.length > 100) {
    indicators.push({
      id: 'ind_url_length',
      name: 'Abnormally Long URL Length',
      category: 'url',
      severity: fullUrl.length > 200 ? 'MEDIUM' : 'LOW',
      description: `Full URL is ${fullUrl.length} characters long.`,
      technicalExplanation: 'Excessively long URLs are routinely crafted to conceal suspicious hostnames or encode victim identification payloads.',
      scoreContribution: fullUrl.length > 200 ? 12 : 6,
      evidence: `Length: ${fullUrl.length} characters`
    });
    urlRiskScore += fullUrl.length > 200 ? 12 : 6;
  }

  // 8. Obfuscated / Encoded Characters
  if (hasEncodedChars && (fullUrl.match(/%2e/gi) || fullUrl.match(/%2f/gi) || fullUrl.match(/%40/gi))) {
    indicators.push({
      id: 'ind_encoded_evasion',
      name: 'Suspicious Hex-Encoded Path Delimiters',
      category: 'url',
      severity: 'HIGH',
      description: 'URL contains encoded dot (%2e), slash (%2f), or at-sign (%40) characters.',
      technicalExplanation: 'Encoding path delimiters or domain separators is a classic evasion technique to bypass web application firewalls and naive URL filter rules.',
      scoreContribution: 20,
      evidence: 'Detected encoded characters %2e, %2f, or %40'
    });
    urlRiskScore += 20;
  }

  return {
    heuristics: {
      url: fullUrl,
      length: fullUrl.length,
      queryParamCount: paramCount,
      hasAtSymbol,
      hasEncodedChars,
      pathDepth,
      suspiciousKeywords: matchedKeywords,
      protocol: urlObj.protocol,
      isHttps,
      port: urlObj.port || undefined,
      hasRedirectParam
    },
    indicators,
    score: Math.min(urlRiskScore, 100)
  };
}

