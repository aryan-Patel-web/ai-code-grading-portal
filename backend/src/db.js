import mongoose from 'mongoose'

/**
 * connectDB — establishes the Mongoose connection to MongoDB Atlas.
 * Called once from server.js before app.listen().
 * Exits the process on failure so the server never starts in a broken state.
 */


export async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options silence deprecation warnings in Mongoose 8
      serverSelectionTimeoutMS: 8000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  }
}
