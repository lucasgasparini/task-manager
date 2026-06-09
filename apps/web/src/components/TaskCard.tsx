import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types/task.ts'
import { useDeleteTask } from '../hooks/useTasks.ts'

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
}

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
}

interface Props {
  task: Task
}

export function TaskCard({ task }: Props) {
  const deleteTask = useDeleteTask()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Drag handle */}
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
          aria-label="Arrastar para reorganizar"
        >
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
            <circle cx="3" cy="3" r="1.5" />
            <circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="13" r="1.5" />
            <circle cx="9" cy="13" r="1.5" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 flex-1 leading-snug">{task.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {task.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
          )}

          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={() => {
                if (confirm('Excluir esta tarefa?')) deleteTask.mutate(task.id)
              }}
              disabled={deleteTask.isPending}
              className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
            >
              Excluir
            </button>
          </div>

          {task.dueDate && (
            <p className="mt-1 text-xs text-gray-400">
              Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
