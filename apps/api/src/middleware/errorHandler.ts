import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../lib/logger.js'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      data: null,
      error: 'Validation error',
      meta: { issues: err.flatten().fieldErrors },
    })
    return
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error')

  res.status(500).json({
    data: null,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : String(err),
  })
}
