import React from 'react'

export default function CodeEditor({ value, onChange, language = 'python' }) {
  const placeholder = language === 'javascript'
    ? `// JavaScript solution\nconst parts = input().split(' ');\nconst a = parseInt(parts[0]);\nconst b = parseInt(parts[1]);\nconsole.log(a + b);`
    : `# Python solution\na, b = map(int, input().split())\nprint(a + b)`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568' }}>Your Code</label>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
          background: language === 'javascript' ? '#fefcbf' : '#3b5bdb',
          color: language === 'javascript' ? '#744210' : '#fff',
        }}>
          {language === 'javascript' ? '🟨 JavaScript (Node 20)' : '🐍 Python 3.11'}
        </span>
      </div>
      <textarea
        style={{
          width: '100%', minHeight: 280,
          fontFamily: "'Fira Code', 'Courier New', monospace",
          fontSize: 13, lineHeight: 1.6, padding: '12px 14px',
          border: '1.5px solid #cbd5e0', borderRadius: 6,
          background: '#1e1e2e', color: '#cdd6f4',
          resize: 'vertical', outline: 'none', tabSize: 4,
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
      />
      <span style={{ fontSize: 11, color: '#a0aec0' }}>
        stdin simulated per test case · --network=none · --memory=128m inside Docker sandbox
      </span>
    </div>
  )
}
