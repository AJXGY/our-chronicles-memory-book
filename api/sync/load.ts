// Vercel Serverless Function: Load user data from cloud
import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs/promises';
import path from 'path';

// Data directory (Vercel uses /tmp for temporary storage)
const DATA_DIR = '/tmp/chronicles-data';

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

    // Read data from file
    const filePath = path.join(DATA_DIR, `${username}.json`);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      return res.status(200).json({ 
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // File doesn't exist - return empty data
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return res.status(404).json({ 
          success: false,
          message: 'No data found for this user'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Load error:', error);
    return res.status(500).json({ 
      error: 'Failed to load data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
