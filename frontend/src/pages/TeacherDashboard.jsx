import React, { useState, useEffect, useCallback } from 'react'
import api from '../api'

/**
 * TeacherDashboard page — lists pending AI-drafted answers.
 * Teacher can:
 *   - Approve as-is   → PATCH /api/doubts/:id/approve
 *   - Edit + Approve  → PATCH /api/doubts/:id/edit  { approvedAnswer }
 *   - Reject          → PATCH /api/doubts/:id/reject
 *
 * State machine is enforced on the BACKEND (Mongoose enum + controller transition check).
 * This UI only reflects it — it does NOT enforce it.
 */
export default function TeacherDashboard() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // editingId: which doubt is currently in "edit mode"
  const [editingId, setEditingId] = useState(null)
  // editText: the textarea value for the currently-edited answer
  const [editText, setEditText] = useState('')
  // actionLoading: id of the doubt currently being actioned (prevent double-click)
  const [actionLoading, setActionLoading] = useState(null)
  // actionError per doubt id
  const [actionErrors, setActionErrors] = useState({})

  const fetchPending = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/doubts/pending')
      setPending(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPending() }, [fetchPending])

  const clearActionError = (id) =>
    setActionErrors((prev) => { const n = { ...prev }; delete n[id]; return n })

  const handleApprove = async (id) => {
    clearActionError(id)
    setActionLoading(id)
    try {
      await api.patch(`/doubts/${id}/approve`)
      await fetchPending()
    } catch (err) {
      setActionErrors((prev) => ({ ...prev, [id]: err.message }))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    clearActionError(id)
    setActionLoading(id)
    try {
      await api.patch(`/doubts/${id}/reject`)
      await fetchPending()
    } catch (err) {
      setActionErrors((prev) => ({ ...prev, [id]: err.message }))
    } finally {
      setActionLoading(null)
    }
  }

  const startEdit = (doubt) => {
    setEditingId(doubt._id)
    setEditText(doubt.aiAnswer)
    clearActionError(doubt._id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) {
      setActionErrors((prev) => ({ ...prev, [id]: 'Answer cannot be empty.' }))
      return
    }
    clearActionError(id)
    setActionLoading(id)
    try {
      await api.patch(`/doubts/${id}/edit`, { approvedAnswer: editText.trim() })
      setEditingId(null)
      setEditText('')
      await fetchPending()
    } catch (err) {
      setActionErrors((prev) => ({ ...prev, [id]: err.message }))
    } finally {
      setActionLoading(null)
    }
  }

  /* ─── Styles ─────────────────────────────────────────────────────────────── */
  const s = {
    heading: { fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 },
    subheading: { fontSize: 13, color: '#718096', marginBottom: 24 },
    warning: {
      background: '#fffaf0',
      border: '1px solid #fbd38d',
      borderRadius: 6,
      padding: '10px 14px',
      fontSize: 12,
      color: '#7b341e',
      marginBottom: 20,
    },
    loading: { textAlign: 'center', color: '#718096', padding: '40px 0', fontSize: 14 },
    error: {
      background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 6,
      padding: '12px 16px', color: '#c53030', fontSize: 13, marginBottom: 16,
    },
    empty: { textAlign: 'center', padding: '48px 0', color: '#a0aec0', fontSize: 14 },
    card: {
      background: '#fff',
      border: '1.5px solid #e2e8f0',
      borderRadius: 10,
      padding: '18px 20px',
      marginBottom: 20,
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    },
    cardHeader: {
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', marginBottom: 12,
    },
    questionLabel: {
      fontSize: 10, fontWeight: 700, color: '#718096',
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
    },
    question: { fontWeight: 600, fontSize: 15, color: '#1a202c', lineHeight: 1.5 },
    meta: { fontSize: 11, color: '#a0aec0', marginTop: 2 },
    pendingBadge: {
      padding: '3px 10px', borderRadius: 10, background: '#fefcbf',
      color: '#744210', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap',
    },
    draftLabel: {
      fontSize: 10, fontWeight: 700, color: '#6b46c1',
      textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
    },
    draftText: {
      background: '#faf5ff',
      border: '1px solid #d6bcfa',
      borderRadius: 6,
      padding: '10px 14px',
      fontSize: 13,
      color: '#2d3748',
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      marginBottom: 14,
    },
    editTextarea: {
      width: '100%',
      minHeight: 140,
      padding: '10px 12px',
      border: '1.5px solid #9f7aea',
      borderRadius: 6,
      fontSize: 13,
      fontFamily: 'inherit',
      resize: 'vertical',
      outline: 'none',
      color: '#2d3748',
      lineHeight: 1.6,
      marginBottom: 10,
    },
    btnRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
    btnApprove: {
      padding: '8px 18px', background: '#38a169', color: '#fff',
      border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer',
    },
    btnEdit: {
      padding: '8px 18px', background: '#3b5bdb', color: '#fff',
      border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer',
    },
    btnSave: {
      padding: '8px 18px', background: '#6b46c1', color: '#fff',
      border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer',
    },
    btnReject: {
      padding: '8px 18px', background: '#e53e3e', color: '#fff',
      border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer',
    },
    btnCancel: {
      padding: '8px 18px', background: '#e2e8f0', color: '#4a5568',
      border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer',
    },
    actionError: {
      background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 4,
      padding: '6px 10px', color: '#c53030', fontSize: 12, marginTop: 8,
    },
  }

  const isActioning = (id) => actionLoading === id
  const isEditing = (id) => editingId === id

  return (
    <div>
      <h1 style={s.heading}>Teacher Dashboard</h1>
      <p style={s.subheading}>
        Review AI-generated draft answers. Approve, edit, or reject each one.
        Only approved answers appear on the public Doubt Board.
      </p>

      <div style={s.warning}>
        ⚠️ <strong>Approval state is enforced server-side.</strong> The backend
        validates every state transition — only <code>pending → approved</code> and{' '}
        <code>pending → rejected</code> are permitted. Illegal transitions return a 400 error.
      </div>

      {loading && <p style={s.loading}>⏳ Fetching pending doubts…</p>}
      {error && <div style={s.error}>⚠️ {error}</div>}

      {!loading && !error && pending.length === 0 && (
        <div style={s.empty}>
          <p style={{ fontSize: 32 }}>✅</p>
          <p>No pending doubts — all caught up!</p>
        </div>
      )}

      {pending.map((doubt) => (
        <div key={doubt._id} style={s.card}>
          {/* Card header */}
          <div style={s.cardHeader}>
            <div>
              <p style={s.questionLabel}>Student question</p>
              <p style={s.question}>💬 {doubt.questionText}</p>
              <p style={s.meta}>
                By <strong>{doubt.studentId}</strong> ·{' '}
                {new Date(doubt.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <span style={s.pendingBadge}>⏳ PENDING</span>
          </div>

          {/* AI draft answer */}
          <p style={s.draftLabel}>🤖 AI Draft Answer</p>

          {isEditing(doubt._id) ? (
            /* Edit mode */
            <textarea
              style={s.editTextarea}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Edit the AI answer before approving…"
            />
          ) : (
            /* Read-only mode */
            <div style={s.draftText}>{doubt.aiAnswer}</div>
          )}

          {/* Action buttons */}
          <div style={s.btnRow}>
            {isEditing(doubt._id) ? (
              <>
                <button
                  style={s.btnSave}
                  onClick={() => handleSaveEdit(doubt._id)}
                  disabled={isActioning(doubt._id)}
                >
                  {isActioning(doubt._id) ? '⏳ Saving…' : '💾 Save & Approve'}
                </button>
                <button style={s.btnCancel} onClick={cancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  style={s.btnApprove}
                  onClick={() => handleApprove(doubt._id)}
                  disabled={isActioning(doubt._id)}
                >
                  {isActioning(doubt._id) ? '⏳' : '✅ Approve'}
                </button>
                <button
                  style={s.btnEdit}
                  onClick={() => startEdit(doubt)}
                  disabled={isActioning(doubt._id)}
                >
                  ✏️ Edit
                </button>
                <button
                  style={s.btnReject}
                  onClick={() => handleReject(doubt._id)}
                  disabled={isActioning(doubt._id)}
                >
                  {isActioning(doubt._id) ? '⏳' : '❌ Reject'}
                </button>
              </>
            )}
          </div>

          {actionErrors[doubt._id] && (
            <div style={s.actionError}>⚠️ {actionErrors[doubt._id]}</div>
          )}
        </div>
      ))}
    </div>
  )
}
