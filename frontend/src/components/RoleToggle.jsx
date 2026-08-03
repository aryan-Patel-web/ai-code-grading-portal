import React from 'react'

/**
 * RoleToggle — switches between student and teacher view.
 *
 * TIME-TRADEOFF (README §9, tradeoff #1):
 * This is a purely client-side state flag — there is no authentication.
 * A real deployment would use JWT-protected routes. Documented honestly in the
 * submission write-up.
 */
export default function RoleToggle({ role, setRole }) {
  const isTeacher = role === 'teacher'

  const style = {
    button: {
      padding: '5px 14px',
      borderRadius: 4,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: 13,
      background: isTeacher ? '#f59e0b' : '#00b8d4',
      color: '#fff',
      transition: 'background 0.2s',
      marginLeft: 8,
    },
    label: {
      fontSize: 11,
      color: isTeacher ? '#f59e0b' : '#6ee7f7',
      marginLeft: 8,
      fontWeight: 500,
      letterSpacing: 0.3,
    },
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={style.label}>
        {isTeacher ? '👩‍🏫 TEACHER' : '👨‍🎓 STUDENT'}
      </span>
      <button
        style={style.button}
        onClick={() => setRole(isTeacher ? 'student' : 'teacher')}
        title="Toggle role (no real auth — MVP tradeoff)"
      >
        {isTeacher ? 'Switch to Student' : 'Switch to Teacher'}
      </button>
    </div>
  )
}
