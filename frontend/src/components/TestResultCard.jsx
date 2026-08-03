import React from 'react'

/**
 * TestResultCard — shows pass/fail for a single test case.
 * Props: { input, expected, actual, pass, index }
 */
export default function TestResultCard({ input, expected, actual, pass, index }) {
  const colors = {
    border: pass ? '#38a169' : '#e53e3e',
    bg: pass ? '#f0fff4' : '#fff5f5',
    badge: pass ? '#38a169' : '#e53e3e',
    badgeBg: pass ? '#c6f6d5' : '#fed7d7',
  }

  const styles = {
    card: {
      border: `1.5px solid ${colors.border}`,
      borderRadius: 8,
      background: colors.bg,
      padding: '12px 16px',
      marginBottom: 10,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    title: { fontWeight: 700, fontSize: 13, color: '#2d3748' },
    badge: {
      padding: '2px 10px',
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 700,
      background: colors.badgeBg,
      color: colors.badge,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10,
    },
    field: { display: 'flex', flexDirection: 'column', gap: 3 },
    fieldLabel: {
      fontSize: 10,
      fontWeight: 700,
      color: '#718096',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fieldValue: {
      fontFamily: 'monospace',
      fontSize: 12,
      background: '#edf2f7',
      padding: '4px 8px',
      borderRadius: 4,
      color: '#2d3748',
      wordBreak: 'break-all',
      minHeight: 24,
    },
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Test Case {index + 1}</span>
        <span style={styles.badge}>{pass ? '✅ PASSED' : '❌ FAILED'}</span>
      </div>
      <div style={styles.grid}>
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Input</span>
          <span style={styles.fieldValue}>{input}</span>
        </div>
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Expected</span>
          <span style={styles.fieldValue}>{expected}</span>
        </div>
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Your Output</span>
          <span style={{
            ...styles.fieldValue,
            background: pass ? '#c6f6d5' : '#fed7d7',
            color: pass ? '#276749' : '#9b2c2c',
          }}>
            {actual || <em style={{ color: '#a0aec0' }}>(no output)</em>}
          </span>
        </div>
      </div>
    </div>
  )
}
