import Submission from '../models/Submission.js'
import { grade } from '../services/graderService.js'

/**
 * createSubmission
 * POST /api/submissions
 *
 * Flow:
 *   1. Validate request body
 *   2. Run code through graderService (which calls sandboxService per test case)
 *   3. Save graded Submission document to MongoDB
 *   4.
 * 
 * 
 
  Return result to client
 */
export async function createSubmission(req, res, next) {
  try {
    const { studentId, code, language = 'python' } = req.body

    // ── Input validation ────────────────────────────────────────────────────
    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      const err = new Error('studentId is required')
      err.status = 400
      return next(err)
    }
    if (!code || typeof code !== 'string' || !code.trim()) {
      const err = new Error('code is required')
      err.status = 400
      return next(err)
    }
    if (language !== 'python') {
      const err = new Error('MVP supports Python only. Multi-language is a Part 2 feature.')
      err.status = 400
      return next(err)
    }

    // ── Grade ────────────────────────────────────────────────────────────────
    // grade() calls sandboxService.run() once per test case
    // Each run spins up a fresh Docker container with --rm --network=none
    const gradeResult = await grade(code.trim())

    // ── Persist ──────────────────────────────────────────────────────────────
    const submission = await Submission.create({
      studentId: studentId.trim(),
      language,
      code: code.trim(),
      testResults: gradeResult.results.map((r) => ({
        input:    r.input,
        expected: r.expected,
        actual:   r.actual,
        pass:     r.pass,
      })),
      passedCount: gradeResult.passed,
      totalCount:  gradeResult.total,
    })

    // ── Respond ──────────────────────────────────────────────────────────────
    res.status(201).json({
      _id:         submission._id,
      studentId:   submission.studentId,
      language:    submission.language,
      passedCount: submission.passedCount,
      totalCount:  submission.totalCount,
      testResults: submission.testResults,
      createdAt:   submission.createdAt,
    })
  } catch (err) {
    next(err)
  }
}

/**
 * getAllSubmissions
 * GET /api/submissions
 * Returns all submissions, newest first. (Part 2 adds ?studentId= filter.)
 */
export async function getAllSubmissions(req, res, next) {
  try {
    const submissions = await Submission.find({})
      .sort({ createdAt: -1 })
      .limit(100) // safety cap — pagination is a Part 2 feature
      .select('-code')  // omit raw code from list view (privacy + payload size)
      .lean()

    res.json(submissions)
  } catch (err) {
    next(err)
  }
}

/**
 * getSubmissionById
 * GET /api/submissions/:id
 * Returns a single submission including its code (for detail view).
 */
export async function getSubmissionById(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id).lean()
    if (!submission) {
      const err = new Error('Submission not found')
      err.status = 404
      return next(err)
    }
    res.json(submission)
  } catch (err) {
    next(err)
  }
}
