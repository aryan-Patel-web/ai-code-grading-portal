import mongoose from 'mongoose'

const testResultSchema = new mongoose.Schema(
  {
    input:    { type: String, required: true },
    expected: { type: String, required: true },
    actual:   { type: String, default: '' },
    pass:     { type: Boolean, required: true },
  },
  { _id: false }
)


const aiFeedbackSchema = new mongoose.Schema(
  {
    style:       { type: String, default: '' },
    efficiency:  { type: String, default: '' },
    correctness: { type: String, default: '' },
    summary:     { type: String, default: '' },
    raw:         { type: String, default: '' },
  },
  { _id: false }
)

const submissionSchema = new mongoose.Schema(
  {
    studentId:   { type: String, required: true, trim: true, maxlength: 60 },
    language:    { type: String, enum: { values: ['python', 'javascript'], message: 'Unsupported language: {VALUE}' }, default: 'python' },
    code:        { type: String, required: true, maxlength: 20000 },
    testResults: { type: [testResultSchema], default: [] },
    passedCount: { type: Number, required: true, default: 0 },
    totalCount:  { type: Number, required: true, default: 0 },
    aiFeedback:  { type: aiFeedbackSchema, default: null },
  },
  { timestamps: true, versionKey: false }
)

submissionSchema.index({ createdAt: -1 })
submissionSchema.index({ studentId: 1, createdAt: -1 })

export default mongoose.model('Submission', submissionSchema)
