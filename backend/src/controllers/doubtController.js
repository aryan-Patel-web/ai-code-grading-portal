import Doubt from '../models/Doubt.js'
import { sanitizeInput, draftAnswer } from '../services/mistralService.js'

/**
 * APPROVAL STATE MACHINE
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforced at TWO levels:
 *   1. Mongoose schema enum — MongoDB rejects any status outside the allowed set
 *   2. Controller transition guard (assertTransition) — called before every .save()
 *      to verify the current status allows the requested transition.
 *
 * Legal transitions:
 *   pending → approved   (approveDoubt / editAndApprove)
 *   pending → rejected   (rejectDoubt)
 *
 * Illegal (blocked by assertTransition):
 *   approved → anything
 *   rejected → anything
 *   draft    → anything (draft is reserved for Part 2 async queue)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Allowed state transitions map */
const TRANSITIONS = {
  pending: ['approved', 'rejected'],
}

/**
 * assertTransition — throws a 400 error if the transition is not legal.
 * This is the controller-level enforcement of the state machine.
 */
function assertTransition(doubt, targetStatus) {
  const allowed = TRANSITIONS[doubt.status] || []
  if (!allowed.includes(targetStatus)) {
    const err = new Error(
      `Cannot transition from '${doubt.status}' to '${targetStatus}'. ` +
      `Allowed transitions from '${doubt.status}': [${allowed.join(', ') || 'none'}]`
    )
    err.status = 400
    throw err
  }
}

// ─── Controller functions ─────────────────────────────────────────────────────

/**
 * createDoubt
 * POST /api/doubts
 *
 * Flow:
 *   1. Validate body
 *   2. sanitizeInput() — strips injection patterns from student question
 *   3. draftAnswer()   — calls Mistral with hardened system prompt
 *   4. Save Doubt with status: 'pending'
 *   5. Return doc (without aiAnswer — student doesn't see draft until approved)
 */
export async function createDoubt(req, res, next) {
  try {
    const { studentId, questionText } = req.body

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      const err = new Error('studentId is required')
      err.status = 400
      return next(err)
    }
    if (!questionText || typeof questionText !== 'string' || !questionText.trim()) {
      const err = new Error('questionText is required')
      err.status = 400
      return next(err)
    }

    // Layer 1 prompt injection defence: sanitize before sending to Mistral
    const sanitized = sanitizeInput(questionText)

    if (!sanitized) {
      const err = new Error(
        'Your question was empty after filtering. Please rephrase and avoid special formatting.'
      )
      err.status = 400
      return next(err)
    }

    // Layer 2 prompt injection defence: hardened system prompt inside draftAnswer()
    const aiAnswer = await draftAnswer(sanitized)

    const doubt = await Doubt.create({
      studentId:    studentId.trim(),
      questionText: sanitized,  // store sanitized version, not raw
      aiAnswer,
      status: 'pending',
    })

    // Return only what the student needs to know — not the AI draft (pending review)
    res.status(201).json({
      _id:          doubt._id,
      studentId:    doubt.studentId,
      questionText: doubt.questionText,
      status:       doubt.status,
      createdAt:    doubt.createdAt,
      message:      'Your doubt has been submitted. A teacher will review the AI answer before it appears on the board.',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * getApprovedDoubts
 * GET /api/doubts
 * Public board — only approved doubts, newest first.
 */
export async function getApprovedDoubts(_req, res, next) {
  try {
    const doubts = await Doubt.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .lean()
    res.json(doubts)
  } catch (err) {
    next(err)
  }
}

/**
 * getPendingDoubts
 * GET /api/doubts/pending
 * Teacher dashboard — only pending drafts, oldest first (FIFO review queue).
 *
 * TIME-TRADEOFF: No auth guard. In production this route would require a
 * teacher JWT. Documented in README §9 tradeoff #1.
 */
export async function getPendingDoubts(_req, res, next) {
  try {
    const doubts = await Doubt.find({ status: 'pending' })
      .sort({ createdAt: 1 })  // oldest first — review queue
      .lean()
    res.json(doubts)
  } catch (err) {
    next(err)
  }
}

/**
 * approveDoubt
 * PATCH /api/doubts/:id/approve
 * Teacher approves the AI draft as-is.
 */
export async function approveDoubt(req, res, next) {
  try {
    const doubt = await Doubt.findById(req.params.id)
    if (!doubt) {
      const err = new Error('Doubt not found')
      err.status = 404
      return next(err)
    }

    // State machine check — throws 400 if transition is illegal
    assertTransition(doubt, 'approved')

    doubt.status = 'approved'
    await doubt.save()

    res.json({
      _id:    doubt._id,
      status: doubt.status,
      message: 'Doubt approved and now visible on the public board.',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * rejectDoubt
 * PATCH /api/doubts/:id/reject
 * Teacher rejects the AI draft — it will not appear on the public board.
 */
export async function rejectDoubt(req, res, next) {
  try {
    const doubt = await Doubt.findById(req.params.id)
    if (!doubt) {
      const err = new Error('Doubt not found')
      err.status = 404
      return next(err)
    }

    assertTransition(doubt, 'rejected')

    doubt.status = 'rejected'
    doubt.teacherNote = req.body?.teacherNote || ''
    await doubt.save()

    res.json({
      _id:    doubt._id,
      status: doubt.status,
      message: 'Doubt rejected. It will not appear on the public board.',
    })
  } catch (err) {
    next(err)
  }
}

/**
 * editAndApprove
 * PATCH /api/doubts/:id/edit
 * Teacher edits the AI draft text, then approves it.
 * Body: { approvedAnswer: string }
 */
export async function editAndApprove(req, res, next) {
  try {
    const { approvedAnswer } = req.body

    if (!approvedAnswer || typeof approvedAnswer !== 'string' || !approvedAnswer.trim()) {
      const err = new Error('approvedAnswer is required in request body')
      err.status = 400
      return next(err)
    }

    const doubt = await Doubt.findById(req.params.id)
    if (!doubt) {
      const err = new Error('Doubt not found')
      err.status = 404
      return next(err)
    }

    assertTransition(doubt, 'approved')

    doubt.aiAnswer = approvedAnswer.trim()
    doubt.status   = 'approved'
    await doubt.save()

    res.json({
      _id:      doubt._id,
      aiAnswer: doubt.aiAnswer,
      status:   doubt.status,
      message:  'Answer edited and approved. Now visible on the public board.',
    })
  } catch (err) {
    next(err)
  }
}
