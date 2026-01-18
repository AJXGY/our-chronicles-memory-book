import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, data } = request.body;

    if (!username || !data) {
      return response.status(400).json({ error: 'Missing username or data' });
    }

    // Save to KV
    // Key format: user:{username}
    await kv.set(`user:${username}`, data);

    return response.status(200).json({ 
      success: true, 
      message: 'Data saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('KV save error:', error);
    return response.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
