// Local development server for API endpoints
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Data directory for storing user data
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
await fs.mkdir(DATA_DIR, { recursive: true });

// API: Save user data
app.post('/api/sync/save', async (req, res) => {
  try {
    const { username, data } = req.body;

    if (!username || !data) {
      return res.status(400).json({ error: 'Missing username or data' });
    }

    // Save data to file
    const filePath = path.join(DATA_DIR, `${username}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`✅ Data saved for user: ${username}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Data saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Save error:', error);
    return res.status(500).json({ 
      error: 'Failed to save data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API: Load user data
app.get('/api/sync/load', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Missing username parameter' });
    }

    const filePath = path.join(DATA_DIR, `${username}.json`);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      console.log(`✅ Data loaded for user: ${username}`);

      return res.status(200).json({ 
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // File doesn't exist - return empty data
      if (error.code === 'ENOENT') {
        console.log(`ℹ️  No data found for user: ${username}`);
        return res.status(404).json({ 
          success: false,
          message: 'No data found for this user'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ Load error:', error);
    return res.status(500).json({ 
      error: 'Failed to load data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
});
