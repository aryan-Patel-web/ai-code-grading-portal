import React, { useState } from 'react'
import api from '../api'

/**
 * DoubtForm — lets a student post a new doubt.
 * On success: shows a "submitted for review" message (NOT instant board update —
 * the answer must go through the approval workflow first).
 *
 * Props: { onSubmitted } — callback to refetch the board after submission
 */
export default function DoubtForm({ onSubmitted }) {
  const [studentId, setStudentId] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const charLimit = 2000
  const remaining = charLimit - questionText.length

  const handleSubmit = async () => {
    setError('')
    setSuccess(false)

    if (!studentId.trim()) { setError('Please enter your student ID.'); return }
    if (!questionText.trim()) { setError('Please enter your question.'); return }
    if (questionText.length > charLimit) { setError('Question too long.'); return }

    setLoading(true)
    try {
      await api.post('/doubts', {
        studentId: studentId.trim(),
        questionText: questionText.trim(),
      })
      setSuccess(true)
      setQuestionText('')
      // Don't reset studentId — likely reposting
      if (onSubmitted) onSubmitted()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const styles = {
    wrapper: {
      background: '#fff',
      border: '1.5px solid #bee3f8',
      borderRadius: 10,
      padding: '20px 24px',
      marginTop: 32,
    },
    title: { fontWeight: 700, fontSize: 15, color: '#2b6cb0', marginBottom: 16 },
    row: { marginBottom: 14 },
    label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 5 },
    input: {
      width: '100%',
      padding: '9px 12px',
      border: '1.5px solid #cbd5e0',
      borderRadius: 6,
      fontSize: 14,
      outline: 'none',
      color: '#2d3748',
    },
    textarea: {
      width: '100%',
      minHeight: 110,
      padding: '9px 12px',
      border: '1.5px solid #cbd5e0',
      borderRadius: 6,
      fontSize: 14,
      resize: 'vertical',
      outline: 'none',
      fontFamily: 'inherit',
      color: '#2d3748',
      lineHeight: 1.6,
    },
    charCount: {
      fontSize: 11,
      color: remaining < 100 ? '#e53e3e' : '#a0aec0',
      textAlign: 'right',
      marginTop: 3,
    },
    btn: {
      padding: '10px 28px',
      background: loading ? '#a0aec0' : '#3b5bdb',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      fontWeight: 700,
      fontSize: 14,
      cursor: loading ? 'not-allowed' : 'pointer',
    },
    error: {
      background: '#fff5f5',
      border: '1px solid #feb2b2',
      borderRadius: 6,
      padding: '10px 14px',
      color: '#c53030',
      fontSize: 13,
      marginBottom: 12,
    },
    success: {
      background: '#f0fff4',
      border: '1px solid #9ae6b4',
      borderRadius: 6,
      padding: '10px 14px',
      color: '#276749',
      fontSize: 13,
      marginBottom: 12,
      fontWeight: 600,
    },
  }

  return (
    <div style={styles.wrapper}>
      <p style={styles.title}>📩 Post a New Doubt</p>

      {error && <div style={styles.error}>⚠️ {error}</div>}
      {success && (
        <div style={styles.success}>
          ✅ Your doubt has been submitted! A teacher will review the AI-generated answer
          before it appears on the board.
        </div>
      )}

      <div style={styles.row}>
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

      <div style={styles.row}>
        <label style={styles.label}>Your Question</label>
        <textarea
          style={styles.textarea}
          placeholder="Describe your doubt clearly. What concept are you stuck on? What did you try?"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          maxLength={charLimit}
        />
        <p style={styles.charCount}>{remaining} characters remaining</p>
      </div>

      <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
        {loading ? '⏳ Submitting…' : 'Submit Doubt'}
      </button>
    </div>
  )
}
