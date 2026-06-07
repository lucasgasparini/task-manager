export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  createdAt: string
  updatedAt: string
  userId: string
}

export interface PaginatedResponse<T> {
  data: T[]
  error: string | null
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  dueDate?: string
}

export type UpdateTaskInput = Partial<CreateTaskInput>
