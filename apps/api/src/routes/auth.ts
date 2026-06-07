import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { signAccessToken } from '../lib/jwt.js'
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate.js'

const router = Router()

const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = registerSchema.parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ data: null, error: 'Email already in use' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, passwordHash } })

    res.status(201).json({ data: { id: user.id, email: user.email }, error: null })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ data: null, error: 'Invalid credentials' })
      return
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email })

    const refreshToken = crypto.randomBytes(40).toString('hex')
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
      },
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_EXPIRES_MS,
    })

    res.json({
      data: { accessToken, user: { id: user.id, email: user.email } },
      error: null,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined

    if (!token) {
      res.status(401).json({ data: null, error: 'No refresh token' })
      return
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken: token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ data: null, error: 'Invalid or expired refresh token' })
      return
    }

    // Rotate refresh token
    const newRefreshToken = crypto.randomBytes(40).toString('hex')
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
      },
    })

    const accessToken = signAccessToken({ userId: session.user.id, email: session.user.email })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_EXPIRES_MS,
    })

    res.json({ data: { accessToken }, error: null })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken as string | undefined
    if (token) {
      await prisma.session.deleteMany({ where: { refreshToken: token } })
    }
    res.clearCookie('refreshToken')
    res.json({ data: { message: 'Logged out' }, error: null })
  } catch (err) {
    next(err)
  }
})

export default router
