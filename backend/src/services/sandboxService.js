/**
 * sandboxService.js
 * Per-submission Docker isolation — fresh container per run, destroyed immediately.
 *
 * SECURITY: --rm --network none --memory 128m --cpus 0.5
 * Code delivery: stdin piping (cross-platform, works on Windows Docker Desktop)
 *
 * WHY NOT persistent container: reference repo (Am4nn/Online-Judge) reuses one
 * container per language via docker exec — state leaks between students.
 * We use docker run --rm so each submission is completely isolated.
 */

import { spawn } from 'child_process'

const TIMEOUT_MS = parseInt(process.env.SANDBOX_TIMEOUT_MS || '10000', 10)

// Node image to use — alpine is smaller and pulls faster than slim
// Change this to 'node:20-slim' if you successfully pulled that image
const NODE_IMAGE = process.env.NODE_SANDBOX_IMAGE || 'node:18-alpine'

let dockerAvailable = null

async function checkDockerAvailable() {
  if (dockerAvailable !== null) return dockerAvailable
  return new Promise((resolve) => {
    const p = spawn('docker', ['info'], { stdio: 'ignore' })
    p.on('close', (code) => {
      dockerAvailable = code === 0
      if (dockerAvailable) {
        console.log('✅ Docker available — per-submission container isolation active')
        console.log(`   Python image: python:3.11-slim`)
        console.log(`   Node image:   ${NODE_IMAGE}`)
      } else {
        console.warn('⚠️  Docker unavailable. Please start Docker Desktop.')
      }
      resolve(dockerAvailable)
    })
    p.on('error', () => { dockerAvailable = false; resolve(false) })
  })
}

/**
 * wrapPython — patches builtins.input() to return the test input,
 * then exec()s the student code. Piped via stdin to `python -`.
 */
function wrapPython(studentCode, stdinInput) {
  const escapedInput = (stdinInput || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')

  const escapedCode = studentCode
    .replace(/\\/g, '\\\\')
    .replace(/"""/g, '\\"\\"\\"')

  return `
import sys, io, builtins
_input_data = '${escapedInput}\\n'
_stream = io.StringIO(_input_data)
def _patched_input(prompt=''):
    line = _stream.readline()
    return line[:-1] if line.endswith('\\n') else line
builtins.input = _patched_input
sys.stdin = io.StringIO(_input_data)
_code = """${escapedCode}"""
exec(_code, {})
`
}

/**
 * wrapJavaScript — provides a synchronous input() helper baked into
 * the script, then evals student code. Uses JSON.stringify for safe
 * embedding — no escaping issues regardless of student code content.
 */
function wrapJavaScript(studentCode, stdinInput) {
  const inputJson = JSON.stringify(stdinInput || '')
  const codeJson  = JSON.stringify(studentCode)

  return `
(function() {
  const _inputLines = ${inputJson}.split('\\n');
  let _idx = 0;
  global.input = function() {
    const line = (_inputLines[_idx] !== undefined ? _inputLines[_idx] : '');
    _idx++;
    return line.trim();
  };
  try {
    eval(${codeJson});
  } catch(e) {
    process.stderr.write(e.message + '\\n');
    process.exit(1);
  }
})();
`
}

function runInDocker(code, stdinInput = '', language = 'python') {
  return new Promise((resolve) => {
    let script, dockerArgs

    if (language === 'javascript') {
      script = wrapJavaScript(code, stdinInput)
      dockerArgs = [
        'run', '--rm',
        '--network', 'none',
        '--memory', '128m',
        '--cpus', '0.5',
        '-i',
        NODE_IMAGE,
        'node', '-',
      ]
    } else {
      script = wrapPython(code, stdinInput)
      dockerArgs = [
        'run', '--rm',
        '--network', 'none',
        '--memory', '128m',
        '--cpus', '0.5',
        '-i',
        'python:3.11-slim',
        'python', '-',
      ]
    }

    const child = spawn('docker', dockerArgs)
    let stdout = '', stderr = '', timedOut = false, settled = false

    const settle = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }

    child.stdin.write(script, 'utf8')
    child.stdin.end()

    child.stdout.on('data', (d) => { stdout += d.toString() })
    child.stderr.on('data', (d) => { stderr += d.toString() })

    const timer = setTimeout(() => {
      timedOut = true
      try { child.kill('SIGKILL') } catch (_) {}
      settle({ stdout: '', stderr: 'Execution timed out', timedOut: true, exitCode: null })
    }, TIMEOUT_MS)

    child.on('close', (exitCode) => {
      settle({ stdout: stdout.trim(), stderr: stderr.trim(), timedOut, exitCode })
    })

    child.on('error', (err) => {
      settle({ stdout: '', stderr: `Docker spawn error: ${err.message}`, timedOut: false, exitCode: 1 })
    })
  })
}

export async function run(code, stdinInput = '', language = 'python') {
  const useDocker = await checkDockerAvailable()
  if (!useDocker) {
    return {
      stdout: '', timedOut: false, exitCode: 1,
      stderr: 'Docker is not available. Please start Docker Desktop and restart the server.',
    }
  }
  return runInDocker(code, stdinInput, language)
}
