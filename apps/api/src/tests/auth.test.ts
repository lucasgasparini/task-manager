import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { prisma } from '../lib/prisma.js'

const app = createApp()

beforeAll(async () => {
  // Ensure clean state
  await prisma.session.deleteMany()
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.session.deleteMany()
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()
  await prisma.$disconnect()
})

describe('POST /api/auth/register', () => {
  it('creates a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.data.email).toBe('test@example.com')
    expect(res.body.error).toBeNull()
  })

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(409)
  })

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@example.com', password: '123' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('returns access token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })
})
