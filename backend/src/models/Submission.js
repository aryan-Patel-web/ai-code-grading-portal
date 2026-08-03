import mongoose from 'mongoose'

/**
 * Submission — stores a single code submission and its grading results.
 *
 * Fields:
 *   studentId    — free-text identifier (MVP: no auth; Part 2 replaces with user ref)
 *   language     — enum; 'python' only in MVP; 'javascript' added in Part 2
 *   code         — raw submitted source code (stored for submission history)
 *   testResults  — array of per-test-case outcome objects
 *   passedCount  — convenience count; equals testResults.filter(r => r.pass).length
 *   totalCount   — total number of test cases run
 *   createdAt    — auto via timestamps: true
 */
const testResultSchema = new mongoose.Schema(
  {
    input:    { type: String, required: true },
    expected: { type: String, required: true },
    actual:   { type: String, default: '' },
    pass:     { type: Boolean, required: true },
  },
  { _id: false } // sub-documents don't need their own _id
)

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'studentId is required'],
      trim: true,
      maxlength: [60, 'studentId too long'],
    },
    language: {
      type: String,
      enum: {
        values: ['python'],
        message: 'Unsupported language: {VALUE}. MVP supports python only.',
      },
      default: 'python',
    },
    code: {
      type: String,
      required: [true, 'code is required'],
      maxlength: [20000, 'Code too long (max 20 000 chars)'],
    },
    testResults: {
      type: [testResultSchema],
      default: [],
    },
    passedCount: { type: Number, required: true, default: 0 },
    totalCount:  { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
    versionKey: false,
  }
)

// Index for history queries sorted by newest first
submissionSchema.index({ createdAt: -1 })
// Index for per-student history (Part 2 filter)
submissionSchema.index({ studentId: 1, createdAt: -1 })

export default mongoose.model('Submission', submissionSchema)
