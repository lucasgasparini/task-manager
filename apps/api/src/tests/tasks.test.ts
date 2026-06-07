import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { prisma } from '../lib/prisma.js'

const app = createApp()
let accessToken: string

beforeAll(async () => {
  await prisma.session.deleteMany()
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'tasks@example.com', password: 'password123' })

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'tasks@example.com', password: 'password123' })

  accessToken = loginRes.body.data.accessToken
})

afterAll(async () => {
  await prisma.session.deleteMany()
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()
  await prisma.$disconnect()
})

describe('Tasks CRUD', () => {
  let taskId: string

  it('POST /api/tasks — creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test task', priority: 'HIGH' })

    expect(res.status).toBe(201)
    expect(res.body.data.title).toBe('Test task')
    taskId = res.body.data.id
  })

  it('GET /api/tasks — lists tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.meta.total).toBeDefined()
  })

  it('GET /api/tasks/:id — returns task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(taskId)
  })

  it('PATCH /api/tasks/:id — updates task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'IN_PROGRESS' })

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('IN_PROGRESS')
  })

  it('DELETE /api/tasks/:id — deletes task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(204)
  })

  it('GET /api/tasks/:id — 404 after delete', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(404)
  })

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(401)
  })
})
