// Same-origin, read-only proxy for the Nanimelaina public API.
// Only known read endpoints are forwarded; response is cached briefly by Vercel.
const API_BASE = 'https://v1312.nanimelaina.web.id/api/nanimelaina';
const API_ROOT = new URL(API_BASE);
const ALLOWED = [
  /^\/home$/,
  /^\/anime\/[a-zA-Z0-9._~-]+$/,
  /^\/episodes\/[a-zA-Z0-9._~-]+$/,
  /^\/search$/,
  /^\/schedule$/,
  /^\/genres$/,
  /^\/az-list$/
];

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const rawPath = String(req.query.path || '');
  let target;
  try {
    if (!rawPath.startsWith('/') || rawPath.startsWith('//')) throw new Error('Invalid path');
    target = new URL(API_BASE + rawPath);
  } catch (_) {
    return res.status(400).json({ error: 'Invalid API path' });
  }
  const relativePath = target.pathname.slice(API_ROOT.pathname.length);
  if (target.origin !== API_ROOT.origin || !ALLOWED.some(rule => rule.test(relativePath))) {
    return res.status(400).json({ error: 'Endpoint is not allowed' });
  }
  // Forward only the query parameters used by the bundled frontend.
  for (const key of ['q', 'page', 'date', 'letter']) {
    const value = req.query[key];
    if (typeof value === 'string' && value.length <= 160) target.searchParams.set(key, value);
  }
  try {
    const upstream = await fetch(target.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    const body = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=600');
    return res.status(upstream.status).send(body);
  } catch (error) {
    console.error('Nanimelaina proxy error:', error);
    return res.status(502).json({ error: 'Nanimelaina API is temporarily unavailable' });
  }
};
