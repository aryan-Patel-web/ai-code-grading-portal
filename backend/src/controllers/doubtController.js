import Doubt from '../models/Doubt.js'
import InjectionLog from '../models/InjectionLog.js'
import { sanitizeInput, logInjectionAttempt, draftAnswer } from '../services/mistralService.js'

// State machine — legal transitions enforced at controller level + Mongoose enum
const TRANSITIONS = { pending: ['approved', 'rejected'] }

function assertTransition(doubt, targetStatus) {
  const allowed = TRANSITIONS[doubt.status] || []
  if (!allowed.includes(targetStatus)) {
    const err = new Error(`Cannot transition from '${doubt.status}' to '${targetStatus}'. Allowed: [${allowed.join(', ') || 'none'}]`)
    err.status = 400
    throw err
  }
}


export async function createDoubt(req, res, next) {
  try {
    const { studentId, questionText } = req.body
    if (!studentId?.trim())    { const e = new Error('studentId is required'); e.status = 400; return next(e) }
    if (!questionText?.trim()) { const e = new Error('questionText is required'); e.status = 400; return next(e) }

    const { sanitized, patternsFound } = sanitizeInput(questionText)

    // Log injection attempts (non-blocking)
    if (patternsFound.length > 0) {
      await logInjectionAttempt({
        studentId: studentId.trim(), rawInput: questionText,
        sanitizedInput: sanitized, patternsFound, ipAddress: req.ip || '',
      })
    }

    if (!sanitized) {
      const e = new Error('Question was empty after filtering. Please rephrase.')
      e.status = 400; return next(e)
    }

    const aiAnswer = await draftAnswer(sanitized)

    const doubt = await Doubt.create({ studentId: studentId.trim(), questionText: sanitized, aiAnswer, status: 'pending' })

    res.status(201).json({
      _id: doubt._id, studentId: doubt.studentId, questionText: doubt.questionText,
      status: doubt.status, createdAt: doubt.createdAt,
      injectionDetected: patternsFound.length > 0,
      message: 'Doubt submitted. A teacher will review before it appears on the board.',
    })
  } catch (err) { next(err) }
}

export async function getApprovedDoubts(_req, res, next) {
  try {
    const doubts = await Doubt.find({ status: 'approved' }).sort({ createdAt: -1 }).lean()
    res.json(doubts)
  } catch (err) { next(err) }
}

export async function getPendingDoubts(_req, res, next) {
  try {
    const doubts = await Doubt.find({ status: 'pending' }).sort({ createdAt: 1 }).lean()
    res.json(doubts)
  } catch (err) { next(err) }
}

export async function approveDoubt(req, res, next) {
  try {
    const doubt = await Doubt.findById(req.params.id)
    if (!doubt) { const e = new Error('Doubt not found'); e.status = 404; return next(e) }
    assertTransition(doubt, 'approved')
    doubt.status = 'approved'
    await doubt.save()
    res.json({ _id: doubt._id, status: doubt.status })
  } catch (err) { next(err) }
}

export async function rejectDoubt(req, res, next) {
  try {
    const doubt = await Doubt.findById(req.params.id)
    if (!doubt) { const e = new Error('Doubt not found'); e.status = 404; return next(e) }
    assertTransition(doubt, 'rejected')
    doubt.status = 'rejected'
    doubt.teacherNote = req.body?.teacherNote || ''
    await doubt.save()
    res.json({ _id: doubt._id, status: doubt.status })
  } catch (err) { next(err) }
}

export async function editAndApprove(req, res, next) {
  try {
    const { approvedAnswer } = req.body
    if (!approvedAnswer?.trim()) { const e = new Error('approvedAnswer is required'); e.status = 400; return next(e) }
    const doubt = await Doubt.findById(req.params.id)
    if (!doubt) { const e = new Error('Doubt not found'); e.status = 404; return next(e) }
    assertTransition(doubt, 'approved')
    doubt.aiAnswer = approvedAnswer.trim()
    doubt.status   = 'approved'
    await doubt.save()
    res.json({ _id: doubt._id, aiAnswer: doubt.aiAnswer, status: doubt.status })
  } catch (err) { next(err) }
}

export async function getInjectionLogs(_req, res, next) {
  try {
    const logs = await InjectionLog.find({}).sort({ createdAt: -1 }).limit(50).lean()
    res.json(logs)
  } catch (err) { next(err) }
}
