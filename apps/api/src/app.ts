import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'
import tasksRouter from './routes/tasks.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map(s => s.trim().replace(/\/$/, '')) // trim whitespace and trailing slash

  const corsOptions: cors.CorsOptions = {
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(null, false) // reject cleanly — don't throw, which strips CORS headers
    },
    credentials: true,
  }

  // cors middleware handles OPTIONS preflight automatically (preflightContinue: false by default)
  app.use(cors(corsOptions))
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
