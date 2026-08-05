import React, { useState, useEffect } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Login             from './pages/Login'
import SubmitCode        from './pages/SubmitCode'
import DoubtBoard        from './pages/DoubtBoard'
import TeacherDashboard  from './pages/TeacherDashboard'
import SubmissionHistory from './pages/SubmissionHistory'
import InjectionLogs     from './pages/InjectionLogs'
import api               from './api'

export default function App() {
  const [user, setUser]       = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token  = localStorage.getItem('token')
    if (stored && token) {
      try {
        // Verify token is still valid against backend
        setUser(JSON.parse(stored))
        api.get('/auth/me').catch(() => {
          // Token invalid on server — clear and show login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setChecking(false)
  }, [])

  const handleLogin  = (userData) => setUser(userData)
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isTeacher = user?.role === 'teacher'

  const navStyle = ({ isActive }) => ({
    color: isActive ? '#00b8d4' : '#cdd6f4',
    textDecoration: 'none', fontWeight: isActive ? 700 : 400,
    padding: '6px 12px', borderRadius: 4, fontSize: 14,
    background: isActive ? 'rgba(0,184,212,0.12)' : 'transparent',
    transition: 'all 0.15s',
  })

  // While checking localStorage, show nothing (prevents flash)
  if (checking) return null

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*"      element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: '#1a1a2e', color: '#fff', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56, boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: '#00b8d4' }}>⚡ AI Grading Portal</span>

        <nav style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <NavLink to="/"        style={navStyle} end>Submit Code</NavLink>
          <NavLink to="/doubts"  style={navStyle}>Doubt Board</NavLink>
          <NavLink to="/history" style={navStyle}>My History</NavLink>
          {isTeacher && <NavLink to="/teacher"        style={navStyle}>Teacher Dashboard</NavLink>}
          {isTeacher && <NavLink to="/injection-logs" style={navStyle}>🚨 Injection Logs</NavLink>}

          <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 10,
              background: isTeacher ? '#f59e0b' : '#3b5bdb', color: '#fff',
            }}>
              {isTeacher ? '👩‍🏫' : '👨‍🎓'} {user.username}
            </span>
            <button onClick={handleLogout} style={{
              background: 'transparent', border: '1px solid #4a5568',
              color: '#a0aec0', borderRadius: 4, padding: '4px 10px',
              fontSize: 12, cursor: 'pointer',
            }}>Logout</button>
          </div>
        </nav>
      </header>

      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <Routes>
          <Route path="/"               element={<SubmitCode user={user} />} />
          <Route path="/doubts"         element={<DoubtBoard user={user} />} />
          <Route path="/history"        element={<SubmissionHistory user={user} />} />
          <Route path="/teacher"        element={isTeacher ? <TeacherDashboard /> : <Navigate to="/" replace />} />
          <Route path="/injection-logs" element={isTeacher ? <InjectionLogs />    : <Navigate to="/" replace />} />
          <Route path="/login"          element={<Navigate to="/" replace />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}