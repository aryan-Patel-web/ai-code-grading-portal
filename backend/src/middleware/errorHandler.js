/**
 * errorHandler — central Express error handler.
 * Must be registered LAST with app.use() and must have exactly 4 arguments.
 *
 * Handles:
 *   - Mongoose ValidationError  → 400
 *   - Mongoose CastError        → 400 (e.g. invalid ObjectId in URL param)
 *   - Errors with .status set   → that status
 *   - Everything else           → 500
 */


export function errorHandler(err, _req, res, _next) {
  // Log full stack in development; in production you'd send to a log service
  console.error('❌ Error:', err.stack || err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ error: messages.join('; ') })
  }

  // Mongoose bad ObjectId (e.g. GET /api/doubts/not-an-id)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ID format: ${err.value}` })
  }

  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'
  res.status(status).json({ error: message })
}
