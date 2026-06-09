import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'
import tasksRouter from './routes/tasks.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map(s => s.trim())
  const corsOptions: cors.CorsOptions = {
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, mobile apps, etc.)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
  }

  // Handle preflight OPTIONS requests for all routes
  app.options('*', cors(corsOptions))
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
