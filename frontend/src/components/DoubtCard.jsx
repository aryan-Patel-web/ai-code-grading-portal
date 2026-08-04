import React from 'react'
import MarkdownRenderer from './MarkdownRenderer'

export default function DoubtCard({ questionText, aiAnswer, studentId, createdAt }) {
  const initial = studentId ? studentId.charAt(0).toUpperCase() : '?'
  const date    = createdAt ? new Date(createdAt).toLocaleString('en-IN') : ''

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b5bdb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{initial}</div>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#2d3748' }}>{studentId || 'Anonymous'}</span>
        <span style={{ fontSize: 11, color: '#a0aec0', marginLeft: 'auto' }}>{date}</span>
      </div>
      <p style={{ fontWeight: 700, fontSize: 15, color: '#1a202c', marginBottom: 12, lineHeight: 1.5 }}>💬 {questionText}</p>
      <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '12px 0' }} />
      <div style={{ fontSize: 11, fontWeight: 700, color: '#00b8d4', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>🤖 AI Answer (teacher-approved)</div>
      <div style={{ background: '#f7fafc', borderLeft: '3px solid #00b8d4', padding: '10px 14px', borderRadius: '0 6px 6px 0' }}>
        <MarkdownRenderer text={aiAnswer} />
      </div>
    </div>
  )
}
