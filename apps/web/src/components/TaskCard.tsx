import type { Task } from '../types/task.ts'
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks.ts'

const STATUS_LABELS: Record<Task['status'], string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
}

const STATUS_NEXT: Partial<Record<Task['status'], Task['status']>> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
}

interface Props {
  task: Task
}

export function TaskCard({ task }: Props) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const nextStatus = STATUS_NEXT[task.status]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 flex-1">{task.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{STATUS_LABELS[task.status]}</span>

        <div className="flex gap-2">
          {nextStatus && (
            <button
              onClick={() => updateTask.mutate({ id: task.id, input: { status: nextStatus } })}
              disabled={updateTask.isPending}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
            >
              → {STATUS_LABELS[nextStatus]}
            </button>
          )}
          <button
            onClick={() => {
              if (confirm('Delete this task?')) deleteTask.mutate(task.id)
            }}
            disabled={deleteTask.isPending}
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {task.dueDate && (
        <p className="mt-2 text-xs text-gray-400">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
