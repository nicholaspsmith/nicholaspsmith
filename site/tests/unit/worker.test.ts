import { describe, expect, it, vi } from 'vitest';
import worker from '../../src/worker';

const env = () => ({
  ASSETS: { fetch: vi.fn(async () => new Response('ok', { status: 200 })) },
});
const get = (url: string, e = env()) => worker.fetch(new Request(url), e);

describe('worker', () => {
  it('sends www to the apex and keeps the path and query', async () => {
    const res = await get('https://www.nicholaspsmith.com/resume?x=1');
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://nicholaspsmith.com/resume?x=1');
  });

  it.each([
    ['/about', '/#about'],
    ['/about/', '/#about'],
    ['/contact', '/#contact'],
    ['/projects', '/#work'],
    ['/experience', '/#work'],
  ])('redirects old path %s to %s', async (from, to) => {
    const res = await get(`https://nicholaspsmith.com${from}`);
    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe(to);
  });

  it('serves other paths from the assets', async () => {
    const e = env();
    const res = await get('https://nicholaspsmith.com/work/zimu', e);
    expect(e.ASSETS.fetch).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
  });

  it('adds security headers to asset responses', async () => {
    const res = await get('https://nicholaspsmith.com/');
    expect(res.headers.get('strict-transport-security')).toContain('max-age=');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('content-security-policy')).toContain('frame-src https://jamesfriend.com.au');
  });
});
