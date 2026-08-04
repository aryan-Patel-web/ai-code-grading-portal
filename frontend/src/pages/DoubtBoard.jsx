import React, { useState, useEffect, useCallback } from 'react'
import api from '../api'
import DoubtCard from '../components/DoubtCard'
import DoubtForm from '../components/DoubtForm'

export default function DoubtBoard({ user }) {
  const [doubts, setDoubts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetchDoubts = useCallback(async () => {
    setLoading(true); setError('')
    try { const { data } = await api.get('/doubts'); setDoubts(data) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDoubts() }, [fetchDoubts])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>Doubt Board</h1>
      <p style={{ fontSize: 13, color: '#718096', marginBottom: 24 }}>Browse approved answers. Only teacher-reviewed answers appear here.</p>

      <div style={{ background: '#fffff0', border: '1px solid #f6e05e', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#744210', marginBottom: 20 }}>
        💡 Answers are AI-generated drafts reviewed and approved by a teacher before appearing here.
      </div>

      {loading && <p style={{ color: '#718096', padding: '40px 0', textAlign: 'center' }}>⏳ Loading…</p>}
      {error   && <div style={{ background: '#fff5f5', borderRadius: 6, padding: 12, color: '#c53030' }}>⚠️ {error}</div>}

      {!loading && !error && doubts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#a0aec0', fontSize: 14 }}>
          <p style={{ fontSize: 32 }}>📭</p><p>No approved doubts yet. Be the first to ask!</p>
        </div>
      )}

      {doubts.map((d) => (
        <DoubtCard key={d._id} questionText={d.questionText} aiAnswer={d.aiAnswer} studentId={d.studentId} createdAt={d.createdAt} />
      ))}

      {user?.role === 'student' && <DoubtForm user={user} onSubmitted={fetchDoubts} />}
    </div>
  )
}
