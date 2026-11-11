import { Plus } from 'lucide-react'
import { STATUS_DOT, STATUS_LABEL, type Status, type TaskDTO } from '@/lib/tasks'
import { cn } from '@/lib/utils'
import { TaskCard } from './task-card'

const COUNT_STYLE: Record<Status, string> = {
  PENDIENTE: 'bg-card text-muted-foreground',
  EN_PROGRESO: 'bg-warning/15 text-warning-foreground border-warning/30',
  COMPLETADA: 'bg-success/10 text-success-foreground border-success/30',
}

export function KanbanColumn({
  status,
  tasks,
  onAdd,
  onEdit,
}: {
  status: Status
  tasks: TaskDTO[]
  onAdd: () => void
  onEdit: (task: TaskDTO) => void
}) {
  return (
    <section
      aria-label={STATUS_LABEL[status]}
      className="flex min-h-64 flex-col rounded-2xl border bg-muted/50 p-3"
    >
      <header className="flex items-center justify-between px-2 py-2">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
          <span className={cn('size-2 rounded-full', STATUS_DOT[status])} aria-hidden />
          {STATUS_LABEL[status]}
          <span
            className={cn(
              'flex size-6 items-center justify-center rounded-full border text-xs font-semibold',
              COUNT_STYLE[status],
            )}
          >
            {tasks.length}
          </span>
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          aria-label={`Añadir tarea en ${STATUS_LABEL[status]}`}
        >
          <Plus className="size-4" />
        </button>
      </header>
      <div className="mt-2 flex flex-col gap-3">
        {tasks.length === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Sin tareas. Haz clic para crear una.
          </button>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={() => onEdit(task)} />
          ))
        )}
      </div>
    </section>
  )
}
