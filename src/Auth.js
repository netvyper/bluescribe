import React, { useState } from 'react'
import axios from 'axios'

const Auth = ({ setToken, setUser, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const res = await axios.post(endpoint, { username, password })
      setToken(res.data.token)
      setUser(res.data.user)
      if (onLoginSuccess) {
        onLoginSuccess(res.data.user)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed')
    }
  }

  return (
    <article style={{ width: '400px', margin: 'auto' }}>
      <header>
        <h4>{isLogin ? 'Login' : 'Register'}</h4>
      </header>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <footer>
        <button className="outline" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </footer>
    </article>
  )
}

export default Auth
