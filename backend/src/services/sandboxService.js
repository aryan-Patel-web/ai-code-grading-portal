// /**
//  * sandboxService.js
//  *
//  * TWO execution modes:
//  *
//  * 1. DOCKER (local/production with Docker) — per-submission isolated container
//  *    --rm --network none --memory 128m --cpus 0.5
//  *    This is the secure, evaluated sandbox approach.
//  *
//  * 2. SUBPROCESS FALLBACK (Render/no-Docker environments) — spawns python3/node
//  *    directly on the host with a timeout. Less isolated but functional for demo.
//  *    Clearly labeled as a deployment tradeoff in README.
//  */

// import { spawn } from 'child_process'
// import { writeFileSync, unlinkSync, existsSync } from 'fs'
// import { join } from 'path'
// import { tmpdir } from 'os'
// import { randomUUID } from 'crypto'

// const TIMEOUT_MS       = parseInt(process.env.SANDBOX_TIMEOUT_MS || '10000', 10)
// const NODE_IMAGE       = process.env.NODE_SANDBOX_IMAGE || 'node:18-alpine'

// // ─── Docker availability (checked once) ──────────────────────────────────────
// let dockerAvailable = null

// async function checkDockerAvailable() {
//   if (dockerAvailable !== null) return dockerAvailable
//   return new Promise((resolve) => {
//     const p = spawn('docker', ['info'], { stdio: 'ignore' })
//     p.on('close', (code) => {
//       dockerAvailable = code === 0
//       if (dockerAvailable) {
//         console.log('✅ Docker available — per-submission container isolation active')
//         console.log(`   Python image: python:3.11-slim`)
//         console.log(`   Node image:   ${NODE_IMAGE}`)
//       } else {
//         console.warn('⚠️  Docker unavailable — using subprocess fallback (deployment mode)')
//       }
//       resolve(dockerAvailable)
//     })
//     p.on('error', () => {
//       dockerAvailable = false
//       console.warn('⚠️  Docker not found — using subprocess fallback (deployment mode)')
//       resolve(false)
//     })
//   })
// }

// // ─── Code wrappers ────────────────────────────────────────────────────────────
// function wrapPython(studentCode, stdinInput) {
//   const escapedInput = (stdinInput || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
//   const escapedCode  = studentCode.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')
//   return `
// import sys, io, builtins
// _input_data = '${escapedInput}\\n'
// _stream = io.StringIO(_input_data)
// def _patched_input(prompt=''):
//     line = _stream.readline()
//     return line[:-1] if line.endswith('\\n') else line
// builtins.input = _patched_input
// sys.stdin = io.StringIO(_input_data)
// _code = """${escapedCode}"""
// exec(_code, {})
// `
// }

// function wrapJavaScript(studentCode, stdinInput) {
//   const inputJson = JSON.stringify(stdinInput || '')
//   return `
// (function() {
//   const _inputLines = ${inputJson}.split('\\n');
//   let _idx = 0;
//   global.input = function() {
//     const line = (_inputLines[_idx] !== undefined ? _inputLines[_idx] : '');
//     _idx++;
//     return line.trim();
//   };
//   try { eval(${JSON.stringify(studentCode)}); }
//   catch(e) { process.stderr.write(e.message + '\\n'); process.exit(1); }
// })();
// `
// }

// // ─── Spawn helper (shared by Docker and subprocess modes) ─────────────────────
// function spawnWithTimeout(cmd, args, stdinData, opts = {}) {
//   return new Promise((resolve) => {
//     const child   = spawn(cmd, args, opts)
//     let stdout = '', stderr = '', timedOut = false, settled = false

//     const settle = (result) => {
//       if (settled) return
//       settled = true
//       clearTimeout(timer)
//       resolve(result)
//     }

//     if (stdinData) {
//       child.stdin.write(stdinData, 'utf8')
//       child.stdin.end()
//     }

//     child.stdout?.on('data', (d) => { stdout += d.toString() })
//     child.stderr?.on('data', (d) => { stderr += d.toString() })

//     const timer = setTimeout(() => {
//       timedOut = true
//       try { child.kill('SIGKILL') } catch (_) {}
//       settle({ stdout: '', stderr: 'Execution timed out', timedOut: true, exitCode: null })
//     }, TIMEOUT_MS)

//     child.on('close', (exitCode) => settle({ stdout: stdout.trim(), stderr: stderr.trim(), timedOut, exitCode }))
//     child.on('error', (err) => settle({ stdout: '', stderr: `Error: ${err.message}`, timedOut: false, exitCode: 1 }))
//   })
// }

// // ─── Mode 1: Docker (secure, local) ──────────────────────────────────────────
// function runInDocker(code, stdinInput, language) {
//   const isJS   = language === 'javascript'
//   const image  = isJS ? NODE_IMAGE : 'python:3.11-slim'
//   const cmd    = isJS ? 'node' : 'python'
//   const script = isJS ? wrapJavaScript(code, stdinInput) : wrapPython(code, stdinInput)

//   const args = [
//     'run', '--rm', '--network', 'none',
//     '--memory', '128m', '--cpus', '0.5', '-i',
//     image, cmd, '-',
//   ]
//   return spawnWithTimeout('docker', args, script)
// }

// // ─── Mode 2: Subprocess fallback (Render / no Docker) ────────────────────────
// // Writes code to a temp file, runs python3 or node directly.
// // TIME-TRADEOFF: no container isolation — documented in README as deployment tradeoff.
// async function runSubprocess(code, stdinInput, language) {
//   const uuid     = randomUUID()
//   const isJS     = language === 'javascript'
//   const ext      = isJS ? '.js' : '.py'
//   const tmpFile  = join(tmpdir(), `${uuid}${ext}`)
//   const script   = isJS ? wrapJavaScript(code, stdinInput) : wrapPython(code, stdinInput)

//   try {
//     writeFileSync(tmpFile, script, 'utf8')
//   } catch (err) {
//     return { stdout: '', stderr: `Failed to write temp file: ${err.message}`, timedOut: false, exitCode: 1 }
//   }

//   // Try python3 first, then python for Python; node for JS
//   const pythonCmd = await findCommand(['python3', 'python'])
//   const cmd       = isJS ? 'node' : pythonCmd

//   if (!cmd) {
//     try { if (existsSync(tmpFile)) unlinkSync(tmpFile) } catch (_) {}
//     return {
//       stdout: '',
//       stderr: `Runtime not found: ${isJS ? 'node' : 'python3/python'} is not installed on the server.`,
//       timedOut: false,
//       exitCode: 1,
//     }
//   }

//   const result = await spawnWithTimeout(cmd, [tmpFile], null)

//   try { if (existsSync(tmpFile)) unlinkSync(tmpFile) } catch (_) {}
//   return result
// }

// // Find first available command
// function findCommand(candidates) {
//   return new Promise((resolve) => {
//     let i = 0
//     const tryNext = () => {
//       if (i >= candidates.length) return resolve(null)
//       const cmd = candidates[i++]
//       const p   = spawn(cmd, ['--version'], { stdio: 'ignore' })
//       p.on('close', (code) => code === 0 ? resolve(cmd) : tryNext())
//       p.on('error', () => tryNext())
//     }
//     tryNext()
//   })
// }

// // ─── Public API ───────────────────────────────────────────────────────────────
// export async function run(code, stdinInput = '', language = 'python') {
//   const useDocker = await checkDockerAvailable()

//   if (useDocker) {
//     return runInDocker(code, stdinInput, language)
//   }

//   // Subprocess fallback — works on Render, Vercel, any server with python3/node
//   return runSubprocess(code, stdinInput, language)
// }



import { spawn } from 'child_process'
import { writeFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'

const TIMEOUT_MS = parseInt(process.env.SANDBOX_TIMEOUT_MS || '10000', 10)
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
        console.warn('⚠️  Docker unavailable — using subprocess fallback (deployment mode)')
      }
      resolve(dockerAvailable)
    })
    p.on('error', () => { dockerAvailable = false; resolve(false) })
  })
}

function wrapPython(studentCode, stdinInput) {
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

function wrapJavaScript(studentCode, stdinInput) {
  const inputJson = JSON.stringify(stdinInput || '')
  return `
(function() {
  const _inputLines = ${inputJson}.split('\\n');
  let _idx = 0;
  global.input = function() {
    const line = (_inputLines[_idx] !== undefined ? _inputLines[_idx] : '');
    _idx++;
    return line.trim();
  };
  try { eval(${JSON.stringify(studentCode)}); }
  catch(e) { process.stderr.write(e.message + '\\n'); process.exit(1); }
})();
`
}

function spawnWithTimeout(cmd, args, stdinData, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, opts)
    let stdout = '', stderr = '', timedOut = false, settled = false

    const settle = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }

    if (stdinData) {
      child.stdin.write(stdinData, 'utf8')
      child.stdin.end()
    }

    child.stdout?.on('data', (d) => { stdout += d.toString() })
    child.stderr?.on('data', (d) => { stderr += d.toString() })

    const timer = setTimeout(() => {
      timedOut = true
      try { child.kill('SIGKILL') } catch (_) {}
      settle({ stdout: '', stderr: 'Execution timed out', timedOut: true, exitCode: null })
    }, TIMEOUT_MS)

    child.on('close', (exitCode) => settle({ stdout: stdout.trim(), stderr: stderr.trim(), timedOut, exitCode }))
    child.on('error', (err) => settle({ stdout: '', stderr: `Error: ${err.message}`, timedOut: false, exitCode: 1 }))
  })
}

function runInDocker(code, stdinInput, language) {
  const isJS   = language === 'javascript'
  const image  = isJS ? NODE_IMAGE : 'python:3.11-slim'
  const cmd    = isJS ? 'node' : 'python'
  const script = isJS ? wrapJavaScript(code, stdinInput) : wrapPython(code, stdinInput)
  const args   = ['run', '--rm', '--network', 'none', '--memory', '128m', '--cpus', '0.5', '-i', image, cmd, '-']
  return spawnWithTimeout('docker', args, script)
}

function findCommand(candidates) {
  return new Promise((resolve) => {
    let i = 0
    const tryNext = () => {
      if (i >= candidates.length) return resolve(null)
      const cmd = candidates[i++]
      const p   = spawn(cmd, ['--version'], { stdio: 'ignore' })
      p.on('close', (code) => code === 0 ? resolve(cmd) : tryNext())
      p.on('error', () => tryNext())
    }
    tryNext()
  })
}

async function runSubprocess(code, stdinInput, language) {
  const uuid    = randomUUID()
  const isJS    = language === 'javascript'
  const ext     = isJS ? '.js' : '.py'
  const tmpFile = join(tmpdir(), `${uuid}${ext}`)
  const script  = isJS ? wrapJavaScript(code, stdinInput) : wrapPython(code, stdinInput)

  try {
    writeFileSync(tmpFile, script, 'utf8')
  } catch (err) {
    return { stdout: '', stderr: `Failed to write temp file: ${err.message}`, timedOut: false, exitCode: 1 }
  }

  const pythonCmd = await findCommand(['python3', 'python'])
  const cmd       = isJS ? 'node' : pythonCmd

  if (!cmd) {
    try { if (existsSync(tmpFile)) unlinkSync(tmpFile) } catch (_) {}
    return { stdout: '', stderr: `Runtime not found on server.`, timedOut: false, exitCode: 1 }
  }

  const result = await spawnWithTimeout(cmd, [tmpFile], null)
  try { if (existsSync(tmpFile)) unlinkSync(tmpFile) } catch (_) {}
  return result
}

export async function run(code, stdinInput = '', language = 'python') {
  const useDocker = await checkDockerAvailable()
  if (useDocker) return runInDocker(code, stdinInput, language)
  return runSubprocess(code, stdinInput, language)
}