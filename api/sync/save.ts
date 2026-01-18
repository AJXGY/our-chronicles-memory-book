// Vercel Serverless Function: Save user data to cloud
import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs/promises';
import path from 'path';

// Data directory (Vercel uses /tmp for temporary storage)
const DATA_DIR = '/tmp/chronicles-data';

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

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Save data to file (using username as filename)
    const filePath = path.join(DATA_DIR, `${username}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    return res.status(200).json({ 
      success: true, 
      message: 'Data saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ 
      error: 'Failed to save data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
