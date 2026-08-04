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

  const s = {
    page: {
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f0f2f5',
    },
    card: {
      background: '#fff', borderRadius: 16, padding: '40px 36px',
      boxShadow: '0 4px 32px rgba(0,0,0,0.12)', width: '100%', maxWidth: 420,
    },
    logo:  { textAlign: 'center', fontSize: 36, marginBottom: 8 },
    title: { textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 },
    sub:   { textAlign: 'center', fontSize: 13, color: '#718096', marginBottom: 28 },
    label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 5 },
    input: {
      width: '100%', padding: '11px 14px', border: '1.5px solid #cbd5e0',
      borderRadius: 8, fontSize: 14, outline: 'none', color: '#2d3748',
      marginBottom: 16, boxSizing: 'border-box', transition: 'border-color 0.2s',
    },
    btn: {
      width: '100%', padding: '12px', borderRadius: 8,
      border: 'none', fontWeight: 700, fontSize: 15,
      cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
    },
    roleBtn: (active, color) => ({
      flex: 1, padding: '12px 8px', border: `2px solid ${active ? color : '#e2e8f0'}`,
      borderRadius: 10, background: active ? color + '15' : '#f7fafc',
      color: active ? color : '#718096', fontWeight: active ? 700 : 500,
      cursor: 'pointer', fontSize: 13, transition: 'all 0.2s', textAlign: 'center',
    }),
    error: {
      background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8,
      padding: '10px 14px', color: '#c53030', fontSize: 13, marginBottom: 16,
    },
    divider: {
      display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0',
    },
    dividerLine: { flex: 1, height: 1, background: '#e2e8f0' },
    dividerText: { fontSize: 12, color: '#a0aec0', fontWeight: 500 },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>⚡</div>
        <h1 style={s.title}>AI Grading Portal</h1>
        <p style={s.sub}>KPMG G&PS E&S Internship Assignment</p>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#f0f2f5', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '9px', border: 'none', borderRadius: 8,
              background: mode === m ? '#fff' : 'transparent',
              color: mode === m ? '#1a202c' : '#718096',
              fontWeight: mode === m ? 700 : 400, cursor: 'pointer', fontSize: 13,
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}>
              {m === 'login' ? '🔑 Sign In' : '📝 Register'}
            </button>
          ))}
        </div>

        {error && <div style={s.error}>⚠️ {error}</div>}

        {/* REGISTER — show role picker prominently */}
        {mode === 'register' && (
          <>
            <label style={{ ...s.label, marginBottom: 10 }}>I am a...</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button style={s.roleBtn(role === 'student', '#3b5bdb')}
                onClick={() => setRole('student')}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>👨‍🎓</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Student</div>
                <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                  Submit code & ask doubts
                </div>
              </button>
              <button style={s.roleBtn(role === 'teacher', '#f59e0b')}
                onClick={() => setRole('teacher')}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>👩‍🏫</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Teacher</div>
                <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                  Review & approve AI answers
                </div>
              </button>
            </div>
          </>
        )}

        {/* SIGN IN — show who can sign in */}
        {mode === 'login' && (
          <div style={{
            background: '#f7fafc', borderRadius: 10, padding: '12px 14px',
            marginBottom: 20, display: 'flex', gap: 16,
          }}>
            <div style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.6 }}>
              <strong>👨‍🎓 Students</strong> — sign in to submit code and post doubts<br />
              <strong>👩‍🏫 Teachers</strong> — sign in to review and approve AI answers<br />
              <span style={{ color: '#a0aec0' }}>Your role is set automatically from your account.</span>
            </div>
          </div>
        )}

        <label style={s.label}>Username</label>
        <input
          style={s.input}
          type="text"
          placeholder="e.g. CS21B001 or teacher1"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />

        <button
          style={{
            ...s.btn,
            background: loading ? '#a0aec0' : mode === 'register'
              ? (role === 'teacher' ? '#f59e0b' : '#3b5bdb')
              : '#3b5bdb',
            color: '#fff',
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? '⏳ Please wait…'
            : mode === 'login'
              ? '🔑 Sign In'
              : role === 'teacher'
                ? '👩‍🏫 Register as Teacher'
                : '👨‍🎓 Register as Student'
          }
        </button>

        {/* Demo accounts hint */}
        <div style={{
          marginTop: 20, background: '#f0fff4', border: '1px solid #9ae6b4',
          borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#276749',
        }}>
          <strong>Demo accounts:</strong><br />
          Student: <code>123</code> / <code>your password</code><br />
          Teacher: <code>teacher1</code> / <code>teacher123</code>
        </div>
      </div>
    </div>
  )
}
