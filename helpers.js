// helpers.js — pure helpers: email validation, escaping, mailbox provider + inbox.

// Pragmatic email check (not full RFC 5322).
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
export function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email.trim());
}

// HTML-escape for safe output (defense-in-depth; EJS <%= %> also escapes).
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- Mailbox providers ----
// name + brand color + initial (for the letter badge) + webmail inbox URL.
// `logo` (only for the big providers) points to a real logo image; providers
// without one fall back to the generic colored-letter badge.
const PROVIDERS = {
  gmail:   { name: 'Gmail',       color: '#EA4335', initial: 'M',        logo: '/public/logos/gmail.svg',   inbox: 'https://mail.google.com/mail/u/0/' },
  outlook: { name: 'Outlook',     color: '#0072C6', initial: 'O',        logo: '/public/logos/outlook.svg', inbox: 'https://outlook.live.com/mail/0/' },
  yahoo:   { name: 'Yahoo',       color: '#6001D2', initial: 'Y',        logo: '/public/logos/yahoo.svg',   inbox: 'https://mail.yahoo.com/' },
  icloud:  { name: 'iCloud',      color: '#3693F3', initial: '&#9729;',  logo: '/public/logos/icloud.svg',  inbox: 'https://www.icloud.com/mail/' },
  proton:  { name: 'Proton Mail', color: '#6D4AFF', initial: 'P',        logo: null, inbox: 'https://mail.proton.me/u/0/' },
  aol:     { name: 'AOL',         color: '#3399FF', initial: 'A',        logo: null, inbox: 'https://mail.aol.com/' },
  zoho:    { name: 'Zoho Mail',   color: '#E42527', initial: 'Z',        logo: null, inbox: 'https://mail.zoho.com/zm/' },
  gmx:     { name: 'GMX',         color: '#1C449B', initial: 'G',        logo: null, inbox: 'https://www.gmx.com/' },
  yandex:  { name: 'Yandex',      color: '#FC3F1D', initial: 'Y',        logo: null, inbox: 'https://mail.yandex.com/' },
  fastmail:{ name: 'Fastmail',    color: '#0067B9', initial: 'F',        logo: null, inbox: 'https://app.fastmail.com/mail/' },
  generic: { name: 'Mail',        color: '#5b7083', initial: '&#9993;',  logo: null, inbox: null },
};

// Map many known domains onto a provider key.
const DOMAIN_MAP = {
  'gmail.com': 'gmail', 'googlemail.com': 'gmail',
  'outlook.com': 'outlook', 'hotmail.com': 'outlook', 'hotmail.co.uk': 'outlook',
  'live.com': 'outlook', 'msn.com': 'outlook', 'outlook.co.uk': 'outlook',
  'yahoo.com': 'yahoo', 'yahoo.co.uk': 'yahoo', 'ymail.com': 'yahoo', 'rocketmail.com': 'yahoo',
  'icloud.com': 'icloud', 'me.com': 'icloud', 'mac.com': 'icloud',
  'protonmail.com': 'proton', 'proton.me': 'proton', 'pm.me': 'proton',
  'aol.com': 'aol',
  'zoho.com': 'zoho', 'zohomail.com': 'zoho',
  'gmx.com': 'gmx', 'gmx.net': 'gmx', 'gmx.de': 'gmx',
  'yandex.com': 'yandex', 'yandex.ru': 'yandex',
  'fastmail.com': 'fastmail', 'fastmail.fm': 'fastmail',
};

function domainOf(email) {
  return String(email).toLowerCase().split('@')[1] || '';
}

// Resolve a provider from an email address ({{EMAIL}} / unknown -> best guess).
export function getProvider(email) {
  const domain = domainOf(email);
  const key = DOMAIN_MAP[domain];
  if (key) return PROVIDERS[key];
  if (!domain || domain.includes('{')) return PROVIDERS.generic;
  // Unknown domain: dynamic colored-letter badge from the domain, no logo.
  return { name: domain, color: '#5b7083', initial: (domain[0] || '?').toUpperCase(), logo: null, inbox: null };
}

// Resolve a provider directly by key (for forced previews: gmail/outlook/...).
export function getProviderByKey(key) {
  return PROVIDERS[key] || PROVIDERS.generic;
}

// Best webmail URL to send someone to after they vote. Falls back to the
// domain's own site for unknown providers so *something* sensible opens.
export function getInboxUrl(email) {
  const p = getProvider(email);
  if (p.inbox) return p.inbox;
  const domain = domainOf(email);
  return domain && !domain.includes('{') ? `https://${domain}` : '';
}

// Render the provider badge (email-safe: plain HTML + inline CSS).
// Big providers (gmail/outlook/yahoo/icloud) show a real logo image; the rest
// show a brand-colored letter. `baseUrl` makes the logo <img> src absolute so
// it loads from inside an email.
export function providerBadgeHtml(provider, { size = 26, baseUrl = '' } = {}) {
  let mark;
  if (provider.logo) {
    mark = `<img src="${baseUrl}${provider.logo}" width="${size}" height="${size}" alt="${provider.name}" style="display:inline-block;width:${size}px;height:${size}px;border-radius:7px;vertical-align:middle;">`;
  } else {
    mark = `<span style="display:inline-block;width:${size}px;height:${size}px;line-height:${size}px;text-align:center;border-radius:7px;background:${provider.color};color:#ffffff;font-weight:700;font-size:${Math.round(
      size * 0.5
    )}px;font-family:Arial,Helvetica,sans-serif;vertical-align:middle;">${provider.initial}</span>`;
  }
  return `${mark}<span style="vertical-align:middle;margin-left:8px;font-size:14px;color:#334155;font-family:Arial,Helvetica,sans-serif;">${provider.name}</span>`;
}
