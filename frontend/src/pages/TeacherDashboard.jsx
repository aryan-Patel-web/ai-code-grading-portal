import React, { useState, useEffect, useCallback } from 'react'
import api from '../api'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function TeacherDashboard() {
  const [pending, setPending]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [editingId, setEditingId]     = useState(null)
  const [editText, setEditText]       = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [actionErrors, setActionErrors]   = useState({})

  const fetchPending = useCallback(async () => {
    setLoading(true); setError('')
    try { const { data } = await api.get('/doubts/pending'); setPending(data) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPending() }, [fetchPending])

  const clearErr = (id) => setActionErrors((prev) => { const n = { ...prev }; delete n[id]; return n })

  const handleApprove = async (id) => {
    clearErr(id); setActionLoading(id)
    try { await api.patch(`/doubts/${id}/approve`); await fetchPending() }
    catch (err) { setActionErrors((prev) => ({ ...prev, [id]: err.message })) }
    finally { setActionLoading(null) }
  }

  const handleReject = async (id) => {
    clearErr(id); setActionLoading(id)
    try { await api.patch(`/doubts/${id}/reject`); await fetchPending() }
    catch (err) { setActionErrors((prev) => ({ ...prev, [id]: err.message })) }
    finally { setActionLoading(null) }
  }

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) { setActionErrors((prev) => ({ ...prev, [id]: 'Answer cannot be empty.' })); return }
    clearErr(id); setActionLoading(id)
    try {
      await api.patch(`/doubts/${id}/edit`, { approvedAnswer: editText.trim() })
      setEditingId(null); setEditText(''); await fetchPending()
    } catch (err) { setActionErrors((prev) => ({ ...prev, [id]: err.message })) }
    finally { setActionLoading(null) }
  }

  const s = {
    card:    { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '18px 20px', marginBottom: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
    draftBox:{ background: '#faf5ff', border: '1px solid #d6bcfa', borderRadius: 6, padding: '12px 14px', marginBottom: 14, maxHeight: 420, overflowY: 'auto' },
    editTA:  { width: '100%', minHeight: 180, padding: '10px 12px', border: '1.5px solid #9f7aea', borderRadius: 6, fontSize: 13, fontFamily: "'Fira Code', monospace", resize: 'vertical', outline: 'none', color: '#2d3748', lineHeight: 1.6, marginBottom: 10 },
    previewBox: { background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 6, padding: '10px 14px', marginBottom: 10, maxHeight: 300, overflowY: 'auto' },
    btnRow:  { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
    btnApprove: { padding: '8px 18px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
    btnEdit:    { padding: '8px 18px', background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
    btnSave:    { padding: '8px 18px', background: '#6b46c1', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
    btnReject:  { padding: '8px 18px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
    btnCancel:  { padding: '8px 18px', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 }}>Teacher Dashboard</h1>
      <p style={{ fontSize: 13, color: '#718096', marginBottom: 24 }}>Review AI-generated draft answers. Only approved answers appear on the public Doubt Board.</p>

      <div style={{ background: '#fffaf0', border: '1px solid #fbd38d', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#7b341e', marginBottom: 20 }}>
        ⚠️ <strong>Approval state is enforced server-side.</strong> Only <code>pending → approved</code> and <code>pending → rejected</code> transitions are permitted. Illegal transitions return 400.
      </div>

      {loading && <p style={{ color: '#718096', padding: '40px 0', textAlign: 'center' }}>⏳ Fetching pending doubts…</p>}
      {error   && <div style={{ background: '#fff5f5', borderRadius: 6, padding: 12, color: '#c53030', marginBottom: 16 }}>⚠️ {error}</div>}

      {!loading && !error && pending.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#a0aec0', fontSize: 14 }}>
          <p style={{ fontSize: 32 }}>✅</p><p>No pending doubts — all caught up!</p>
        </div>
      )}

      {pending.map((doubt) => (
        <div key={doubt._id} style={s.card}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase', marginBottom: 4 }}>Student question</p>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1a202c', lineHeight: 1.5 }}>💬 {doubt.questionText}</p>
              <p style={{ fontSize: 11, color: '#a0aec0', marginTop: 2 }}>By <strong>{doubt.studentId}</strong> · {new Date(doubt.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <span style={{ padding: '3px 10px', borderRadius: 10, background: '#fefcbf', color: '#744210', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>⏳ PENDING</span>
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, color: '#6b46c1', textTransform: 'uppercase', marginBottom: 8 }}>🤖 AI Draft Answer</p>

          {editingId === doubt._id ? (
            <>
              <textarea style={s.editTA} value={editText} onChange={(e) => setEditText(e.target.value)} placeholder="Edit the AI answer…" />
              <p style={{ fontSize: 11, color: '#a0aec0', marginBottom: 10 }}>Supports **bold**, `code`, ### headings</p>
              {editText.trim() && (
                <div style={s.previewBox}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#276749', marginBottom: 6 }}>👁 PREVIEW</p>
                  <MarkdownRenderer text={editText} />
                </div>
              )}
            </>
          ) : (
            <div style={s.draftBox}><MarkdownRenderer text={doubt.aiAnswer} /></div>
          )}

          <div style={s.btnRow}>
            {editingId === doubt._id ? (
              <>
                <button style={s.btnSave}   onClick={() => handleSaveEdit(doubt._id)} disabled={actionLoading === doubt._id}>{actionLoading === doubt._id ? '⏳' : '💾 Save & Approve'}</button>
                <button style={s.btnCancel} onClick={() => { setEditingId(null); setEditText('') }}>Cancel</button>
              </>
            ) : (
              <>
                <button style={s.btnApprove} onClick={() => handleApprove(doubt._id)} disabled={actionLoading === doubt._id}>{actionLoading === doubt._id ? '⏳' : '✅ Approve'}</button>
                <button style={s.btnEdit}    onClick={() => { setEditingId(doubt._id); setEditText(doubt.aiAnswer) }} disabled={actionLoading === doubt._id}>✏️ Edit</button>
                <button style={s.btnReject}  onClick={() => handleReject(doubt._id)}  disabled={actionLoading === doubt._id}>{actionLoading === doubt._id ? '⏳' : '❌ Reject'}</button>
              </>
            )}
          </div>

          {actionErrors[doubt._id] && (
            <div style={{ background: '#fff5f5', borderRadius: 4, padding: '6px 10px', color: '#c53030', fontSize: 12, marginTop: 8 }}>⚠️ {actionErrors[doubt._id]}</div>
          )}
        </div>
      ))}
    </div>
  )
}
