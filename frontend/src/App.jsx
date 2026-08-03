import React, { useState } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import SubmitCode from './pages/SubmitCode'
import DoubtBoard from './pages/DoubtBoard'
import TeacherDashboard from './pages/TeacherDashboard'
import RoleToggle from './components/RoleToggle'

/* ─── Inline styles (no external CSS file needed for MVP) ─────────────────── */
const styles = {
  app: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: {
    background: '#1a1a2e',
    color: '#fff',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: { fontWeight: 700, fontSize: 18, letterSpacing: 0.5, color: '#00b8d4' },
  nav: { display: 'flex', gap: 8, alignItems: 'center' },
  main: { flex: 1, padding: '32px 24px', maxWidth: 900, margin: '0 auto', width: '100%' },
}

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? '#00b8d4' : '#cdd6f4',
  textDecoration: 'none',
  fontWeight: isActive ? 700 : 400,
  padding: '6px 12px',
  borderRadius: 4,
  fontSize: 14,
  background: isActive ? 'rgba(0,184,212,0.12)' : 'transparent',
  transition: 'all 0.15s',
})

export default function App() {
  // TIME-TRADEOFF: role is a client-side UI flag — no real auth.
  // Anyone can switch to teacher view. Documented in README section 9, tradeoff #1.
  const [role, setRole] = useState('student')

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <span style={styles.brand}>⚡ AI Grading Portal</span>

        <nav style={styles.nav}>
          <NavLink to="/" style={navLinkStyle} end>
            Submit Code
          </NavLink>
          <NavLink to="/doubts" style={navLinkStyle}>
            Doubt Board
          </NavLink>
          {role === 'teacher' && (
            <NavLink to="/teacher" style={navLinkStyle}>
              Teacher Dashboard
            </NavLink>
          )}
          <RoleToggle role={role} setRole={setRole} />
        </nav>
      </header>

      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<SubmitCode />} />
          <Route path="/doubts" element={<DoubtBoard role={role} />} />
          <Route
            path="/teacher"
            element={
              role === 'teacher'
                ? <TeacherDashboard />
                : <Navigate to="/" replace />
            }
          />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
