import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.ts'
import type { Task, CreateTaskInput, UpdateTaskInput, PaginatedResponse } from '../types/task.ts'

const TASKS_KEY = ['tasks'] as const

interface TaskFilters {
  status?: Task['status']
  priority?: Task['priority']
  page?: number
  limit?: number
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: [...TASKS_KEY, filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Task>>('/tasks', { params: filters })
      return data
    },
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Task }>(`/tasks/${id}`)
      return data.data
    },
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data } = await api.post<{ data: Task }>('/tasks', input)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTaskInput }) => {
      const { data } = await api.patch<{ data: Task }>(`/tasks/${id}`, input)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}
