const fs = require('fs')
const path = require('path')
const express = require('express')

const setupRosters = (app, db, dataDir, requireAuth) => {
  const rostersDir = path.join(dataDir, 'rosters')
  if (!fs.existsSync(rostersDir)) {
    fs.mkdirSync(rostersDir, { recursive: true })
  }

  app.get('/api/rosters', requireAuth, async (req, res) => {
    try {
      const rosters = await db.Roster.findAll({ where: { user_id: req.user.id } })
      const files = rosters.map((r) => r.filename)
      res.json(files)
    } catch (error) {
      console.error('Error listing rosters:', error)
      res.status(500).json({ error: 'Failed to list rosters' })
    }
  })

  app.get('/api/rosters/:filename', requireAuth, async (req, res) => {
    try {
      const { filename } = req.params
      const roster = await db.Roster.findOne({ where: { filename, user_id: req.user.id } })

      if (!roster) {
        return res.status(404).json({ error: 'Roster not found or unauthorized' })
      }

      const filePath = path.join(rostersDir, filename)
      if (fs.existsSync(filePath)) {
        res.sendFile(filePath)
      } else {
        res.status(404).json({ error: 'File not found on disk' })
      }
    } catch (error) {
      console.error('Error downloading roster:', error)
      res.status(500).json({ error: 'Failed to download roster' })
    }
  })

  app.post('/api/rosters/:filename', requireAuth, express.raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
    try {
      const { filename } = req.params

      let roster = await db.Roster.findOne({ where: { filename } })

      if (roster && roster.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: You do not own this roster' })
      }

      const filePath = path.join(rostersDir, filename)
      fs.writeFileSync(filePath, req.body)

      if (!roster) {
        roster = await db.Roster.create({ filename, user_id: req.user.id })
      }

      res.status(200).json({ message: 'Roster saved successfully', roster })
    } catch (error) {
      console.error('Error saving roster:', error)
      res.status(500).json({ error: 'Failed to save roster' })
    }
  })

  app.delete('/api/rosters/:filename', requireAuth, async (req, res) => {
    try {
      const { filename } = req.params
      const roster = await db.Roster.findOne({ where: { filename } })

      if (!roster) {
        return res.status(404).json({ error: 'Roster not found' })
      }

      if (roster.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: You do not own this roster' })
      }

      const filePath = path.join(rostersDir, filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      await roster.destroy()
      res.status(200).json({ message: 'Roster deleted successfully' })
    } catch (error) {
      console.error('Error deleting roster:', error)
      res.status(500).json({ error: 'Failed to delete roster' })
    }
  })
}

module.exports = setupRosters
