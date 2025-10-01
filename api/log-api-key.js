// API endpoint: /api/log-api-key.js
// Ghi log API key, IP, thời gian vào MongoDB

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://Vercel-Admin-youtube-database:PPObM9rSOHN97A5h@youtube-database.ckgczap.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'youtube-database';
const collectionName = 'api_key_logs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { apiKey, ip, time } = req.body;
  if (!apiKey || !ip || !time) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    await collection.insertOne({ apiKey, ip, time });
    await client.close();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
