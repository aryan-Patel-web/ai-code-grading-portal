import React from 'react'

export default function MarkdownRenderer({ text, style = {} }) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let i = 0
  let keyCounter = 0
  const key = () => keyCounter++

  const s = {
    h3: { fontSize: 14, fontWeight: 700, color: '#2d3748', margin: '14px 0 6px 0' },
    h2: { fontSize: 15, fontWeight: 700, color: '#1a202c', margin: '16px 0 6px 0' },
    p:  { fontSize: 13, color: '#2d3748', lineHeight: 1.75, margin: '4px 0' },
    code: {
      fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 12,
      background: '#1e1e2e', color: '#cdd6f4', padding: '10px 14px',
      borderRadius: 6, display: 'block', margin: '8px 0',
      whiteSpace: 'pre', overflowX: 'auto',
    },
    li:    { fontSize: 13, color: '#2d3748', lineHeight: 1.75, marginLeft: 16, marginBottom: 2 },
    table: { borderCollapse: 'collapse', width: '100%', margin: '10px 0', fontSize: 12 },
    th:    { background: '#edf2f7', padding: '6px 10px', border: '1px solid #cbd5e0', fontWeight: 700, textAlign: 'left' },
    td:    { padding: '5px 10px', border: '1px solid #e2e8f0', color: '#2d3748' },
  }

  function parseInline(text) {
    const parts = []
    const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g
    let last = 0, match
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) parts.push(text.slice(last, match.index))
      if (match[0].startsWith('**')) {
        parts.push(<strong key={key()} style={{ fontWeight: 700 }}>{match[2]}</strong>)
      } else {
        parts.push(<code key={key()} style={{ fontFamily: 'monospace', fontSize: 12, background: '#edf2f7', padding: '1px 5px', borderRadius: 3, color: '#6b46c1' }}>{match[3]}</code>)
      }
      last = match.index + match[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts
  }

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      const codeLines = []; i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++ }
      elements.push(<pre key={key()} style={s.code}>{codeLines.join('\n')}</pre>)
      i++; continue
    }

    if (line.trim().startsWith('|')) {
      const tableRows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        tableRows.push(cells.map(c => c.trim())); i++
      }
      if (tableRows.length > 0) {
        const isHeader = tableRows.length > 1 && tableRows[1].every(c => /^[-:]+$/.test(c))
        const header = isHeader ? tableRows[0] : null
        const body   = isHeader ? tableRows.slice(2) : tableRows
        elements.push(
          <table key={key()} style={s.table}>
            {header && <thead><tr>{header.map((h, hi) => <th key={hi} style={s.th}>{parseInline(h)}</th>)}</tr></thead>}
            <tbody>{body.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f7fafc' }}>
                {row.map((cell, ci) => <td key={ci} style={s.td}>{parseInline(cell)}</td>)}
              </tr>
            ))}</tbody>
          </table>
        )
      }
      continue
    }

    if (line.startsWith('### ')) { elements.push(<h3 key={key()} style={s.h3}>{parseInline(line.slice(4))}</h3>); i++; continue }
    if (line.startsWith('## '))  { elements.push(<h2 key={key()} style={s.h2}>{parseInline(line.slice(3))}</h2>); i++; continue }
    if (line.startsWith('# '))   { elements.push(<h2 key={key()} style={{ ...s.h2, fontSize: 17 }}>{parseInline(line.slice(2))}</h2>); i++; continue }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const bulletLines = []
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        bulletLines.push(lines[i].trim().slice(2)); i++
      }
      elements.push(
        <ul key={key()} style={{ margin: '6px 0', paddingLeft: 0, listStyle: 'none' }}>
          {bulletLines.map((bl, bi) => <li key={bi} style={s.li}>• {parseInline(bl)}</li>)}
        </ul>
      )
      continue
    }

    if (line.trim() === '' || line.trim() === '---') { elements.push(<div key={key()} style={{ height: 6 }} />); i++; continue }

    elements.push(<p key={key()} style={s.p}>{parseInline(line)}</p>)
    i++
  }

  return <div style={style}>{elements}</div>
}
