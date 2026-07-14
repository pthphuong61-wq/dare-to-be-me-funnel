// Proxy Sepay webhook → Google Apps Script.
// GAS Web Apps always answer with an HTTP 302 redirect before the real response;
// Sepay's webhook sender does not follow redirects, so it reports delivery failures.
// This Vercel serverless function sits in front of GAS, follows the redirect itself
// (Node's fetch does this by default), and relays the final JSON back to Sepay.

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyiGUVDOXoV81TG6JbJ2zXNaM531DFGr5AdKLCWhinVHg-_MmMwQtmLa-80SYk055_X/exec';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const key = req.query.key || '';
  const targetUrl = `${GAS_URL}?key=${encodeURIComponent(key)}`;

  try {
    const gasRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });
    const text = await gasRes.text();
    res.status(200).send(text);
  } catch (err) {
    res.status(502).json({ success: false, error: String(err) });
  }
}
