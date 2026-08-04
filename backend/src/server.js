// import 'dotenv/config'
// import express from 'express'
// import cors from 'cors'
// import { connectDB } from './db.js'
// import authRouter        from './routes/auth.js'
// import submissionsRouter from './routes/submissions.js'
// import doubtsRouter      from './routes/doubts.js'
// import { errorHandler }  from './middleware/errorHandler.js'

// const app  = express()
// const PORT = process.env.PORT || 5000

// // ─── CORS — allow localhost + any onrender.com or vercel.app subdomain ────────
// app.use(cors({
//   origin: (origin, callback) => {
//     // Allow requests with no origin (Postman, curl, mobile)
//     if (!origin) return callback(null, true)
//     // Allow all Render and Vercel subdomains
//     if (
//       origin.includes('localhost') ||
//       origin.includes('onrender.com') ||
//       origin.includes('vercel.app')
//     ) {
//       return callback(null, true)
//     }
//     callback(new Error(`CORS blocked: ${origin}`))
//   },
//   credentials: true,
// }))

// app.use(express.json({ limit: '100kb' }))

// app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// app.use('/api/auth',        authRouter)
// app.use('/api/submissions', submissionsRouter)
// app.use('/api/doubts',      doubtsRouter)

// app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
// app.use(errorHandler)

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`)
//     console.log(`   Mistral model:   ${process.env.MISTRAL_MODEL || 'mistral-small-latest'}`)
//     console.log(`   Sandbox timeout: ${process.env.SANDBOX_TIMEOUT_MS || 10000}ms`)
//   })
// })



import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import authRouter        from './routes/auth.js'
import submissionsRouter from './routes/submissions.js'
import doubtsRouter      from './routes/doubts.js'
import { errorHandler }  from './middleware/errorHandler.js'

const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (
      origin.includes('localhost') ||
      origin.includes('onrender.com') ||
      origin.includes('vercel.app')
    ) {
      return callback(null, true)
    }
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
}))

app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

app.use('/api/auth',        authRouter)
app.use('/api/submissions', submissionsRouter)
app.use('/api/doubts',      doubtsRouter)

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
app.use(errorHandler)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`   Mistral model:   ${process.env.MISTRAL_MODEL || 'mistral-small-latest'}`)
    console.log(`   Sandbox timeout: ${process.env.SANDBOX_TIMEOUT_MS || 10000}ms`)
  })
})