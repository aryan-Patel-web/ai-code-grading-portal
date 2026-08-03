import mongoose from 'mongoose'

/**
 * Doubt — stores a student doubt, its AI-drafted answer, and the approval state.
 *
 * STATUS STATE MACHINE (enforced at TWO levels):
 *   1. Mongoose schema enum — MongoDB will reject any value outside the allowed set
 *   2. Controller transition guard — checks current status before every .save()
 *
 * Legal transitions (MVP):
 *   pending  →  approved   (teacher approves as-is)
 *   pending  →  rejected   (teacher rejects)
 *   pending  →  approved   (teacher edits text then approves — same target state)
 *
 * 'draft' is reserved in the enum for a future async-queue pattern (Part 2)
 * where Mistral is called in the background. Including it now avoids a schema
 * migration later. In MVP every doubt starts at 'pending' (Mistral is called
 * synchronously during POST /api/doubts before the document is saved).
 *
 * No transition FROM 'approved' or 'rejected' is permitted — immutable once decided.
 */


const doubtSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required'],
      trim: true,
      maxlength: [60, 'studentId too long'],
    },
    questionText: {
      type: String,
      required: [true, 'questionText is required'],
      trim: true,
      maxlength: [2000, 'Question too long (max 2000 chars)'],
    },
    aiAnswer: {
      type: String,
      default: '',
      maxlength: [8000, 'AI answer too long'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'pending', 'approved', 'rejected'],
        message: 'Invalid status: {VALUE}',
      },
      default: 'pending',
      required: true,
    },
    // teacherNote is used for rejection reasons (currently stored but not displayed in MVP UI)
    teacherNote: {
      type: String,
      default: '',
      maxlength: [500, 'Teacher note too long'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Index for fast board queries
doubtSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('Doubt', doubtSchema)
