import { Router } from 'express'
import {
  createSubmission,
  getAllSubmissions,
  getSubmissionById,
} from '../controllers/submissionController.js'

const router = Router()

// POST /api/submissions — submit code, run sandbox, grade, store
router.post('/', createSubmission)

// GET /api/submissions — list all submissions (newest first)
router.get('/', getAllSubmissions)

// GET /api/submissions/:id — single submission with full details
router.get('/:id', getSubmissionById)

export default router
