/**
 * sandboxService.js
 * Per-submission Docker isolation — fresh container per run, destroyed immediately.
 * WHY NOT persistent container: reference repo (Am4nn/Online-Judge) reuses one container
 * per language via docker exec — state leaks between students. We use docker run --rm
 * so each submission is completely isolated. See README §10.
 *
 * Security flags: --rm --network none --memory 128m --cpus 0.5
 * Code delivery: stdin piping (cross-platform, no volume mount path issues on Windows)
 */

import { spawn } from 'child_process'

const TIMEOUT_MS = parseInt(process.env.SANDBOX_TIMEOUT_MS || '10000', 10)

let dockerAvailable = null

async function checkDockerAvailable() {
  if (dockerAvailable !== null) return dockerAvailable
  return new Promise((resolve) => {
    const p = spawn('docker', ['info'], { stdio: 'ignore' })
    p.on('close', (code) => {
      dockerAvailable = code === 0
      if (dockerAvailable) {
        console.log('✅ Docker available — per-submission container isolation active')
      } else {
        console.warn('⚠️  Docker unavailable. Please start Docker Desktop.')
      }
      resolve(dockerAvailable)
    })
    p.on('error', () => { dockerAvailable = false; resolve(false) })
  })
}

function getDockerImage(language) {
  return language === 'javascript' ? 'node:20-slim' : 'python:3.11-slim'
}

function wrapCode(studentCode, stdinInput, language) {
  if (language === 'javascript') {
    const escapedInput = (stdinInput || '').replace(/\\/g, '\\\\').replace(/`/g, '\\`')
    return `
const _inputLines = \`${escapedInput}\`.split('\\n');
let _inputIndex = 0;
function input() {
  const line = _inputLines[_inputIndex] || '';
  _inputIndex++;
  return line.trim();
}
${studentCode}
`
  }
  // Python
  const escapedInput = (stdinInput || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
  const escapedCode  = studentCode.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')
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

function runInDocker(code, stdinInput = '', language = 'python') {
  return new Promise((resolve) => {
    const image = getDockerImage(language)
    const dockerArgs = [
      'run', '--rm', '--network', 'none',
      '--memory', '128m', '--cpus', '0.5', '-i',
      image, language === 'javascript' ? 'node' : 'python', '-',
    ]

    const child = spawn('docker', dockerArgs)
    let stdout = '', stderr = '', timedOut = false, settled = false

    const settle = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }

    child.stdin.write(wrapCode(code, stdinInput, language), 'utf8')
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
      settle({ stdout: '', stderr: `Spawn error: ${err.message}`, timedOut: false, exitCode: 1 })
    })
  })
}

export async function run(code, stdinInput = '', language = 'python') {
  const useDocker = await checkDockerAvailable()
  if (!useDocker) {
    return { stdout: '', timedOut: false, exitCode: 1, stderr: 'Docker is not available. Please start Docker Desktop.' }
  }
  return runInDocker(code, stdinInput, language)
}
