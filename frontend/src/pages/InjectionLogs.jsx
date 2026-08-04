import React, { useState, useEffect } from 'react'
import api from '../api'

export default function InjectionLogs() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/doubts/injection-logs')
      .then(({ data }) => setLogs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>🚨 Injection Attempt Logs</h1>
      <p style={{ fontSize: 13, color: '#718096', marginBottom: 24 }}>
        All detected prompt injection attempts — student ID, patterns matched, and raw input before sanitization.
      </p>

      {loading && <p style={{ color: '#718096', padding: '40px 0', textAlign: 'center' }}>⏳ Loading logs…</p>}
      {error   && <div style={{ background: '#fff5f5', borderRadius: 6, padding: 12, color: '#c53030' }}>⚠️ {error}</div>}

      {!loading && logs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#a0aec0', fontSize: 14 }}>
          <p style={{ fontSize: 32 }}>🛡️</p><p>No injection attempts detected yet.</p>
        </div>
      )}

      {logs.map((log) => (
        <div key={log._id} style={{ background: '#fff', border: '1.5px solid #feb2b2', borderRadius: 10, padding: '16px 20px', marginBottom: 12, boxShadow: '0 1px 4px rgba(229,62,62,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#c53030' }}>⚠️ {log.studentId}</span>
            <span style={{ fontSize: 11, color: '#a0aec0' }}>{new Date(log.createdAt).toLocaleString('en-IN')}</span>
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase', marginBottom: 4 }}>Patterns matched</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {log.patternsFound.map((p) => (
              <span key={p} style={{ background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{p}</span>
            ))}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase', marginBottom: 4 }}>Raw input (before sanitization)</p>
          <div style={{ background: '#1e1e2e', color: '#f38ba8', fontFamily: 'monospace', fontSize: 12, padding: '8px 10px', borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 120, overflowY: 'auto' }}>
            {log.rawInput}
          </div>
        </div>
      ))}
    </div>
  )
}
