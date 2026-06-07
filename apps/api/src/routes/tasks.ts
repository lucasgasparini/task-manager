import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, AuthenticatedRequest } from '../middleware/authenticate.js'

const router = Router()
router.use(authenticate)

const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE'])
const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'])

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z.string().datetime().optional(),
})

const updateTaskSchema = createTaskSchema.partial()

const listQuerySchema = z.object({
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// GET /api/tasks
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest
    const { status, priority, page, limit } = listQuerySchema.parse(req.query)

    const where = {
      userId,
      ...(status && { status }),
      ...(priority && { priority }),
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ])

    res.json({
      data: tasks,
      error: null,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/tasks
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest
    const body = createTaskSchema.parse(req.body)

    const task = await prisma.task.create({
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        userId,
      },
    })

    res.status(201).json({ data: task, error: null })
  } catch (err) {
    next(err)
  }
})

// GET /api/tasks/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest
    const id = req.params['id'] as string
    const task = await prisma.task.findFirst({
      where: { id, userId },
    })

    if (!task) {
      res.status(404).json({ data: null, error: 'Task not found' })
      return
    }

    res.json({ data: task, error: null })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/tasks/:id
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest
    const id = req.params['id'] as string
    const body = updateTaskSchema.parse(req.body)

    const existing = await prisma.task.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      res.status(404).json({ data: null, error: 'Task not found' })
      return
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    })

    res.json({ data: task, error: null })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/tasks/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req as AuthenticatedRequest
    const id = req.params['id'] as string

    const existing = await prisma.task.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      res.status(404).json({ data: null, error: 'Task not found' })
      return
    }

    await prisma.task.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
