import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'
import tasksRouter from './routes/tasks.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  const applyCORSHeaders = (req: Request, res: Response) => {
    const origin = req.headers.origin
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Vary', 'Origin')
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  }

  // Explicit preflight handler — must come before app.use() so Express routes it correctly
  app.options('*', (req: Request, res: Response) => {
    applyCORSHeaders(req, res)
    res.status(204).end()
  })

  // Attach CORS headers to every non-OPTIONS response
  app.use((req: Request, res: Response, next: NextFunction) => {
    applyCORSHeaders(req, res)
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
