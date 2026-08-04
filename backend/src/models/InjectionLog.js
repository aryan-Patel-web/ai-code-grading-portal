import mongoose from 'mongoose'

const injectionLogSchema = new mongoose.Schema(
  {
    studentId:      { type: String, default: 'anonymous' },
    rawInput:       { type: String, required: true, maxlength: 5000 },
    sanitizedInput: { type: String, default: '' },
    patternsFound:  [{ type: String }],
    doubtId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Doubt', default: null },
    ipAddress:      { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
)

injectionLogSchema.index({ createdAt: -1 })

export default mongoose.model('InjectionLog', injectionLogSchema)
