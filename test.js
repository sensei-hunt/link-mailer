// test.js — smoke test for the vote flow (Telegram runs in DEV mode: logged, not sent).
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 3999;
const BASE = `http://localhost:${PORT}`;

let failures = 0;
const check = (label, cond) => {
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}`);
  if (!cond) failures++;
};

async function main() {
  const srv = spawn('node', ['server.js'], {
    // No Telegram creds -> DEV mode, so nothing is sent externally.
    // EMAIL_FILE -> a scratch path so the test never overwrites the real email.html.
    env: {
      ...process.env,
      PORT: String(PORT), BASE_URL: BASE,
      TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '',
      EMAIL_FILE: join(tmpdir(), 'vote-email.test.html'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  srv.stdout.on('data', (d) => process.stdout.write(`  [server] ${d}`));
  srv.stderr.on('data', (d) => process.stderr.write(`  [server:err] ${d}`));

  try {
    for (let i = 0; i < 40; i++) {
      try { if ((await fetch(BASE + '/')).ok) break; } catch {}
      await sleep(150);
    }
    const email = 'classmate@gmail.com';

    console.log('\n1) Email file links to the vote page');
    const emailHtml = await (await fetch(BASE + '/email.html')).text();
    check('email.html contains /hi?e={{EMAIL}} link', emailHtml.includes('/hi?e={{EMAIL}}'));
    check('email shows the question', emailHtml.includes('strongest Avenger'));

    console.log('\n2) Vote page greets the email + masks the answer');
    const hi = await (await fetch(`${BASE}/hi?e=${encodeURIComponent(email)}`)).text();
    check('greets "Hello classmate@gmail.com"', hi.includes(`Hello ${email}`));
    check('answer input is type=password', /id="answer"[^>]*type="password"|type="password"[^>]*id="answer"/.test(hi));
    check('has an eye toggle', hi.includes('id="eye"'));
    check('error text "Choose wisely" shown', hi.includes('Choose wisely'));

    console.log('\n3) Submitting an answer is accepted');
    const submit = await fetch(BASE + '/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, answer: 'Thor' }),
    });
    const thanks = await submit.text();
    check('submit returns 200', submit.status === 200);
    check('shows a thank-you', thanks.includes('Thank you'));

    console.log('\n4) Empty answer is rejected');
    const bad = await fetch(BASE + '/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, answer: '' }),
    });
    check('empty answer returns 400', bad.status === 400);

    console.log(`\n${failures === 0 ? 'ALL PASSED ✓' : failures + ' CHECK(S) FAILED ✗'}`);
  } finally {
    srv.kill();
  }
  process.exit(failures === 0 ? 0 : 1);
}

main();
