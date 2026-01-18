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

    // Check data size (Vercel KV limit is 100MB, but we warn at 10MB)
    const dataSize = JSON.stringify(data).length;
    const dataSizeMB = (dataSize / (1024 * 1024)).toFixed(2);
    
    console.log(`Saving data for user: ${username}, size: ${dataSizeMB}MB`);
    
    if (dataSize > 10 * 1024 * 1024) { // 10MB
      console.warn(`Large data size: ${dataSizeMB}MB for user ${username}`);
    }
    
    if (dataSize > 50 * 1024 * 1024) { // 50MB
      return res.status(413).json({ 
        error: 'Data too large',
        details: `数据过大 (${dataSizeMB}MB)，请减少图片数量或质量`
      });
    }

    // Save data to Vercel KV using username as key
    const key = `user:${username}:data`;
    await kv.set(key, data);

    return res.status(200).json({ 
      success: true, 
      message: 'Data saved successfully to KV',
      dataSize: dataSizeMB + 'MB',
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
