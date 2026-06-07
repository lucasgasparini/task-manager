import { PrismaClient, Priority, TaskStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up
  await prisma.session.deleteMany()
  await prisma.task.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      passwordHash,
    },
  })

  // Create demo tasks
  const tasks = [
    {
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
    },
    {
      title: 'Write API documentation',
      description: 'Document all endpoints with request/response examples using OpenAPI',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
    },
    {
      title: 'Add rate limiting',
      description: 'Protect auth endpoints from brute force attacks',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
    },
    {
      title: 'Implement task filtering',
      description: 'Allow filtering by status, priority, and due date',
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
    },
    {
      title: 'Add email notifications',
      description: 'Send email when task due date is approaching',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
    },
  ]

  for (const task of tasks) {
    await prisma.task.create({ data: { ...task, userId: user.id } })
  }

  console.log(`✅ Seeded: 1 user, ${tasks.length} tasks`)
  console.log('   Login: demo@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
