// import React, { useState, useEffect, useCallback } from 'react'
// import api from '../api'
// import DoubtCard from '../components/DoubtCard'
// import DoubtForm from '../components/DoubtForm'

// export default function DoubtBoard({ user }) {
//   const [doubts, setDoubts]   = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError]     = useState('')

//   const fetchDoubts = useCallback(async () => {
//     setLoading(true); setError('')
//     try { const { data } = await api.get('/doubts'); setDoubts(data) }
//     catch (err) { setError(err.message) }
//     finally { setLoading(false) }
//   }, [])

//   useEffect(() => { fetchDoubts() }, [fetchDoubts])

//   return (
//     <div>
//       <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>Doubt Board</h1>
//       <p style={{ fontSize: 13, color: '#718096', marginBottom: 24 }}>Browse approved answers. Only teacher-reviewed answers appear here.</p>

//       <div style={{ background: '#fffff0', border: '1px solid #f6e05e', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#744210', marginBottom: 20 }}>
//         💡 Answers are AI-generated drafts reviewed and approved by a teacher before appearing here.
//       </div>

//       {loading && <p style={{ color: '#718096', padding: '40px 0', textAlign: 'center' }}>⏳ Loading…</p>}
//       {error   && <div style={{ background: '#fff5f5', borderRadius: 6, padding: 12, color: '#c53030' }}>⚠️ {error}</div>}

//       {!loading && !error && doubts.length === 0 && (
//         <div style={{ textAlign: 'center', padding: '48px 0', color: '#a0aec0', fontSize: 14 }}>
//           <p style={{ fontSize: 32 }}>📭</p><p>No approved doubts yet. Be the first to ask!</p>
//         </div>
//       )}

//       {doubts.map((d) => (
//         <DoubtCard key={d._id} questionText={d.questionText} aiAnswer={d.aiAnswer} studentId={d.studentId} createdAt={d.createdAt} />
//       ))}

//       {user?.role === 'student' && <DoubtForm user={user} onSubmitted={fetchDoubts} />}
//     </div>
//   )
// }


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
      <p style={{ fontSize: 13, color: '#718096', marginBottom: 24 }}>
        Post your coding doubts below. AI drafts an answer and a teacher approves it before it appears publicly.
      </p>

      {/* FORM AT TOP */}
      {user?.role === 'student' && <DoubtForm user={user} onSubmitted={fetchDoubts} />}

      {/* DIVIDER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 24px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          ✅ Approved Answers
        </span>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      </div>

      {/* NOTICE */}
      <div style={{ background: '#fffff0', border: '1px solid #f6e05e', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#744210', marginBottom: 20 }}>
        💡 Only teacher-reviewed answers appear here. New doubts may take time to appear after approval.
      </div>

      {loading && <p style={{ color: '#718096', padding: '40px 0', textAlign: 'center' }}>⏳ Loading…</p>}
      {error   && <div style={{ background: '#fff5f5', borderRadius: 6, padding: 12, color: '#c53030' }}>⚠️ {error}</div>}

      {!loading && !error && doubts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#a0aec0', fontSize: 14 }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
          <p>No approved answers yet. Be the first to ask above!</p>
        </div>
      )}

      {!loading && doubts.length > 0 && (
        <>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 16 }}>
            {doubts.length} approved answer{doubts.length !== 1 ? 's' : ''}
          </p>
          {doubts.map((d) => (
            <DoubtCard key={d._id} questionText={d.questionText}
              aiAnswer={d.aiAnswer} studentId={d.studentId} createdAt={d.createdAt} />
          ))}
        </>
      )}
    </div>
  )
}