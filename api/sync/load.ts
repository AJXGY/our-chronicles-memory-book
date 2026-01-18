// Vercel Serverless Function: Load user data from cloud
import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Missing username parameter' });
    }

    // Read data from Vercel KV
    const key = `user:${username}:data`;
    const data = await kv.get(key);
    
    if (!data) {
      return res.status(404).json({ 
        success: false,
        message: 'No data found for this user'
      });
    }

    return res.status(200).json({ 
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Load error:', error);
    return res.status(500).json({ 
      error: 'Failed to load data from KV',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
