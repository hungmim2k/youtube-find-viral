// API endpoint: /api/get-keyword-logs.js
// Lấy danh sách log IP, keyword, thời gian từ MongoDB

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || "mongodb+srv://Vercel-Admin-youtube-database:PPObM9rSOHN97A5h@youtube-database.ckgczap.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'youtube-database';
const collectionName = 'keyword_logs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const logs = await collection.find({}).sort({ time: -1 }).toArray();
    await client.close();
    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
