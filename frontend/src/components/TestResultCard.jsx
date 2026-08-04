import React from 'react'

export default function TestResultCard({ input, expected, actual, pass, index }) {
  const c = { border: pass ? '#38a169' : '#e53e3e', bg: pass ? '#f0fff4' : '#fff5f5', badgeBg: pass ? '#c6f6d5' : '#fed7d7', badge: pass ? '#276749' : '#9b2c2c' }

  return (
    <div style={{ border: `1.5px solid ${c.border}`, borderRadius: 8, background: c.bg, padding: '12px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#2d3748' }}>Test Case {index + 1}</span>
        <span style={{ padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: c.badgeBg, color: c.badge }}>
          {pass ? '✅ PASSED' : '❌ FAILED'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[['Input', input, '#edf2f7', '#2d3748'], ['Expected', expected, '#edf2f7', '#2d3748'], ['Your Output', actual || '(no output)', pass ? '#c6f6d5' : '#fed7d7', pass ? '#276749' : '#9b2c2c']].map(([label, val, bg, color]) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, background: bg, padding: '4px 8px', borderRadius: 4, color, wordBreak: 'break-all', minHeight: 24 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
