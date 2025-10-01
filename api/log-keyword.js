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
  const { ip, keyword, time } = req.body;
  if (!ip || !keyword || !time) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    await collection.insertOne({ ip, keyword, time });
    await client.close();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
