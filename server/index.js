const path = require('path')
const fs = require('fs')
const cron = require('node-cron')
const express = require('express')
const getApp = require('./app')
const { syncRepo } = require('./sync')
const initDb = require('./db')
const setupAuth = require('./auth')
const setupRosters = require('./rosters')

const PORT = 3001
const DATA_DIR = path.join(__dirname, 'data')
const REPO_DIR = path.join(DATA_DIR, 'wh40k-10e')
const REPO_URL = 'https://github.com/BSData/wh40k-10e.git'

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize SQLite DB
const db = initDb(DATA_DIR)
db.sequelize
  .sync()
  .then(() => {
    console.log('Database initialized')
  })
  .catch((err) => {
    console.error('Failed to initialize database', err)
  })

// Initial sync on startup
syncRepo(REPO_URL, REPO_DIR).catch(console.error)

// Schedule sync every 12 hours
cron.schedule('0 */12 * * *', () => {
  console.log('Running scheduled repository sync...')
  syncRepo(REPO_URL, REPO_DIR).catch(console.error)
})

const app = getApp(DATA_DIR)

// Parse JSON bodies for auth endpoints
app.use(express.json())

// Setup Auth and get requireAuth middleware
const requireAuth = setupAuth(app, db.User)

// Setup Rosters routes
setupRosters(app, db, DATA_DIR, requireAuth)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
