import Submission from '../models/Submission.js'
import { grade } from '../services/graderService.js'

export async function createSubmission(req, res, next) {
  try {
    const { studentId, code, language = 'python' } = req.body

    if (!studentId?.trim()) { const e = new Error('studentId is required'); e.status = 400; return next(e) }
    if (!code?.trim())      { const e = new Error('code is required'); e.status = 400; return next(e) }
    if (!['python', 'javascript'].includes(language)) {
      const e = new Error('Supported languages: python, javascript'); e.status = 400; return next(e)
    }

    const gradeResult = await grade(code.trim(), language)

    const submission = await Submission.create({
      studentId: studentId.trim(), language, code: code.trim(),
      testResults: gradeResult.results.map((r) => ({ input: r.input, expected: r.expected, actual: r.actual, pass: r.pass })),
      passedCount: gradeResult.passed,
      totalCount:  gradeResult.total,
      aiFeedback:  gradeResult.aiFeedback || null,
    })

    res.status(201).json({
      _id: submission._id, studentId: submission.studentId, language: submission.language,
      passedCount: submission.passedCount, totalCount: submission.totalCount,
      testResults: submission.testResults, aiFeedback: submission.aiFeedback,
      createdAt: submission.createdAt,
    })
  } catch (err) { next(err) }
}

export async function getAllSubmissions(req, res, next) {
  try {
    const filter = {}
    if (req.query.studentId) filter.studentId = req.query.studentId.trim()
    const submissions = await Submission.find(filter).sort({ createdAt: -1 }).limit(100).select('-code').lean()
    res.json(submissions)
  } catch (err) { next(err) }
}

export async function getSubmissionById(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id).lean()
    if (!submission) { const e = new Error('Submission not found'); e.status = 404; return next(e) }
    res.json(submission)
  } catch (err) { next(err) }
}
