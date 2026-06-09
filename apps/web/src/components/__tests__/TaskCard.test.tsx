import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskCard } from '../TaskCard.tsx'
import type { Task } from '../../types/task.ts'

// Mock the hooks to avoid real API calls in tests
vi.mock('../../hooks/useTasks.ts', () => ({
  useUpdateTask: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteTask: () => ({ mutate: vi.fn(), isPending: false }),
}))

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'A test description',
  status: 'TODO',
  priority: 'HIGH',
  dueDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user-1',
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient()
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('TaskCard', () => {
  it('renders task title and priority', () => {
    render(<TaskCard task={mockTask} />, { wrapper })
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
  })

  it('renders description when present', () => {
    render(<TaskCard task={mockTask} />, { wrapper })
    expect(screen.getByText('A test description')).toBeInTheDocument()
  })

  it('shows next status button for TODO tasks', () => {
    render(<TaskCard task={mockTask} />, { wrapper })
    expect(screen.getByText('→ In Progress')).toBeInTheDocument()
  })

  it('does not show next status button for DONE tasks', () => {
    render(<TaskCard task={{ ...mockTask, status: 'DONE' }} />, { wrapper })
    expect(screen.queryByText(/→/)).not.toBeInTheDocument()
  })
})
