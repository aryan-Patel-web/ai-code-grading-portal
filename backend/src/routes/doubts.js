import { Router } from 'express'
import {
  createDoubt, getApprovedDoubts, getPendingDoubts,
  approveDoubt, rejectDoubt, editAndApprove, getInjectionLogs,
} from '../controllers/doubtController.js'
import { requireAuth, requireTeacher } from '../middleware/auth.js'

const router = Router()

// IMPORTANT: /pending and /injection-logs MUST be before /:id
router.get('/pending',        requireAuth, requireTeacher, getPendingDoubts)
router.get('/injection-logs', requireAuth, requireTeacher, getInjectionLogs)
router.get('/',               getApprovedDoubts)
router.post('/',              requireAuth, createDoubt)
router.patch('/:id/approve',  requireAuth, requireTeacher, approveDoubt)
router.patch('/:id/reject',   requireAuth, requireTeacher, rejectDoubt)
router.patch('/:id/edit',     requireAuth, requireTeacher, editAndApprove)

export default router
