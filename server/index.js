const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const getApp = require('./app');
const { syncRepo } = require('./sync');

const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const REPO_DIR = path.join(DATA_DIR, 'wh40k-10e');
const REPO_URL = 'https://github.com/BSData/wh40k-10e.git';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial sync on startup
syncRepo(REPO_URL, REPO_DIR).catch(console.error);

// Schedule sync every 12 hours
cron.schedule('0 */12 * * *', () => {
  console.log('Running scheduled repository sync...');
  syncRepo(REPO_URL, REPO_DIR).catch(console.error);
});

const app = getApp(DATA_DIR);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
