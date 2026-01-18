import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = request.query;

    if (!username || Array.isArray(username)) {
      return response.status(400).json({ error: 'Invalid or missing username' });
    }

    // Load from KV
    const data = await kv.get(`user:${username}`);

    if (!data) {
       return response.status(404).json({ 
         success: false,
         message: 'No data found' 
       });
    }

    return response.status(200).json({ 
      success: true, 
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('KV load error:', error);
    return response.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
