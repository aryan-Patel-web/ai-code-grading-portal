import React, { useState } from 'react'
import api from '../api'
import CodeEditor from '../components/CodeEditor'
import TestResultCard from '../components/TestResultCard'

export default function SubmitCode() {
  const [studentId, setStudentId] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    setResults(null)

    if (!studentId.trim()) { setError('Please enter your Student ID.'); return }
    if (!code.trim()) { setError('Please write some code before submitting.'); return }

    setLoading(true)
    try {
      const { data } = await api.post('/submissions', {
        studentId: studentId.trim(),
        code,
        language: 'python',
      })
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    heading: { fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 },
    subheading: { fontSize: 13, color: '#718096', marginBottom: 24 },
    problemBox: {
      background: '#ebf8ff', border: '1px solid #bee3f8',
      borderRadius: 8, padding: '14px 18px', marginBottom: 20,
    },
    problemTitle: { fontWeight: 700, fontSize: 13, color: '#2b6cb0', marginBottom: 6 },
    problemText: { fontSize: 13, color: '#2c5282', lineHeight: 1.6 },
    idRow: { marginBottom: 16 },
    label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 5 },
    input: {
      padding: '8px 12px', border: '1.5px solid #cbd5e0',
      borderRadius: 6, fontSize: 14, outline: 'none', width: 220, color: '#2d3748',
    },
    btnRow: { marginTop: 16, display: 'flex', alignItems: 'center', gap: 16 },
    btn: {
      padding: '10px 32px',
      background: loading ? '#a0aec0' : '#3b5bdb',
      color: '#fff', border: 'none', borderRadius: 6,
      fontWeight: 700, fontSize: 14,
      cursor: loading ? 'not-allowed' : 'pointer',
    },
    loadingHint: { fontSize: 12, color: '#718096' },
    error: {
      background: '#fff5f5', border: '1px solid #feb2b2',
      borderRadius: 6, padding: '10px 14px',
      color: '#c53030', fontSize: 13, marginTop: 12,
    },
    resultsSection: { marginTop: 32 },
    scoreBanner: (allPass) => ({
      background: allPass ? '#f0fff4' : '#fff5f5',
      border: `1.5px solid ${allPass ? '#9ae6b4' : '#feb2b2'}`,
      borderRadius: 8, padding: '14px 18px',
      marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
    }),
    scoreText: { fontWeight: 700, fontSize: 16 },
    scoreSubText: { fontSize: 12, color: '#718096', marginTop: 2 },
  }

  const allPass = results && results.passedCount === results.totalCount

  // Detect if any test timed out — for sandbox safety demo label
  const anyTimeout = results?.testResults?.some((r) => r.actual === '[TIMEOUT]')

  return (
    <div>
      <h1 style={styles.heading}>Code Submission</h1>
      <p style={styles.subheading}>
        Write your Python solution, then click Submit to run it against test cases in a sandboxed environment.
      </p>

      <div style={styles.problemBox}>
        <p style={styles.problemTitle}>📋 Problem: Sum of Two Integers</p>
        <p style={styles.problemText}>
          Read two space-separated integers from standard input and print their sum.<br />
          <strong>Input:</strong> <code>1 2</code> &nbsp;→&nbsp; <strong>Output:</strong> <code>3</code>
        </p>
      </div>

      <div style={styles.idRow}>
        <label style={styles.label}>Student ID</label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g. CS21B001"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          maxLength={60}
        />
      </div>

      <CodeEditor value={code} onChange={setCode} />

      <div style={styles.btnRow}>
        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Running in Sandbox…' : '▶ Submit & Grade'}
        </button>
        {loading && (
          <span style={styles.loadingHint}>
            Running in isolated Docker container (--network=none)…
          </span>
        )}
      </div>

      {error && <div style={styles.error}>⚠️ {error}</div>}

      {results && (
        <div style={styles.resultsSection}>
          <div style={styles.scoreBanner(allPass)}>
            <span style={{ fontSize: 28 }}>{allPass ? '🎉' : anyTimeout ? '⏱️' : '⚠️'}</span>
            <div>
              <p style={styles.scoreText}>
                {results.passedCount} / {results.totalCount} test cases passed
                {anyTimeout && ' — sandbox killed infinite loop ✅'}
              </p>
              <p style={styles.scoreSubText}>
                Submission ID: {results._id} · Stored in MongoDB
              </p>
            </div>
          </div>

          {results.testResults.map((r, i) => (
            <TestResultCard
              key={i}
              index={i}
              input={r.input}
              expected={r.expected}
              actual={r.actual}
              pass={r.pass}
            />
          ))}
        </div>
      )}
    </div>
  )
}
