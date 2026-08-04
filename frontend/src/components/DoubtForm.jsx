import React, { useState } from 'react'
import api from '../api'

export default function DoubtForm({ user, onSubmitted }) {
  const [questionText, setQuestionText] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const charLimit = 2000
  const remaining = charLimit - questionText.length

  const handleSubmit = async () => {
    setError(''); setSuccess(false)
    if (!questionText.trim()) { setError('Please enter your question.'); return }
    setLoading(true)
    try {
      await api.post('/doubts', { studentId: user?.username || 'anonymous', questionText: questionText.trim() })
      setSuccess(true)
      setQuestionText('')
      if (onSubmitted) onSubmitted()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const s = {
    wrap:    { background: '#fff', border: '1.5px solid #bee3f8', borderRadius: 10, padding: '20px 24px', marginTop: 32 },
    title:   { fontWeight: 700, fontSize: 15, color: '#2b6cb0', marginBottom: 16 },
    label:   { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 5 },
    textarea:{ width: '100%', minHeight: 110, padding: '9px 12px', border: '1.5px solid #cbd5e0', borderRadius: 6, fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit', color: '#2d3748', lineHeight: 1.6 },
    btn:     { padding: '10px 28px', background: loading ? '#a0aec0' : '#3b5bdb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' },
    error:   { background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 6, padding: '10px 14px', color: '#c53030', fontSize: 13, marginBottom: 12 },
    success: { background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 6, padding: '10px 14px', color: '#276749', fontSize: 13, marginBottom: 12, fontWeight: 600 },
  }

  return (
    <div style={s.wrap}>
      <p style={s.title}>📩 Post a New Doubt</p>
      {error   && <div style={s.error}>⚠️ {error}</div>}
      {success && <div style={s.success}>✅ Submitted! A teacher will review the AI answer before it appears on the board.</div>}
      <label style={s.label}>Submitting as: <strong>{user?.username}</strong></label>
      <div style={{ marginBottom: 14 }}>
        <label style={s.label}>Your Question</label>
        <textarea style={s.textarea} placeholder="Describe your doubt clearly…"
          value={questionText} onChange={(e) => setQuestionText(e.target.value)} maxLength={charLimit} />
        <p style={{ fontSize: 11, color: remaining < 100 ? '#e53e3e' : '#a0aec0', textAlign: 'right', marginTop: 3 }}>{remaining} characters remaining</p>
      </div>
      <button style={s.btn} onClick={handleSubmit} disabled={loading}>
        {loading ? '⏳ Submitting…' : 'Submit Doubt'}
      </button>
    </div>
  )
}
