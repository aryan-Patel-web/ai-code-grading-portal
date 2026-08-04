

// import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../api'

// export default function Login({ onLogin }) {
//   const [mode, setMode]         = useState('login')
//   const [username, setUsername] = useState('')
//   const [password, setPassword] = useState('')
//   const [role, setRole]         = useState('student')
//   const [loading, setLoading]   = useState(false)
//   const [error, setError]       = useState('')
//   const navigate = useNavigate()

//   const handleSubmit = async () => {
//     setError('')
//     if (!username.trim() || !password) { setError('Username and password required'); return }
//     setLoading(true)
//     try {
//       const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
//       const body     = mode === 'login'
//         ? { username: username.trim(), password }
//         : { username: username.trim(), password, role }
//       const { data } = await api.post(endpoint, body)
//       localStorage.setItem('token', data.token)
//       localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role }))
//       onLogin({ username: data.username, role: data.role })
//       navigate('/')
//     } catch (err) { setError(err.message) }
//     finally { setLoading(false) }
//   }

//   const s = {
//     page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
//     card:  { background: '#fff', borderRadius: 16, padding: '40px 36px', boxShadow: '0 4px 32px rgba(0,0,0,0.12)', width: '100%', maxWidth: 420 },
//     label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 5 },
//     input: { width: '100%', padding: '11px 14px', border: '1.5px solid #cbd5e0', borderRadius: 8, fontSize: 14, outline: 'none', color: '#2d3748', marginBottom: 16, boxSizing: 'border-box' },
//     roleBtn: (active, color) => ({
//       flex: 1, padding: '14px 8px', border: `2px solid ${active ? color : '#e2e8f0'}`,
//       borderRadius: 10, background: active ? color + '18' : '#f7fafc',
//       color: active ? color : '#718096', fontWeight: active ? 700 : 500,
//       cursor: 'pointer', fontSize: 13, textAlign: 'center', transition: 'all 0.2s',
//     }),
//     error: { background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '10px 14px', color: '#c53030', fontSize: 13, marginBottom: 16 },
//   }

//   return (
//     <div style={s.page}>
//       <div style={s.card}>
//         <div style={{ textAlign: 'center', fontSize: 36, marginBottom: 8 }}>⚡</div>
//         <h1 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>AI Grading Portal</h1>
//         <p style={{ textAlign: 'center', fontSize: 12, color: '#718096', marginBottom: 24 }}>KPMG G&PS E&S Internship Assignment</p>

//         {/* Tab switcher */}
//         <div style={{ display: 'flex', background: '#f0f2f5', borderRadius: 10, padding: 4, marginBottom: 24 }}>
//           {['login', 'register'].map((m) => (
//             <button key={m} onClick={() => { setMode(m); setError('') }} style={{
//               flex: 1, padding: '9px', border: 'none', borderRadius: 8,
//               background: mode === m ? '#fff' : 'transparent',
//               color: mode === m ? '#1a202c' : '#718096',
//               fontWeight: mode === m ? 700 : 400, cursor: 'pointer', fontSize: 13,
//               boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
//             }}>
//               {m === 'login' ? '🔑 Sign In' : '📝 Register'}
//             </button>
//           ))}
//         </div>

//         {error && <div style={s.error}>⚠️ {error}</div>}

//         {/* Register — role picker */}
//         {mode === 'register' && (
//           <>
//             <label style={{ ...s.label, marginBottom: 10 }}>I am a...</label>
//             <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
//               <button style={s.roleBtn(role === 'student', '#3b5bdb')} onClick={() => setRole('student')}>
//                 <div style={{ fontSize: 28, marginBottom: 4 }}>👨‍🎓</div>
//                 <div style={{ fontWeight: 700, fontSize: 14 }}>Student</div>
//                 <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>Submit code & ask doubts</div>
//               </button>
//               <button style={s.roleBtn(role === 'teacher', '#f59e0b')} onClick={() => setRole('teacher')}>
//                 <div style={{ fontSize: 28, marginBottom: 4 }}>👩‍🏫</div>
//                 <div style={{ fontWeight: 700, fontSize: 14 }}>Teacher</div>
//                 <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>Review & approve AI answers</div>
//               </button>
//             </div>
//           </>
//         )}

//         {/* Login — role explanation */}
//         {mode === 'login' && (
//           <div style={{ background: '#f7fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 12, color: '#4a5568', lineHeight: 1.7 }}>
//             <strong>👨‍🎓 Students</strong> — submit code & post doubts<br />
//             <strong>👩‍🏫 Teachers</strong> — review & approve AI answers<br />
//             <span style={{ color: '#a0aec0' }}>Your role loads automatically from your account.</span>
//           </div>
//         )}

//         <label style={s.label}>Username</label>
//         <input style={s.input} type="text" placeholder="e.g. CS21B001 or teacher1"
//           value={username} onChange={(e) => setUsername(e.target.value)} />

//         <label style={s.label}>Password</label>
//         <input style={s.input} type="password" placeholder="••••••••"
//           value={password} onChange={(e) => setPassword(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />

//         <button onClick={handleSubmit} disabled={loading} style={{
//           width: '100%', padding: '12px', borderRadius: 8, border: 'none',
//           fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
//           background: loading ? '#a0aec0' : mode === 'register' ? (role === 'teacher' ? '#f59e0b' : '#3b5bdb') : '#3b5bdb',
//           color: '#fff', marginTop: 4,
//         }}>
//           {loading ? '⏳ Please wait…' : mode === 'login' ? '🔑 Sign In' : role === 'teacher' ? '👩‍🏫 Register as Teacher' : '👨‍🎓 Register as Student'}
//         </button>

//         <div style={{ marginTop: 20, background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#276749' }}>
//           <strong>Demo accounts:</strong><br />
//           Student: <code>123</code> / your password &nbsp;|&nbsp; Teacher: <code>teacher1</code> / <code>teacher123</code>
//         </div>
//       </div>
//     </div>
//   )
// }


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
          <span className="demo-label">Demo accounts</span>
          <span>Student — <code>123</code> / <code>123</code></span>
          <span>Teacher — <code>teacher1</code> / <code>teacher123</code></span>
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

        @media (max-width: 420px) {
          .login-card {
            padding: 26px 20px;
          }
        }
      `}</style>
    </div>
  )
}