import { Router } from 'express'
import {
  createDoubt,
  getApprovedDoubts,
  getPendingDoubts,
  approveDoubt,
  rejectDoubt,
  editAndApprove,
} from '../controllers/doubtController.js'

const router = Router()

/**
 * IMPORTANT — route ordering:
 * Express matches routes in registration order.
 * /pending MUST be registered BEFORE /:id, otherwise Express will try to
 * interpret the string "pending" as a MongoDB ObjectId and throw a CastError.
 */

// POST /api/doubts — student posts a doubt → Mistral drafts answer → stored as pending
router.post('/', createDoubt)

// GET /api/doubts/pending — teacher fetches all pending drafts (MUST be before /:id)
router.get('/pending', getPendingDoubts)

// GET /api/doubts — public board: approved doubts only
router.get('/', getApprovedDoubts)

// PATCH /api/doubts/:id/approve — teacher approves AI draft as-is
router.patch('/:id/approve', approveDoubt)

// PATCH /api/doubts/:id/reject — teacher rejects AI draft
router.patch('/:id/reject', rejectDoubt)

// PATCH /api/doubts/:id/edit — teacher edits draft text then approves
router.patch('/:id/edit', editAndApprove)

export default router
