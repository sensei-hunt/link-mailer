// telegram.js — forward a submitted answer to your project Telegram chat.
//
// Configure in .env:
//   TELEGRAM_BOT_TOKEN=123456:ABC...     (from @BotFather)
//   TELEGRAM_CHAT_ID=-1001234567890       (your group/chat id)
//
// If either is missing the app runs in DEV mode: it logs the message to the
// console instead of calling Telegram, so you can test the whole flow first.

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function sendToTelegram(text) {
  if (!telegramConfigured()) {
    console.log('[telegram] DEV (not configured) — would send:\n' + text + '\n');
    return { ok: true, dev: true };
  }

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.description || `Telegram API error (HTTP ${res.status})`);
  }
  return { ok: true };
}
