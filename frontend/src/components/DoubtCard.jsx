import React from 'react'

/**
 * DoubtCard — displays a single approved doubt + its AI-generated (teacher-approved) answer.
 * Props: { questionText, aiAnswer, studentId, createdAt }
 *
 * NOTE: aiAnswer is rendered as plain text (not innerHTML / dangerouslySetInnerHTML).
 * This prevents XSS even if somehow un-sanitized HTML slipped through storage.
 * DOMPurify rendering is a Part 2 enhancement.
 */
export default function DoubtCard({ questionText, aiAnswer, studentId, createdAt }) {
  const styles = {
    card: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '18px 20px',
      marginBottom: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: '#3b5bdb',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
    },
    studentId: { fontWeight: 600, fontSize: 13, color: '#2d3748' },
    date: { fontSize: 11, color: '#a0aec0', marginLeft: 'auto' },
    question: {
      fontWeight: 600,
      fontSize: 15,
      color: '#1a202c',
      marginBottom: 12,
      lineHeight: 1.5,
    },
    divider: {
      border: 'none',
      borderTop: '1px dashed #e2e8f0',
      margin: '12px 0',
    },
    answerLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: '#00b8d4',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 6,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    answer: {
      fontSize: 14,
      color: '#2d3748',
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap',       // preserve line breaks from AI response
      wordBreak: 'break-word',
      background: '#f7fafc',
      borderLeft: '3px solid #00b8d4',
      padding: '10px 14px',
      borderRadius: '0 6px 6px 0',
    },
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : ''

  const initial = studentId ? studentId.charAt(0).toUpperCase() : '?'

  return (
    <div style={styles.card}>
      <div style={styles.meta}>
        <div style={styles.avatar}>{initial}</div>
        <span style={styles.studentId}>{studentId || 'Anonymous'}</span>
        <span style={styles.date}>{formattedDate}</span>
      </div>

      <p style={styles.question}>💬 {questionText}</p>

      <hr style={styles.divider} />

      <div style={styles.answerLabel}>🤖 AI Answer (teacher-approved)</div>
      {/* Plain text render — no dangerouslySetInnerHTML; XSS-safe by default */}
      <div style={styles.answer}>{aiAnswer}</div>
    </div>
  )
}
