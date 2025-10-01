export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbyw7ALCxCq1rMcOPQBtp-TRW-dkmeuzAXrSKkDaJuA/exec';
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const text = await response.text();
    res.status(200).json({ result: text });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
