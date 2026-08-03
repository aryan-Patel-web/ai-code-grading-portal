import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db.js'
import submissionsRouter from './routes/submissions.js'
import doubtsRouter from './routes/doubts.js'
import { errorHandler } from './middleware/errorHandler.js'



const app = express()
const PORT = process.env.PORT || 5000

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'], // Vite dev + preview
  credentials: false,
}))
app.use(express.json({ limit: '100kb' })) // cap request body size

// ─── Health check (useful for verifying the server is up) ────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/submissions', submissionsRouter)
app.use('/api/doubts', doubtsRouter)

// ─── 404 catch-all ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ─── Central error handler (must be last, 4-arg signature) ───────────────────
app.use(errorHandler)

// ─── Start ───────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`   Sandbox timeout: ${process.env.SANDBOX_TIMEOUT_MS || 10000}ms`)
    console.log(`   Mistral model:   ${process.env.MISTRAL_MODEL || 'mistral-small-latest'}`)
  })
})
