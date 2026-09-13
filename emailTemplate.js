// emailTemplate.js
// Builds the standalone HTML email for your bulk mailer — clean office layout
// with a mailbox-provider badge (real logo for the big providers).
//
// The button links to  <BASE_URL>/hi?e=<recipient email>&lang=<lang>.
// For the bulk send the email is a MERGE PLACEHOLDER (default "{{EMAIL}}")
// that your mailer replaces per recipient. Swap it for your mailer's own tag:
//   Mailchimp *|EMAIL|*   SendGrid {{email}}   Sendy [email]
//
// NOTE: the date + deadline are computed WHEN THIS FILE IS GENERATED, so
// download email.html right before sending. Times use the server's timezone —
// set a TZ variable in Railway (e.g. TZ=Africa/Lagos) to show your local time.
import { escapeHtml, getProvider, getProviderByKey, providerBadgeHtml } from './helpers.js';
import { strings, inboxLabel, emailBodyText, locale } from './i18n.js';

// Recipient name = the part of the email before "@" (or the {{EMAIL}} tag as-is,
// since a merge tag can't be split inside a static bulk file).
function localPart(email) {
  return email === '{{EMAIL}}' ? '{{EMAIL}}' : String(email).split('@')[0];
}

export function buildEmailHtml({ baseUrl, email = '{{EMAIL}}', question, providerKey = null, lang = 'en' }) {
  const t = strings(lang);
  const loc = locale(lang);
  const isPlaceholder = email === '{{EMAIL}}';
  const linkEmail = isPlaceholder ? '{{EMAIL}}' : encodeURIComponent(email);
  const link = `${baseUrl}/hi?e=${linkEmail}&lang=${lang}`;

  // Date (today) + deadline (now + 2 hours), formatted in the chosen language.
  const now = new Date();
  const date = now.toLocaleDateString(loc, { year: 'numeric', month: 'long', day: 'numeric' });
  const deadline = new Date(now.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString(loc, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const name = localPart(email);
  const bodyText = emailBodyText(lang, { email, date, deadline });

  // Provider badge: forced (preview), detected from a real email, else generic.
  const provider = providerKey ? getProviderByKey(providerKey) : getProvider(email);
  const badge = providerBadgeHtml(provider, { size: 26, baseUrl });
  const inbox = inboxLabel(lang, provider.name === 'Mail' ? null : provider.name);

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="470" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e4e9;">
          <!-- provider bar -->
          <tr><td style="padding:15px 26px;background:#fafbfc;border-bottom:1px solid #eef1f4;">
            ${badge}
            <span style="float:right;font-size:12px;color:#98a1ad;line-height:26px;">${inbox}</span>
          </td></tr>
          <!-- body -->
          <tr><td style="padding:30px 26px;">
            <h1 style="margin:0 0 14px;font-size:20px;color:#1f2430;">${t.dear} ${escapeHtml(name)},</h1>
            <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#5b6472;">${escapeHtml(bodyText)}</p>
            <p style="margin:0 0 22px;font-size:16px;font-weight:700;color:#1f2430;">${escapeHtml(t.selectHonorably)}</p>
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:8px;background:#3a3d44;">
                <a href="${link}" style="display:inline-block;padding:12px 30px;font-size:15px;color:#ffffff;text-decoration:none;font-weight:700;">${escapeHtml(t.emailButton)}</a>
              </td></tr>
            </table>
            <p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:#98a1ad;">
              ${escapeHtml(t.emailFallback)}<br>
              <a href="${link}" style="color:#3a6df0;word-break:break-all;">${link}</a>
            </p>
          </td></tr>
        </table>
        <p style="margin:14px 0 0;font-size:11px;color:#b0b6c0;">${escapeHtml(t.emailFooter)}</p>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [`${t.dear} ${name},`, '', bodyText, '', t.selectHonorably, '', `${t.emailButton.replace(/\s*→$/, '')}: ${link}`].join('\n');
  return { html, text };
}
