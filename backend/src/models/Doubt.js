import mongoose from 'mongoose'

const doubtSchema = new mongoose.Schema(
  {
    studentId:    { type: String, required: true, trim: true, maxlength: 60 },
    questionText: { type: String, required: true, trim: true, maxlength: 2000 },
    aiAnswer:     { type: String, default: '', maxlength: 8000 },
    status: {
      type: String,
      enum: { values: ['draft', 'pending', 'approved', 'rejected'], message: 'Invalid status: {VALUE}' },
      default: 'pending',
      required: true,
    },
    teacherNote:  { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true, versionKey: false }
)

doubtSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('Doubt', doubtSchema)
