/**
 * graderService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs student code against each test case in the sandbox and compares output.
 *
 * TIME-TRADEOFF (README §9 tradeoff #2):
 *   Test cases are hardcoded here for MVP. In production they would be stored
 *   per-problem in MongoDB and loaded by problem ID. Hardcoding proves the
 *   grading engine end-to-end without adding DB schema complexity.
 *
 * Problem (MVP): Read two space-separated integers and print their sum.
 *   Input:  "1 2"   → Expected output: "3"
 *   Input:  "-5 5"  → Expected output: "0"
 *   etc.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { run } from './sandboxService.js'

// ─── Hardcoded test cases for MVP problem ────────────────────────────────────
// TIME-TRADEOFF: hardcoded. Production: stored in DB per problem.
export const TEST_CASES = [
  { input: '1 2',     expected: '3'   },
  { input: '10 20',   expected: '30'  },
  { input: '-5 5',    expected: '0'   },
  { input: '0 0',     expected: '0'   },
  { input: '100 200', expected: '300' },
]

/**
 * grade — runs the student's code against every test case sequentially.
 * Each test case gets its own fresh sandbox container invocation.
 *
 * @param {string}   code       - student Python source code
 * @param {Array}    testCases  - defaults to MVP TEST_CASES
 * @returns {Promise<{
 *   passed: number,
 *   total: number,
 *   results: Array<{input, expected, actual, pass, timedOut, stderr}>
 * }>}
 */
export async function grade(code, testCases = TEST_CASES) {
  const results = []

  for (const tc of testCases) {
    let result

    try {
      result = await run(code, tc.input)
    } catch (err) {
      // Unexpected sandbox error — treat as a failed test case
      results.push({
        input:    tc.input,
        expected: tc.expected,
        actual:   '',
        pass:     false,
        timedOut: false,
        stderr:   `Sandbox error: ${err.message}`,
      })
      continue
    }

    const { stdout, stderr, timedOut } = result

    // Normalize: trim whitespace from both sides for comparison
    const actual   = stdout.trim()
    const expected = tc.expected.trim()
    const pass     = !timedOut && actual === expected

    results.push({
      input:    tc.input,
      expected: tc.expected,
      actual:   timedOut ? '[TIMEOUT]' : actual,
      pass,
      timedOut,
      stderr:   stderr || '',
    })
  }

  const passed = results.filter((r) => r.pass).length

  return {
    passed,
    total: results.length,
    results,
  }
}
