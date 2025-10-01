// API endpoint: /api/log-keyword.js
// Ghi log IP, keyword, thời gian vào MongoDB

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb+srv://Vercel-Admin-youtube-database:PPObM9rSOHN97A5h@youtube-database.ckgczap.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'youtube-database';
const collectionName = 'keyword_logs';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  let ip, keyword, time;
  try {
    ({ ip, keyword, time } = req.body);
  } catch (e) {
    console.error('Body parse error:', e, req.body);
    res.status(400).json({ error: 'Body parse error', detail: e.message });
    return;
  }
  if (!ip || !keyword || !time) {
    console.error('Missing fields:', { ip, keyword, time, body: req.body });
    res.status(400).json({ error: 'Missing fields', detail: { ip, keyword, time, body: req.body } });
    return;
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.insertOne({ ip, keyword, time });
    console.log('Insert result:', result);
    await client.close();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mongo error:', err);
    res.status(500).json({ error: err.message });
  }
};
