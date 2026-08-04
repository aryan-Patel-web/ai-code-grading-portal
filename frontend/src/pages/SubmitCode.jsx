import React, { useState } from 'react'
import api from '../api'
import CodeEditor from '../components/CodeEditor'
import TestResultCard from '../components/TestResultCard'

export default function SubmitCode({ user }) {
  const [language, setLanguage] = useState('python')
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [results, setResults]   = useState(null)
  const [error, setError]       = useState('')

  const handleSubmit = async () => {
    setError(''); setResults(null)
    if (!code.trim()) { setError('Please write some code before submitting.'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/submissions', { studentId: user?.username || 'anonymous', code, language })
      setResults(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const allPass    = results && results.passedCount === results.totalCount
  const anyTimeout = results?.testResults?.some((r) => r.actual === '[TIMEOUT]')

  const s = {
    heading: { fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 },
    sub:     { fontSize: 13, color: '#718096', marginBottom: 24 },
    problemBox: { background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: 8, padding: '14px 18px', marginBottom: 20 },
    langBtn: (active) => ({ padding: '7px 18px', borderRadius: 6, border: `1.5px solid ${active ? '#3b5bdb' : '#cbd5e0'}`, background: active ? '#ebf4ff' : '#fff', color: active ? '#3b5bdb' : '#718096', fontWeight: active ? 700 : 400, cursor: 'pointer', fontSize: 13 }),
    btn:     { padding: '10px 32px', background: loading ? '#a0aec0' : '#3b5bdb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' },
    error:   { background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 6, padding: '10px 14px', color: '#c53030', fontSize: 13, marginTop: 12 },
    scoreBanner: (ok) => ({ background: ok ? '#f0fff4' : '#fff5f5', border: `1.5px solid ${ok ? '#9ae6b4' : '#feb2b2'}`, borderRadius: 8, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }),
    feedbackSection: { background: '#faf5ff', border: '1.5px solid #d6bcfa', borderRadius: 10, padding: '18px 20px', marginTop: 24 },
    feedbackGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
    feedbackCard: { background: '#fff', border: '1px solid #e9d8fd', borderRadius: 8, padding: '12px 14px' },
    feedbackLabel: { fontSize: 11, fontWeight: 700, color: '#553c9a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    feedbackText: { fontSize: 13, color: '#2d3748', lineHeight: 1.65 },
  }

  return (
    <div>
      <h1 style={s.heading}>Code Submission</h1>
      <p style={s.sub}>Write your solution and submit to run it in an isolated Docker sandbox.</p>

      <div style={s.problemBox}>
        <p style={{ fontWeight: 700, fontSize: 13, color: '#2b6cb0', marginBottom: 6 }}>📋 Problem: Sum of Two Integers</p>
        <p style={{ fontSize: 13, color: '#2c5282', lineHeight: 1.6 }}>
          Read two space-separated integers and print their sum.<br />
          <strong>Input:</strong> <code>1 2</code> → <strong>Output:</strong> <code>3</code>
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 8 }}>Language</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={s.langBtn(language === 'python')}     onClick={() => setLanguage('python')}>🐍 Python 3</button>
          <button style={s.langBtn(language === 'javascript')} onClick={() => setLanguage('javascript')}>🟨 JavaScript (Node)</button>
        </div>
      </div>

      <CodeEditor value={code} onChange={setCode} language={language} />

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Running in Sandbox…' : '▶ Submit & Grade'}
        </button>
        {loading && <span style={{ fontSize: 12, color: '#718096' }}>Docker container running (--network=none)…</span>}
      </div>

      {error && <div style={s.error}>⚠️ {error}</div>}

      {results && (
        <div style={{ marginTop: 32 }}>
          <div style={s.scoreBanner(allPass)}>
            <span style={{ fontSize: 28 }}>{allPass ? '🎉' : anyTimeout ? '⏱️' : '⚠️'}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16 }}>
                {results.passedCount} / {results.totalCount} test cases passed
                {anyTimeout && ' — sandbox killed runaway code ✅'}
              </p>
              <p style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>ID: {results._id} · {results.language} · Stored in MongoDB</p>
            </div>
          </div>

          {results.testResults.map((r, i) => (
            <TestResultCard key={i} index={i} input={r.input} expected={r.expected} actual={r.actual} pass={r.pass} />
          ))}

          {results.aiFeedback && (
            <div style={s.feedbackSection}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#6b46c1', marginBottom: 16 }}>🤖 AI Code Quality Feedback</p>
              <div style={s.feedbackGrid}>
                {[['🎨 Style & Readability', 'style'], ['⚡ Efficiency', 'efficiency'], ['✔️ Correctness', 'correctness']].map(([label, key]) => (
                  <div key={key} style={s.feedbackCard}>
                    <p style={s.feedbackLabel}>{label}</p>
                    <p style={s.feedbackText}>{results.aiFeedback[key]}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: '#553c9a', color: '#fff', borderRadius: 8, padding: '12px 14px', marginTop: 14, fontSize: 13, lineHeight: 1.6 }}>
                📝 <strong>Overall:</strong> {results.aiFeedback.summary}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
