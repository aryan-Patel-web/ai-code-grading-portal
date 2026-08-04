export function errorHandler(err, _req, res, _next) {
  console.error('❌ Error:', err.stack || err.message)

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ error: messages.join('; ') })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ID format: ${err.value}` })
  }

  const status = err.status || err.statusCode || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
}
