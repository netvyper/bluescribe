import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import App from './App'
import { FSContext, NativeContext } from './Context'

import FS from '@isomorphic-git/lightning-fs'

const fs = new FS('bluescribedata')
const gameSystemPath = '/gameSystems'
const rosterPath = '/rosters'

;(async () => {
  try {
    await fs.promises.readdir(gameSystemPath)
  } catch (e) {
    await fs.promises.mkdir(gameSystemPath, { recursive: true })
  }

  try {
    await fs.promises.readdir(rosterPath)
  } catch (e) {
    await fs.promises.mkdir(rosterPath, { recursive: true })
  }

  const root = ReactDOM.createRoot(document.getElementById('root'))

  const mockNativeContext = {
    readFilesNative: async (dir, gameSystemPath) => { return null },
    selectDirectory: async () => { return null },
    shellOpen: async (path) => { return null }
  }

  root.render(
    <React.StrictMode>
      <FSContext.Provider value={{ fs, gameSystemPath, rosterPath }}>
        <NativeContext.Provider value={mockNativeContext}>
          <App />
        </NativeContext.Provider>
      </FSContext.Provider>
    </React.StrictMode>,
  )
})()
