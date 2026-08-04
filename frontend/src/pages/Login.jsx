import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login({ onLogin }) {
  const [mode, setMode]         = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState('student')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    if (!username.trim() || !password) { setError('Username and password required'); return }
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const body     = mode === 'login'
        ? { username: username.trim(), password }
        : { username: username.trim(), password, role }
      const { data } = await api.post(endpoint, body)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role }))
      onLogin({ username: data.username, role: data.role })
      navigate('/')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">AI Grading Portal</h1>
        <p className="login-subtitle">KPMG G&amp;PS E&amp;S Internship Assignment</p>

        <div className="tabs">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              className={`tab ${mode === m ? 'tab-active' : ''}`}
              onClick={() => { setMode(m); setError('') }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {error && <div className="error-box">{error}</div>}

        {mode === 'register' && (
          <div className="field">
            <label className="field-label">Role</label>
            <div className="role-row">
              <button
                className={`role-btn ${role === 'student' ? 'role-active' : ''}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button
                className={`role-btn ${role === 'teacher' ? 'role-active' : ''}`}
                onClick={() => setRole('teacher')}
              >
                Teacher
              </button>
            </div>
          </div>
        )}

        <div className="field">
          <label className="field-label">Username</label>
          <input
            className="field-input"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label">Password</label>
          <input
            className="field-input"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div className="demo-box">
          <span className="demo-label">Demo accounts (click to fill)</span>
          <button
            type="button"
            className="demo-row"
            onClick={() => { setUsername('123'); setPassword('123'); setError('') }}
          >
            Student — <code>123</code> / <code>123</code>
          </button>
          <button
            type="button"
            className="demo-row"
            onClick={() => { setUsername('teacher1'); setPassword('teacher123'); setError('') }}
          >
            Teacher — <code>teacher1</code> / <code>teacher123</code>
          </button>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f6f8;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 380px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 32px 28px;
        }

        .login-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          text-align: center;
          margin: 0 0 4px;
        }

        .login-subtitle {
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          margin: 0 0 24px;
        }

        .tabs {
          display: flex;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .tab {
          flex: 1;
          padding: 9px 0;
          border: none;
          background: #ffffff;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .tab-active {
          background: #111827;
          color: #ffffff;
        }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 13px;
          border-radius: 6px;
          padding: 9px 12px;
          margin-bottom: 16px;
        }

        .field {
          margin-bottom: 16px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .field-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          color: #111827;
          outline: none;
        }

        .field-input:focus {
          border-color: #111827;
        }

        .role-row {
          display: flex;
          gap: 8px;
        }

        .role-btn {
          flex: 1;
          padding: 9px 0;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
          color: #6b7280;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .role-active {
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        .submit-btn {
          width: 100%;
          padding: 11px 0;
          border: none;
          border-radius: 6px;
          background: #111827;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 4px;
        }

        .submit-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .demo-box {
          margin-top: 18px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 12px;
          color: #4b5563;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .demo-label {
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }

        .demo-box code {
          background: #eef0f3;
          padding: 1px 5px;
          border-radius: 4px;
        }

        .demo-row {
          text-align: left;
          background: none;
          border: none;
          padding: 3px 4px;
          margin: 0 -4px;
          font-size: 12px;
          color: #4b5563;
          cursor: pointer;
          border-radius: 4px;
          font-family: inherit;
        }

        .demo-row:hover {
          background: #f0f1f3;
          color: #111827;
        }

        @media (max-width: 420px) {
          .login-card {
            padding: 26px 20px;
          }
        }
      `}</style>
    </div>
  )
}