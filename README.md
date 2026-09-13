# Class Vote Mailer

An HTML email + a landing page for a class project. Classmates get the email,
click the button, land on a clean page that greets **Hello `<their email>`**,
answer a question in a **masked box (with an eye toggle)**, and hit Submit.
The answer is posted to your **project Telegram chat**, then they see a short
loader and are redirected to **their own webmail inbox** (Gmail → Gmail, etc.).

You bring your own bulk mailer. This project gives you:
- **`email.html`** — the file you upload to your mailer.
- a small server that hosts the **`/hi`** page and forwards answers to Telegram.

## How the email address reaches the page

The button links to `<BASE_URL>/hi?e={{EMAIL}}`. Your mailer replaces `{{EMAIL}}`
with each recipient's address at send time, so everyone gets a personal link and
the page greets the exact address it was sent to. (A link click can't reveal who
clicked on its own — the address has to travel in the link.)

> Swap `{{EMAIL}}` for your mailer's own merge tag — e.g. Mailchimp `*|EMAIL|*`,
> SendGrid `{{email}}`, Sendy `[email]`.

## Supported mailbox providers

Provider name, badge, and post-vote inbox redirect are detected from the email
domain: **Gmail, Outlook/Hotmail/Live, Yahoo, iCloud, Proton, AOL, Zoho, GMX,
Yandex, Fastmail**. Any other domain still works — the badge falls back to the
domain name and the redirect falls back to `https://<domain>`.

**Logos:** Gmail, Outlook, Yahoo and iCloud show a real logo image (served from
`public/logos/`); every other provider shows a brand-colored letter badge. Note:
email clients only load images after the reader allows them, and some (e.g. the
Gmail app) may not render SVG — if you need bulletproof email logos, replace the
SVGs in `public/logos/` with PNGs of the same names.

## Language

All interface + email wording lives in `i18n.js` (English, Spanish, Dutch,
French, German included). Set the default with `APP_LANG` in `.env`
(`APP_LANG=es`). A link can override per-recipient with `?lang=xx`
(e.g. `/hi?e=…&lang=nl`). Add a language by copying an entry in `i18n.js`.

The **question** itself is separate (it's your content): set `QUESTION` in
`.env`, and optionally a translated `QUESTION_ES`, `QUESTION_NL`, etc.

## Environment (`.env`)

```
PORT=3000
BASE_URL=http://localhost:3000     # MUST be your public URL in production
QUESTION=Who is the strongest Avenger?
TELEGRAM_BOT_TOKEN=...              # from @BotFather
TELEGRAM_CHAT_ID=...               # your chat/group id
```

Without the two Telegram values the app runs in **DEV mode**: answers are logged
to the server console instead of Telegram, so you can test the flow first.

## Run locally

```bash
npm install
cp .env.example .env
npm start            # or: npm run dev  (nodemon)
```

- Port already in use (`EADDRINUSE`)? Another copy is running — stop it
  (`pkill -f "node server.js"`) or change `PORT` in `.env`.
- Classmates can't reach `localhost`. To test from other devices, either deploy
  (below) or run a tunnel: `npx cloudflared tunnel --url http://localhost:3000`
  (or install ngrok: `brew install ngrok`). Put the public URL in `BASE_URL`.

## Deploy (recommended for the real send)

This is a normal long-running Node/Express server, so use a host that runs one:

- **Render.com** (free tier, easiest): New → Web Service → connect the repo →
  Build `npm install`, Start `npm start`. Add env vars (`BASE_URL` = the
  `https://<app>.onrender.com` URL Render gives you, plus the Telegram + QUESTION
  values). `PORT` is provided by Render automatically and the app already reads it.
- **Railway.app** / **Fly.io** work the same way.
- A small **VPS** (DigitalOcean, Hetzner) if you prefer managing your own box.

After deploy, the app regenerates `email.html` with your public `BASE_URL`, so
download it from `https://<app>.onrender.com/email.html` and upload that to your
bulk mailer.

## Get your Telegram chat id

- **Personal DM:** message **@userinfobot** → it replies with your numeric **Id**.
- **Group:** add **@RawDataBot** to the group → it prints the group `chat id`
  (a negative number) → remove it again.

Put the value in `TELEGRAM_CHAT_ID` and restart.

## Routes

| Method | Path            | Purpose                                                        |
| ------ | --------------- | -------------------------------------------------------------- |
| GET    | `/`             | Setup hub: preview email, download file, test flow             |
| GET    | `/email.html`   | The bulk email file (`?p=gmail\|outlook\|…` for a provider variant) |
| GET    | `/hi?e=`        | Landing page: greeting + question + masked box                 |
| POST   | `/submit`       | Records the answer, posts to Telegram (rate-limited)           |

## Test

```bash
npm test
```

Boots the server (Telegram forced to DEV mode) and checks the email links to the
page, the page greets the email with a masked box + eye toggle + "Choose wisely",
and that submitting is accepted (empty answers rejected).
