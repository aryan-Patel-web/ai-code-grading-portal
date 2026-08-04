import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET  = process.env.JWT_SECRET || 'change_this_secret_in_production'
const JWT_EXPIRES = '8h'

export async function register(req, res, next) {
  try {
    const { username, password, role = 'student' } = req.body
    if (!username?.trim() || !password) {
      const e = new Error('username and password required'); e.status = 400; return next(e)
    }
    if (!['student', 'teacher'].includes(role)) {
      const e = new Error('role must be student or teacher'); e.status = 400; return next(e)
    }
    const exists = await User.findOne({ username: username.trim() })
    if (exists) { const e = new Error('Username already taken'); e.status = 409; return next(e) }

    const user  = await User.create({ username: username.trim(), passwordHash: password, role })
    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
    res.status(201).json({ token, username: user.username, role: user.role })
  } catch (err) { next(err) }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body
    if (!username?.trim() || !password) {
      const e = new Error('username and password required'); e.status = 400; return next(e)
    }
    const user = await User.findOne({ username: username.trim() })
    if (!user || !(await user.comparePassword(password))) {
      const e = new Error('Invalid username or password'); e.status = 401; return next(e)
    }
    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
    res.json({ token, username: user.username, role: user.role })
  } catch (err) { next(err) }
}

export async function getMe(req, res) {
  res.json({ username: req.user.username, role: req.user.role, userId: req.user.userId })
}
