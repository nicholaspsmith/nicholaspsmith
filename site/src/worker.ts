type Env = { ASSETS: { fetch: (request: Request) => Promise<Response> } };

const APEX = 'nicholaspsmith.com';

const OLD_PATHS: Record<string, string> = {
  '/about': '/#about',
  '/contact': '/#contact',
  '/projects': '/#work',
  '/experience': '/#work',
};

const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    'frame-src https://jamesfriend.com.au',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; '),
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX;
      return Response.redirect(url.toString(), 301);
    }

    const target = OLD_PATHS[url.pathname.replace(/\/+$/, '')];
    if (target) {
      return new Response(null, { status: 301, headers: { Location: target } });
    }

    const response = await env.ASSETS.fetch(request);
    const secured = new Response(response.body, response);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      secured.headers.set(name, value);
    }
    return secured;
  },
};
