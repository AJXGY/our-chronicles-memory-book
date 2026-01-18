// Vercel Serverless Function: Save user data to cloud
import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, data } = req.body;

    if (!username || !data) {
      return res.status(400).json({ error: 'Missing username or data' });
    }

    // Save data to Vercel KV using username as key
    const key = `user:${username}:data`;
    await kv.set(key, data);

    return res.status(200).json({ 
      success: true, 
      message: 'Data saved successfully to KV',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ 
      error: 'Failed to save data to KV',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
