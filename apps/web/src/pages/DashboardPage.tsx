import { useState } from 'react'
import { useTasks } from '../hooks/useTasks.ts'
import { useLogout } from '../hooks/useAuth.ts'
import { useAuthStore } from '../store/auth.ts'
import { TaskCard } from '../components/TaskCard.tsx'
import { CreateTaskModal } from '../components/CreateTaskModal.tsx'
import type { Task } from '../types/task.ts'

const STATUS_COLUMNS: Task['status'][] = ['TODO', 'IN_PROGRESS', 'DONE']
const STATUS_LABELS: Record<Task['status'], string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading, isError } = useTasks({ limit: 100 })

  const tasksByStatus = STATUS_COLUMNS.reduce<Record<Task['status'], Task[]>>(
    (acc, status) => {
      acc[status] = data?.data.filter((t) => t.status === status) ?? []
      return acc
    },
    { TODO: [], IN_PROGRESS: [], DONE: [] }
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            + New Task
          </button>
          <button
            onClick={() => logout.mutate()}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="p-6">
        {isLoading && (
          <div className="text-center py-12 text-gray-400">Loading tasks...</div>
        )}

        {isError && (
          <div className="text-center py-12 text-red-500">Failed to load tasks.</div>
        )}

        {data && (
          <div className="grid grid-cols-3 gap-6">
            {STATUS_COLUMNS.map((status) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-700">{STATUS_LABELS[status]}</h2>
                  <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                    {tasksByStatus[status].length}
                  </span>
                </div>

                <div className="space-y-3">
                  {tasksByStatus[status].map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}

                  {tasksByStatus[status].length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && <CreateTaskModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
