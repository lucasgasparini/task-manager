import { useState } from 'react'
import { useCreateTask } from '../hooks/useTasks.ts'
import type { CreateTaskInput, Priority, TaskStatus } from '../types/task.ts'

interface Props {
  onClose: () => void
}

export function CreateTaskModal({ onClose }: Props) {
  const createTask = useCreateTask()
  const [form, setForm] = useState<CreateTaskInput>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createTask.mutateAsync(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">New Task</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="datetime-local"
              onChange={(e) =>
                setForm({ ...form, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {createTask.isError && (
            <p className="text-sm text-red-600">Failed to create task. Please try again.</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
