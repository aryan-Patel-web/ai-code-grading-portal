import { Router } from 'express'
import { createSubmission, getAllSubmissions, getSubmissionById } from '../controllers/submissionController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/',   requireAuth, createSubmission)
router.get('/',    requireAuth, getAllSubmissions)
router.get('/:id', requireAuth, getSubmissionById)

export default router
