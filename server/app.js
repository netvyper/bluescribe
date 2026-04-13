const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()
app.use(cors())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' })
})

// Pass DATA_DIR via app.locals or hardcode for now, but better to inject.
// For testability, let's determine DATA_DIR at runtime.
const getApp = (dataDir) => {
  const localApp = express()
  localApp.use(helmet())
  localApp.use(cors())

  // Set up rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window`
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
  })

  localApp.use('/api', apiLimiter)

  localApp.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' })
  })

  // List available systems
  localApp.get('/api/systems', async (req, res) => {
    try {
      if (!fs.existsSync(dataDir)) {
        return res.json([])
      }
      const dirents = fs.readdirSync(dataDir, { withFileTypes: true })
      const systems = dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)

      res.json(systems)
    } catch (error) {
      console.error('Error listing systems:', error)
      res.status(500).json({ error: 'Failed to list systems' })
    }
  })

  // Serve raw files securely
  localApp.get('/api/files/*', (req, res) => {
    const requestedFile = req.params[0]
    if (!requestedFile) {
      return res.status(400).json({ error: 'No file specified' })
    }

    // Prevent directory traversal
    const safePath = path.normalize(requestedFile).replace(/^(\.\.[\/\\])+/, '')
    const filePath = path.join(dataDir, safePath)

    // Ensure the resolved path is within dataDir
    if (!filePath.startsWith(dataDir)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isFile()) {
        res.sendFile(filePath)
      } else if (fs.statSync(filePath).isDirectory()) {
        const dirents = fs.readdirSync(filePath, { withFileTypes: true })
        const files = dirents.map((dirent) => ({
          name: dirent.name,
          isDirectory: dirent.isDirectory(),
        }))
        res.json(files)
      }
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  })

  return localApp
}

module.exports = getApp
