import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useTasks, useUpdateTask } from '../hooks/useTasks.ts'
import { useLogout } from '../hooks/useAuth.ts'
import { useAuthStore } from '../store/auth.ts'
import { KanbanColumn } from '../components/KanbanColumn.tsx'
import { TaskCard } from '../components/TaskCard.tsx'
import { CreateTaskModal } from '../components/CreateTaskModal.tsx'
import type { Task } from '../types/task.ts'

const STATUS_COLUMNS: Task['status'][] = ['TODO', 'IN_PROGRESS', 'DONE']
const STATUS_LABELS: Record<Task['status'], string> = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Andamento',
  DONE: 'Concluído',
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const updateTask = useUpdateTask()
  const [showModal, setShowModal] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const { data, isLoading, isError } = useTasks({ limit: 100 })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const tasksByStatus = STATUS_COLUMNS.reduce<Record<Task['status'], Task[]>>(
    (acc, status) => {
      acc[status] = data?.data.filter((t) => t.status === status) ?? []
      return acc
    },
    { TODO: [], IN_PROGRESS: [], DONE: [] }
  )

  function onDragStart({ active }: DragStartEvent) {
    const task = data?.data.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null)
    if (!over) return

    // `over.id` is either a column status or another task's id
    const overId = over.id as string
    const newStatus = STATUS_COLUMNS.includes(overId as Task['status'])
      ? (overId as Task['status'])
      : data?.data.find((t) => t.id === overId)?.status

    const task = data?.data.find((t) => t.id === active.id)
    if (!task || !newStatus || task.status === newStatus) return

    updateTask.mutate({ id: task.id, input: { status: newStatus } })
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')" }}
    >
      <div className="min-h-screen bg-black/30 backdrop-blur-[1px]">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/40 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              + Nova Tarefa
            </button>
            <button
              onClick={() => logout.mutate()}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Board */}
        <main className="p-6">
          {isLoading && (
            <div className="text-center py-12 text-white/80">Carregando tarefas...</div>
          )}

          {isError && (
            <div className="text-center py-12 text-red-300">Falha ao carregar tarefas.</div>
          )}

          {data && (
            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
              <div className="grid grid-cols-3 gap-6">
                {STATUS_COLUMNS.map((status) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    label={STATUS_LABELS[status]}
                    tasks={tasksByStatus[status]}
                  />
                ))}
              </div>

              {/* Ghost card that follows the cursor while dragging */}
              <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
                {activeTask && (
                  <div className="rotate-2 scale-105">
                    <TaskCard task={activeTask} />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </main>

        {showModal && <CreateTaskModal onClose={() => setShowModal(false)} />}
      </div>
    </div>
  )
}
