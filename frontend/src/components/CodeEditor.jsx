import React from 'react'

/**
 * CodeEditor — controlled textarea for student code input.
 * MVP: Python 3 only. Syntax highlighting is a Part 2 feature.
 */
export default function CodeEditor({ value, onChange }) {
  const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: 6 },
    labelRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: { fontSize: 13, fontWeight: 600, color: '#4a5568' },
    langBadge: {
      fontSize: 11,
      background: '#3b5bdb',
      color: '#fff',
      padding: '2px 8px',
      borderRadius: 10,
      fontWeight: 600,
      letterSpacing: 0.4,
    },
    textarea: {
      width: '100%',
      minHeight: 280,
      fontFamily: "'Fira Code', 'Courier New', monospace",
      fontSize: 13,
      lineHeight: 1.6,
      padding: '12px 14px',
      border: '1.5px solid #cbd5e0',
      borderRadius: 6,
      background: '#1e1e2e',
      color: '#cdd6f4',
      resize: 'vertical',
      outline: 'none',
      transition: 'border-color 0.2s',
      tabSize: 4,
    },
    hint: {
      fontSize: 11,
      color: '#a0aec0',
      marginTop: 2,
    },
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.labelRow}>
        <label style={styles.label}>Your Code</label>
        <span style={styles.langBadge}>🐍 Python 3 (MVP)</span>
      </div>
      <textarea
        style={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`# Write your Python solution here\n# Example problem: read two integers from input and print their sum\n\na, b = map(int, input().split())\nprint(a + b)`}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      <span style={styles.hint}>
        Tab = 4 spaces · stdin is simulated per test case · No network / filesystem access inside sandbox
      </span>
    </div>
  )
}
