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
      const body     = mode === 'login' ? { username: username.trim(), password } : { username: username.trim(), password, role }
      const { data } = await api.post(endpoint, body)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role }))
      onLogin({ username: data.username, role: data.role })
      navigate('/')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const s = {
    page:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
    card:    { background: '#fff', borderRadius: 12, padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '100%', maxWidth: 400 },
    input:   { width: '100%', padding: '10px 12px', border: '1.5px solid #cbd5e0', borderRadius: 6, fontSize: 14, outline: 'none', color: '#2d3748', marginBottom: 16, boxSizing: 'border-box' },
    label:   { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 5 },
    btn:     { width: '100%', padding: '11px', background: loading ? '#a0aec0' : '#3b5bdb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 },
    error:   { background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 6, padding: '10px 14px', color: '#c53030', fontSize: 13, marginBottom: 16 },
    roleBtn: (active) => ({ flex: 1, padding: '9px', border: `1.5px solid ${active ? '#3b5bdb' : '#cbd5e0'}`, borderRadius: 6, background: active ? '#ebf4ff' : '#fff', color: active ? '#3b5bdb' : '#718096', fontWeight: active ? 700 : 400, cursor: 'pointer', fontSize: 13 }),
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign: 'center', fontSize: 32, marginBottom: 6 }}>⚡</div>
        <h1 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>AI Grading Portal</h1>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#718096', marginBottom: 28 }}>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</p>

        {error && <div style={s.error}>⚠️ {error}</div>}

        <label style={s.label}>Username</label>
        <input style={s.input} type="text" placeholder="e.g. CS21B001" value={username} onChange={(e) => setUsername(e.target.value)} />

        <label style={s.label}>Password</label>
        <input style={s.input} type="password" placeholder="••••••••" value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />

        {mode === 'register' && (
          <>
            <label style={s.label}>Role</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button style={s.roleBtn(role === 'student')} onClick={() => setRole('student')}>👨‍🎓 Student</button>
              <button style={s.roleBtn(role === 'teacher')} onClick={() => setRole('teacher')}>👩‍🏫 Teacher</button>
            </div>
          </>
        )}

        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#718096' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button style={{ background: 'none', border: 'none', color: '#3b5bdb', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
