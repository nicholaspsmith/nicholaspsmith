// Renders the 1200x630 share image into public/og.png. Run from site/.
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const svg = readFileSync('public/musictree.svg').toString('base64');
const html = `<!doctype html><body style="margin:0;width:1200px;height:630px;position:relative;overflow:hidden;
  background:linear-gradient(#8ea3cf,#ffd6b0);color:#0e1f28;font-family:Georgia,serif">
  <div style="position:absolute;right:40px;bottom:0;width:520px;height:600px;background:#2c4a48;
    -webkit-mask:url(data:image/svg+xml;base64,${svg}) right bottom/contain no-repeat"></div>
  <div style="position:absolute;left:70px;top:150px;width:680px">
    <div style="font-size:92px;line-height:1;letter-spacing:-2px">Nicholas P Smith</div>
    <div style="font-size:38px;margin-top:28px;line-height:1.25">I design and build software people love.</div>
  </div></body>`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
writeFileSync('public/og.png', await page.screenshot({ type: 'png' }));
await browser.close();
