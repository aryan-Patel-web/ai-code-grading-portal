import { run } from './sandboxService.js'
import { getCodeFeedback } from './mistralService.js'

export const PYTHON_TEST_CASES = [
  { input: '1 2',     expected: '3'   },
  { input: '10 20',   expected: '30'  },
  { input: '-5 5',    expected: '0'   },
  { input: '0 0',     expected: '0'   },
  { input: '100 200', expected: '300' },
]

export const JS_TEST_CASES = [
  { input: '1 2',     expected: '3'   },
  { input: '10 20',   expected: '30'  },
  { input: '-5 5',    expected: '0'   },
  { input: '0 0',     expected: '0'   },
  { input: '100 200', expected: '300' },
]

export async function grade(code, language = 'python') {
  const testCases = language === 'javascript' ? JS_TEST_CASES : PYTHON_TEST_CASES
  const results = []

  for (const tc of testCases) {
    let result
    try {
      result = await run(code, tc.input, language)
    } catch (err) {
      results.push({ input: tc.input, expected: tc.expected, actual: '', pass: false, timedOut: false, stderr: `Sandbox error: ${err.message}` })
      continue
    }
    const { stdout, stderr, timedOut } = result
    const actual   = stdout.trim()
    const expected = tc.expected.trim()
    const pass     = !timedOut && actual === expected
    results.push({ input: tc.input, expected: tc.expected, actual: timedOut ? '[TIMEOUT]' : actual, pass, timedOut, stderr: stderr || '' })
  }

  const passed = results.filter((r) => r.pass).length

  // Part 2: AI code feedback (non-fatal if it fails)
  let aiFeedback = null
  try {
    aiFeedback = await getCodeFeedback(code, language)
  } catch (err) {
    console.error('AI feedback failed (non-fatal):', err.message)
  }

  return { passed, total: results.length, results, aiFeedback }
}
