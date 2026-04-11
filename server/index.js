const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const cron = require('node-cron');

const app = express();
app.use(cors());

const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const REPO_DIR = path.join(DATA_DIR, 'wh40k-10e');
const REPO_URL = 'https://github.com/BSData/wh40k-10e.git';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const git = simpleGit();

async function syncRepo() {
  console.log('Starting repository sync...');
  try {
    if (fs.existsSync(REPO_DIR)) {
      console.log('Repository exists, pulling latest changes...');
      await simpleGit(REPO_DIR).pull();
      console.log('Successfully pulled latest changes.');
    } else {
      console.log('Repository does not exist, cloning...');
      await git.clone(REPO_URL, REPO_DIR);
      console.log('Successfully cloned repository.');
    }
  } catch (error) {
    console.error('Error syncing repository:', error);
  }
}

// Initial sync on startup
syncRepo();

// Schedule sync every 12 hours
cron.schedule('0 */12 * * *', () => {
  console.log('Running scheduled repository sync...');
  syncRepo();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// List available systems
app.get('/api/systems', async (req, res) => {
  try {
    // Return systems based on directories in DATA_DIR
    if (!fs.existsSync(DATA_DIR)) {
      return res.json([]);
    }
    const dirents = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    const systems = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    res.json(systems);
  } catch (error) {
    console.error('Error listing systems:', error);
    res.status(500).json({ error: 'Failed to list systems' });
  }
});

// Serve raw files securely
app.get('/api/files/*', (req, res) => {
  const requestedFile = req.params[0];
  if (!requestedFile) {
    return res.status(400).json({ error: 'No file specified' });
  }

  // Prevent directory traversal
  const safePath = path.normalize(requestedFile).replace(/^(\.\.[\/\\])+/, '');
  // Because /api/systems returns directories in DATA_DIR (e.g. wh40k-10e), the frontend
  // might request /api/files/wh40k-10e/some-file.cat. We should resolve against DATA_DIR
  // rather than REPO_DIR.
  const filePath = path.join(DATA_DIR, safePath);

  // Ensure the resolved path is within DATA_DIR
  if (!filePath.startsWith(DATA_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
