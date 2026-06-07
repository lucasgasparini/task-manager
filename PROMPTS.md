# Claude Code Prompts Guide

This file contains ready-to-use prompts for continuing development with Claude Code.
Run `claude` in the project root to start a session, then paste any prompt below.

---

## Getting Started

### Install dependencies and run migrations
```
Install all pnpm dependencies for the monorepo, copy apps/api/.env.example to apps/api/.env,
then run the Prisma migration and seed script. Start the DB with docker-compose first.
```

### Start the full stack
```
Start the API in dev mode on port 3001 and the web app on port 5173. 
Make sure the Vite proxy is forwarding /api calls to the backend.
```

---

## Backend Features

### Add rate limiting to auth endpoints
```
Add express-rate-limit to the auth routes (register and login).
Allow max 5 requests per 15 minutes per IP.
Return 429 with a descriptive error message when exceeded.
Add a test for the rate limit behavior.
```

### Add task labels/tags
```
Add a Label model to the Prisma schema. Tasks can have many labels (many-to-many).
Labels have: id, name, color (hex string), userId.
Add CRUD endpoints: GET/POST /api/labels, DELETE /api/labels/:id.
Update the task create/update endpoints to accept labelIds[].
Update the task list endpoint to include labels in the response.
Run a migration.
```

### Add pagination to task list with cursor-based pagination
```
Replace the current offset pagination on GET /api/tasks with cursor-based pagination.
Use the task's createdAt + id as the cursor.
Request accepts: cursor? (string), limit (default 20).
Response includes: nextCursor (string | null).
Update the frontend useTasks hook to support infinite scrolling with useInfiniteQuery.
```

### Add request logging middleware
```
Add pino-http middleware to log every request: method, path, status code, response time.
Exclude /health from logs.
Make sure sensitive headers (Authorization, Cookie) are redacted in the logs.
```

### Add OpenAPI/Swagger documentation
```
Add @asteasolutions/zod-to-openapi to generate an OpenAPI 3.0 spec from our existing Zod schemas.
Expose it at GET /api/docs (Swagger UI) and GET /api/openapi.json.
Cover all auth and task endpoints.
```

---

## Frontend Features

### Add task filtering UI
```
Add a filter bar above the kanban board on DashboardPage.
Filters: status (select), priority (select), search by title (text input, debounced 300ms).
Wire the filters to the useTasks hook query params.
Keep filters in URL search params so they persist on page refresh.
```

### Add optimistic updates to task status changes
```
In useUpdateTask, add an optimistic update: immediately update the task in the React Query cache
when the user clicks the status button, then rollback if the mutation fails.
Show a toast notification on error using a simple custom hook (no external toast library).
```

### Add drag-and-drop to the kanban board
```
Add @dnd-kit/core and @dnd-kit/sortable.
Make TaskCards draggable between the three status columns.
On drop, call the updateTask mutation to persist the new status.
Show a visual placeholder while dragging.
```

### Add a task detail side panel
```
When a user clicks a TaskCard, open a side panel (not a modal) that slides in from the right.
The panel shows all task fields and allows inline editing of title, description, priority, dueDate.
Changes are saved on blur with useUpdateTask. 
Use React Router's URL state (?taskId=xxx) to make the panel deep-linkable.
```

---

## Auth & Security

### Add email verification
```
After register, send a verification email using nodemailer + a local SMTP like Mailhog (add to docker-compose).
Users get an emailVerified: false field. 
Add GET /api/auth/verify?token=xxx endpoint.
Gate task creation behind email verification (403 if not verified).
```

### Add password reset flow
```
Add POST /api/auth/forgot-password — generates a time-limited token (1h), stores hash in DB, sends email.
Add POST /api/auth/reset-password — validates token, updates password, invalidates all sessions.
Add a ForgotPasswordPage and ResetPasswordPage in the frontend.
```

---

## Testing

### Add full integration test suite for tasks
```
In apps/api/src/tests/tasks.test.ts, add tests for:
- Filtering by status and priority
- Pagination (page 1 and page 2)
- Attempting to access another user's task (should 404, not 403 — don't leak resource existence)
- Validation errors on create (missing title, invalid status enum)
```

### Add MSW mock server for frontend tests  
```
Install msw@2 in apps/web.
Create src/mocks/handlers.ts with handlers for all /api/tasks and /api/auth endpoints.
Set up the mock server in test-setup.ts.
Rewrite TaskCard tests to use the mock server instead of vi.mock.
Add an integration test for the full DashboardPage: mount it, verify tasks render, 
click "→ In Progress" on a TODO task, verify it moves columns.
```

---

## Deployment

### Deploy to Railway (backend) + Vercel (frontend)
```
Add a railway.json and Procfile for the API.
Add a vercel.json for the frontend (SPA routing fix).
Add a Dockerfile for the API that: builds TypeScript, runs migrations, starts the server.
Add a .github/workflows/ci.yml that: installs deps, runs all tests, and on main branch merge 
triggers deploy to Railway and Vercel via their CLI.
Document the required environment variables for both platforms.
```

### Add health check and graceful shutdown
```
Enhance GET /health to also check DB connectivity (prisma.$queryRaw`SELECT 1`).
Return 503 if DB is unreachable.
Add graceful shutdown: on SIGTERM, stop accepting new requests, wait for in-flight requests 
to complete (max 10s), then close the DB connection and exit.
```
