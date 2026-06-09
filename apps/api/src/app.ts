import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'
import tasksRouter from './routes/tasks.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map(s => s.trim().replace(/\/$/, ''))

  // Manual CORS middleware — explicit and framework-agnostic
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin
    if (!origin || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin ?? '*')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
      res.setHeader('Vary', 'Origin')
    }
    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }
    next()
  })
  app.use(express.json())
  app.use(cookieParser())

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Routes
  app.use('/api/auth', authRouter)
  app.use('/api/tasks', tasksRouter)

  // 404
  app.use((_req, res) => {
    res.status(404).json({ data: null, error: 'Route not found' })
  })

  // Error handler (must be last)
  app.use(errorHandler)

  return app
}
