import React, { useState, useEffect } from 'react'
import api from '../api'

export default function SubmissionHistory({ user }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get(`/submissions?studentId=${user?.username || ''}`)
      .then(({ data }) => setSubmissions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  const s = {
    card:   { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer' },
    badge:  (ok) => ({ padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: ok ? '#c6f6d5' : '#fed7d7', color: ok ? '#276749' : '#9b2c2c' }),
    langBadge: { padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#ebf4ff', color: '#3b5bdb' },
    feedbackBox: { background: '#faf5ff', border: '1px solid #d6bcfa', borderRadius: 8, padding: '12px 14px', marginTop: 12 },
  }

  if (loading) return <p style={{ color: '#718096', padding: '40px 0', textAlign: 'center' }}>⏳ Loading history…</p>
  if (error)   return <div style={{ background: '#fff5f5', borderRadius: 6, padding: 12, color: '#c53030' }}>⚠️ {error}</div>

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>My Submission History</h1>
      <p style={{ fontSize: 13, color: '#718096', marginBottom: 24 }}>All your past submissions — click to expand details and AI feedback.</p>

      {submissions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#a0aec0', fontSize: 14 }}>
          <p style={{ fontSize: 32 }}>📭</p><p>No submissions yet. Go submit some code!</p>
        </div>
      )}

      {submissions.map((sub) => {
        const allPass = sub.passedCount === sub.totalCount
        const isOpen  = expanded === sub._id
        return (
          <div key={sub._id} style={s.card} onClick={() => setExpanded(isOpen ? null : sub._id)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={s.langBadge}>{sub.language === 'javascript' ? '🟨 JavaScript' : '🐍 Python'}</span>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#2d3748', marginTop: 4 }}>{sub.passedCount} / {sub.totalCount} test cases passed</p>
                <p style={{ fontSize: 11, color: '#a0aec0' }}>{new Date(sub.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={s.badge(allPass)}>{allPass ? '✅ All Passed' : `❌ ${sub.totalCount - sub.passedCount} Failed`}</span>
                <span style={{ fontSize: 12, color: '#a0aec0' }}>{isOpen ? '▲ collapse' : '▼ expand'}</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 14, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                {sub.testResults?.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '4px 0', fontSize: 12, color: r.pass ? '#276749' : '#9b2c2c' }}>
                    <span>{r.pass ? '✅' : '❌'}</span>
                    <span>TC {i + 1}:</span>
                    <span>input <code style={{ background: '#edf2f7', padding: '1px 4px', borderRadius: 3 }}>{r.input}</code></span>
                    <span>→ expected <code style={{ background: '#edf2f7', padding: '1px 4px', borderRadius: 3 }}>{r.expected}</code></span>
                    <span>→ got <code style={{ background: r.pass ? '#c6f6d5' : '#fed7d7', padding: '1px 4px', borderRadius: 3 }}>{r.actual || '(empty)'}</code></span>
                  </div>
                ))}

                {sub.aiFeedback && (
                  <div style={s.feedbackBox}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#6b46c1', textTransform: 'uppercase', marginBottom: 10 }}>🤖 AI Code Feedback</p>
                    {[['🎨 Style', 'style'], ['⚡ Efficiency', 'efficiency'], ['✔️ Correctness', 'correctness'], ['📝 Summary', 'summary']].map(([label, key]) => sub.aiFeedback[key] && (
                      <div key={key} style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#553c9a', marginBottom: 2 }}>{label}</p>
                        <p style={{ fontSize: 13, color: '#2d3748', lineHeight: 1.6 }}>{sub.aiFeedback[key]}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
