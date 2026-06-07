# Task Manager — Claude Code Agent Context

## Project Overview
A fullstack task management app built to demonstrate senior fullstack engineering.
Monorepo with a REST API backend and a React SPA frontend.

## Stack
| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | Node.js 20, Express 5, TypeScript (strict)      |
| ORM        | Prisma + PostgreSQL                             |
| Validation | Zod (all request bodies and env vars)           |
| Auth       | JWT (access token) + refresh token via httpOnly cookie |
| Frontend   | React 18, TypeScript (strict), Vite             |
| State      | React Query (server state), Zustand (UI state)  |
| Routing    | React Router v6                                 |
| Styling    | Tailwind CSS                                    |
| Testing    | Vitest + Supertest (API), React Testing Library (UI) |
| Infra      | Docker Compose (local), deployable to Railway + Vercel |

## Monorepo Structure
```
task-manager/
├── apps/
│   ├── api/          # Express backend
│   └── web/          # React frontend
├── docker-compose.yml
├── CLAUDE.md
└── pnpm-workspace.yaml
```

## Engineering Rules (always follow these)
- TypeScript strict mode everywhere — no `any`, no `@ts-ignore`
- All request inputs validated with Zod before hitting business logic
- All API responses follow a consistent shape: `{ data, error, meta }`
- HTTP status codes must be semantically correct (401 vs 403, 404 vs 400, etc.)
- Errors never leak stack traces to the client in production
- JWT secrets and DB URLs always come from env vars, never hardcoded
- Every new API route needs at least one integration test
- Prisma migrations for every schema change — never edit the DB directly
- No `console.log` in committed code — use a logger (pino)

## API Contract

### Auth
| Method | Path               | Auth required | Description          |
|--------|--------------------|---------------|----------------------|
| POST   | /api/auth/register | No            | Register new user    |
| POST   | /api/auth/login    | No            | Login, get JWT       |
| POST   | /api/auth/refresh  | No (cookie)   | Refresh access token |
| POST   | /api/auth/logout   | Yes           | Invalidate session   |

### Tasks
| Method | Path               | Auth required | Description                        |
|--------|--------------------|--------------|------------------------------------|
| GET    | /api/tasks         | Yes          | List tasks (paginated, filterable) |
| POST   | /api/tasks         | Yes          | Create task                        |
| GET    | /api/tasks/:id     | Yes          | Get task by ID                     |
| PATCH  | /api/tasks/:id     | Yes          | Update task                        |
| DELETE | /api/tasks/:id     | Yes          | Delete task                        |

### Task shape
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "status": "TODO | IN_PROGRESS | DONE",
  "priority": "LOW | MEDIUM | HIGH",
  "dueDate": "ISO8601 | null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "userId": "uuid"
}
```

## DB Schema (Prisma)

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  tasks        Task[]
  sessions     Session[]
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum TaskStatus { TODO IN_PROGRESS DONE }
enum Priority  { LOW MEDIUM HIGH }
```

## Key Decisions & Trade-offs (know these for interviews)
- **JWT + refresh token**: Stateless access token (15min TTL) + DB-backed refresh token (7d TTL).
  Allows token revocation without full session store overhead.
- **Prisma over raw SQL**: Type safety + migration tooling worth the slight abstraction cost at this scale.
  At 10M+ rows we'd consider query optimization or moving hot paths to raw SQL.
- **React Query over Redux**: Server state and client state are different problems.
  React Query handles caching, refetching, and optimistic updates better than a generic store.
- **Zod over Joi/class-validator**: Works in both Node and browser, integrates with TypeScript inference natively.
- **PostgreSQL over MongoDB**: Task data is relational (users own tasks, future: labels, assignments).
  JSONB available if schema flexibility needed later.
