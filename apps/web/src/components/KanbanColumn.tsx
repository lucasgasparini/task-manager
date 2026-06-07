import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard.tsx'
import type { Task } from '../types/task.ts'

interface Props {
  status: Task['status']
  label: string
  tasks: Task[]
}

export function KanbanColumn({ status, label, tasks }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white drop-shadow">{label}</h2>
        <span className="text-xs bg-white/30 text-white rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 min-h-24 rounded-xl p-2 transition-colors ${
          isOver ? 'bg-white/20 ring-2 ring-white/50' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className={`border-2 border-dashed rounded-lg p-6 text-center text-sm transition-colors ${
            isOver ? 'border-white/60 text-white/80' : 'border-white/30 text-white/50'
          }`}>
            Solte aqui
          </div>
        )}
      </div>
    </div>
  )
}
