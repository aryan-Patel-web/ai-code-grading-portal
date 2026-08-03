import React, { useState, useEffect, useCallback } from 'react'
import api from '../api'
import DoubtCard from '../components/DoubtCard'
import DoubtForm from '../components/DoubtForm'

/**
 * DoubtBoard page — shows all teacher-approved doubts.
 * Students can post new doubts via DoubtForm.
 * Only 'approved' doubts are fetched from GET /api/doubts.
 */
export default function DoubtBoard({ role }) {
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDoubts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/doubts')
      setDoubts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDoubts() }, [fetchDoubts])

  const styles = {
    heading: { fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 },
    subheading: { fontSize: 13, color: '#718096', marginBottom: 24 },
    notice: {
      background: '#fffff0',
      border: '1px solid #f6e05e',
      borderRadius: 6,
      padding: '10px 14px',
      fontSize: 12,
      color: '#744210',
      marginBottom: 20,
    },
    loading: { textAlign: 'center', color: '#718096', padding: '40px 0', fontSize: 14 },
    error: {
      background: '#fff5f5',
      border: '1px solid #feb2b2',
      borderRadius: 6,
      padding: '12px 16px',
      color: '#c53030',
      fontSize: 13,
    },
    empty: {
      textAlign: 'center',
      padding: '48px 0',
      color: '#a0aec0',
      fontSize: 14,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: '#4a5568',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 14,
    },
  }

  return (
    <div>
      <h1 style={styles.heading}>Doubt Board</h1>
      <p style={styles.subheading}>
        Browse approved answers to student questions. Only teacher-reviewed answers appear here.
      </p>

      <div style={styles.notice}>
        💡 Answers are AI-generated drafts reviewed and approved by a teacher before appearing here.
        New doubts may take some time to appear after teacher review.
      </div>

      {loading && <p style={styles.loading}>⏳ Loading approved doubts…</p>}

      {error && <div style={styles.error}>⚠️ {error}</div>}

      {!loading && !error && doubts.length === 0 && (
        <div style={styles.empty}>
          <p style={{ fontSize: 32 }}>📭</p>
          <p>No approved doubts yet. Be the first to ask!</p>
        </div>
      )}

      {!loading && doubts.length > 0 && (
        <>
          <p style={styles.sectionTitle}>{doubts.length} approved answer{doubts.length !== 1 ? 's' : ''}</p>
          {doubts.map((d) => (
            <DoubtCard
              key={d._id}
              questionText={d.questionText}
              aiAnswer={d.aiAnswer}
              studentId={d.studentId}
              createdAt={d.createdAt}
            />
          ))}
        </>
      )}

      {/* Students can post doubts; teachers don't need to (they approve, not post) */}
      {role === 'student' && (
        <DoubtForm onSubmitted={fetchDoubts} />
      )}
    </div>
  )
}
