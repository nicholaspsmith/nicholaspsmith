// Fails if the home page's first load is over budget. Counts compressed bytes
// of the HTML, its stylesheets, its scripts and the fonts it preloads, plus
// whatever else is loaded before the reader scrolls.
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const BUDGET_KB = 500;
const PORT = 4323;

const server = spawn('npx', ['wrangler', 'dev', '--port', String(PORT)], { stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-server.pid); } catch {} };

try {
  for (let i = 0; i < 40; i++) {
    try { await fetch(`http://localhost:${PORT}/`); break; } catch { await new Promise((r) => setTimeout(r, 500)); }
  }
  const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  const sizes = new Map();
  cdp.on('Network.loadingFinished', (e) => sizes.set(e.requestId, e.encodedDataLength));
  const urls = new Map();
  cdp.on('Network.requestWillBeSent', (e) => urls.set(e.requestId, e.request.url));
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await browser.close();

  const rows = [...sizes].map(([id, size]) => [size, urls.get(id)?.replace(`http://localhost:${PORT}`, '')]).sort((a, b) => b[0] - a[0]);
  const total = rows.reduce((sum, [size]) => sum + size, 0) / 1024;
  rows.slice(0, 8).forEach(([size, url]) => console.log(`${(size / 1024).toFixed(1).padStart(7)} KB  ${url}`));
  console.log(`${total.toFixed(1)} KB of ${BUDGET_KB} KB`);
  if (total > BUDGET_KB) process.exitCode = 1;
} finally {
  stop();
}
