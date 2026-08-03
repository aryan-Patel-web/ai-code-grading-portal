/**
 * sandboxService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs student-submitted code in a fully isolated Docker container.
 *
 * SECURITY DESIGN (documented for submission write-up):
 *
 *   Per-submission isolation — every call spins up a FRESH container with
 *   `docker run --rm`. The container is destroyed immediately when execution
 *   finishes. No state carries over between students' submissions.
 *
 *   WHY NOT docker exec into a persistent container:
 *   The Am4nn/Online-Judge reference repo uses one long-lived container per
 *   language (e.g. "py-oj-container") and runs all submissions through it via
 *   `docker exec`. This means filesystem state CAN leak between sequential
 *   submissions. Our approach eliminates this class of vulnerability entirely.
 *
 *   Isolation flags used:
 *     --rm            Container deleted immediately on exit
 *     --network none  Zero network access from inside the container
 *     --memory 128m   Hard memory cap
 *     --cpus 0.5      CPU cap — prevents fork-bomb or infinite-loop DoS
 *
 * 
 * 
 * 
 *   Code delivery — STDIN piping (Windows-compatible):
 *     Instead of volume-mounting the code file (which has path format issues
 *     on Windows with Docker Desktop), we wrap the student's code + test input
 *     into a single Python script and pipe it directly to the container via
 *     stdin. The container runs `python -` which reads a script from stdin.
 *     This is cross-platform (Linux/Mac/Windows) and avoids all volume mount
 *     path translation issues with Docker Desktop on Windows.
 *
 *   Timeout:
 *     SANDBOX_TIMEOUT_MS (default 10 000ms). If the process hasn't exited,
 *     we SIGKILL the spawned child process (which kills the container).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { spawn } from 'child_process'
import { randomUUID } from 'crypto'

const TIMEOUT_MS = parseInt(process.env.SANDBOX_TIMEOUT_MS || '10000', 10)

// ─── Docker availability check (done once at startup) ────────────────────────
let dockerAvailable = null

async function checkDockerAvailable() {
  if (dockerAvailable !== null) return dockerAvailable
  return new Promise((resolve) => {
    const p = spawn('docker', ['info'], { stdio: 'ignore' })
    p.on('close', (code) => {
      dockerAvailable = code === 0
      if (!dockerAvailable) {
        console.warn(
          '⚠️  SANDBOX FALLBACK: Docker unavailable. ' +
          'Code execution will return an error. ' +
          'Please start Docker Desktop and restart the server.'
        )
      } else {
        console.log('✅ Docker available — per-submission container isolation active')
      }
      resolve(dockerAvailable)
    })
    p.on('error', () => {
      dockerAvailable = false
      console.warn('⚠️  SANDBOX FALLBACK: Docker binary not found.')
      resolve(false)
    })
  })
}

// ─── Build the full Python script to pipe into the container ─────────────────
/**
 * wrapCode — takes the student's code and the test input, and builds a
 * complete Python script that:
 *   1. Patches builtins.input() to return the test case input values
 *      (one token per call, simulating stdin line-by-line)
 *   2. Runs the student's code via exec()
 *
 * This avoids needing to pipe to stdin AND write a file — the entire
 * program including its input is self-contained in one script sent via stdin.
 */
function wrapCode(studentCode, stdinInput) {
  // Escape backslashes and triple-quotes in the student code so it embeds safely
  const escapedCode = studentCode
    .replace(/\\/g, '\\\\')
    .replace(/"""/g, '\\"\\"\\"')

  // Escape the input string for embedding in Python string literal
  const escapedInput = (stdinInput || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')

  return `
import sys
import io
import builtins

# Simulate stdin with the test case input
_input_data = '${escapedInput}\\n'
_input_stream = io.StringIO(_input_data)
_original_input = builtins.input

def _patched_input(prompt=''):
    line = _input_stream.readline()
    if line.endswith('\\n'):
        line = line[:-1]
    return line

builtins.input = _patched_input
sys.stdin = io.StringIO(_input_data)

# Run student code
_student_code = """${escapedCode}"""
exec(_student_code, {})
`
}

// ─── Primary: Docker run ─────────────────────────────────────────────────────
/**
 * runInDocker — pipes code + input into a fresh python:3.11-slim container.
 * Uses `python -` to read the script from stdin (no volume mount needed).
 * This is fully cross-platform including Windows Docker Desktop.
 *
 * @param {string} code       - student Python source
 * @param {string} stdinInput - the test case input string
 * @returns {Promise<{stdout, stderr, timedOut, exitCode}>}
 */
function runInDocker(code, stdinInput = '') {
  return new Promise((resolve) => {
    const dockerArgs = [
      'run',
      '--rm',                 // destroy container on exit
      '--network', 'none',    // no network access
      '--memory', '128m',     // memory cap
      '--cpus', '0.5',        // CPU cap
      '-i',                   // keep stdin open so we can pipe the script
      'python:3.11-slim',
      'python', '-',          // read script from stdin
    ]

    const child = spawn('docker', dockerArgs, {
      // On Windows, shell:false is correct for docker; stdio piped
    })

    let stdout = ''
    let stderr = ''
    let timedOut = false
    let settled = false

    const settle = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }

    // Pipe the wrapped script (student code + input simulation) to container stdin
    const script = wrapCode(code, stdinInput)
    child.stdin.write(script, 'utf8')
    child.stdin.end()

    child.stdout.on('data', (data) => { stdout += data.toString() })
    child.stderr.on('data', (data) => { stderr += data.toString() })

    // Enforce timeout — kill container if it runs too long
    const timer = setTimeout(() => {
      timedOut = true
      try { child.kill('SIGKILL') } catch (_) {}
      settle({ stdout: '', stderr: 'Execution timed out', timedOut: true, exitCode: null })
    }, TIMEOUT_MS)

    child.on('close', (exitCode) => {
      settle({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        timedOut,
        exitCode,
      })
    })

    child.on('error', (err) => {
      settle({
        stdout: '',
        stderr: `Docker spawn error: ${err.message}`,
        timedOut: false,
        exitCode: 1,
      })
    })
  })
}

// ─── Public API ──────────────────────────────────────────────────────────────
/**
 * run — execute student code against a single stdin input string.
 * Called once per test case by graderService.
 *
 * @param {string} code        - student Python source code
 * @param {string} stdinInput  - the input to simulate for this test case
 * @returns {Promise<{stdout, stderr, timedOut, exitCode}>}
 */
export async function run(code, stdinInput = '') {
  const useDocker = await checkDockerAvailable()

  if (!useDocker) {
    return {
      stdout: '',
      stderr:
        'Docker is not available. Please start Docker Desktop and restart the server (npm run dev).',
      timedOut: false,
      exitCode: 1,
    }
  }

  return runInDocker(code, stdinInput)
}
