import path from 'path-browserify'
import containerTags from 'bsd-schema/containerTags.json'
import axios from 'axios'

import { readXML, xmlData } from './'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const listRosters = async (gameSystem, fs, rosterPath) => {
  const rosters = {}
  let files = []
  try {
    const res = await axios.get('/api/rosters', { headers: getAuthHeaders() })
    files = res.data
  } catch (err) {
    console.error('Error listing rosters from backend:', err)
    // Fallback to local FS just in case or return empty
    try {
      files = await fs.promises.readdir(rosterPath)
    } catch (e) {
      console.error('Error listing local rosters:', e)
    }
  }

  await Promise.all(
    files.map(async (file) => {
      try {
        const roster = await loadRoster(file, fs, rosterPath)
        if (roster.gameSystemId === gameSystem.id) {
          rosters[file] = roster.name
        }
      } catch (e) {
        rosters[file] = e
      }
    }),
  )

  return rosters
}

export const loadRoster = async (file, fs, rosterPath) => {
  let roster
  let rawData = null
  try {
    const res = await axios.get(`/api/rosters/${file}`, {
      headers: getAuthHeaders(),
      responseType: 'arraybuffer',
    })
    rawData = res.data
  } catch (e) {
    console.error('Failed to load roster from backend:', e)
    // If backend fails, attempt to read from local cache/FS
  }

  roster = await readXML(path.join(rosterPath, file), fs, rawData)
  roster.__ = {
    filename: file,
    updated: false,
  }

  function normalize(x) {
    for (let attr in x) {
      if (x[attr] === '') {
        delete x[attr]
      } else if (containerTags[attr] && x[attr][containerTags[attr]]) {
        x[attr][containerTags[attr]].forEach(normalize)
      }
    }
  }

  normalize(roster)

  return roster
}

export const saveRoster = async (roster, fs, rosterPath) => {
  const {
    __: { filename },
    ...contents
  } = roster

  const data = await xmlData({ roster: contents }, filename)

  // Save locally for cache
  await fs.promises.writeFile(path.join(rosterPath, filename), data)

  // Save to backend
  try {
    await axios.post(`/api/rosters/${filename}`, data, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/octet-stream',
      },
    })
  } catch (e) {
    console.error('Failed to save roster to backend:', e)
    alert('Failed to save roster to backend. It was saved locally. Please login or check your permissions.')
  }
}

export const importRoster = async (file, fs, rosterPath) => {
  const data = await file.arrayBuffer()
  console.log('writing', path.join(rosterPath, file.name))
  await fs.promises.writeFile(path.join(rosterPath, file.name), data)

  // Also import to backend
  try {
    await axios.post(`/api/rosters/${file.name}`, data, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/octet-stream',
      },
    })
  } catch (e) {
    console.error('Failed to import roster to backend:', e)
  }
}

export const downloadRoster = async (roster) => {
  const {
    __: { filename },
    ...contents
  } = roster

  const data = await xmlData({ roster: contents }, filename)
  const blob = new Blob([data], { type: 'application/zip' })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.setAttribute('href', url)
  a.download = filename.replace('/', '')
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const deleteRoster = async (file, fs, rosterPath) => {
  try {
    await fs.promises.unlink(path.join(rosterPath, file))
  } catch (e) {
    console.log('File not found locally to delete:', e)
  }

  try {
    await axios.delete(`/api/rosters/${file}`, {
      headers: getAuthHeaders(),
    })
  } catch (e) {
    console.error('Failed to delete roster from backend:', e)
    alert('Failed to delete roster from backend. Check your permissions.')
  }
}
