'use client'

import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CircleDashed,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useOptimistic, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteTask, setTaskStatus } from '@/app/actions/tasks'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PRIORITY_LABEL,
  PRIORITY_STYLES,
  STATUSES,
  STATUS_DOT,
  STATUS_LABEL,
  formatDue,
  isOverdue,
  taskCode,
  type Status,
  type TaskDTO,
} from '@/lib/tasks'
import { cn } from '@/lib/utils'

export function TaskCard({
  task,
  onEdit,
}: {
  task: TaskDTO
  onEdit: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(task.status)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const done = optimisticStatus === 'COMPLETADA'
  const overdue = isOverdue({ ...task, status: optimisticStatus })

  const changeStatus = (status: Status) =>
    startTransition(async () => {
      setOptimisticStatus(status)
      const res = await setTaskStatus(task.id, status)
      if (!res.ok) toast.error(res.error)
    })

  const remove = () =>
    startTransition(async () => {
      const res = await deleteTask(task.id)
      if (res.ok) toast.success('Tarea eliminada')
      else toast.error(res.error)
    })

  return (
    <article
      className={cn(
        'group rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-md',
        pending && 'opacity-70',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {taskCode(task.id)}
        </span>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
              done
                ? 'border-success/30 bg-success/10 text-success-foreground'
                : PRIORITY_STYLES[task.priority],
            )}
          >
            {done ? 'Completada' : PRIORITY_LABEL[task.priority]}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Acciones para ${task.title}`}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-4" /> Editar tarea
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Mover a
              </DropdownMenuLabel>
              {STATUSES.filter((s) => s !== optimisticStatus).map((s) => (
                <DropdownMenuItem key={s} onClick={() => changeStatus(s)}>
                  <span className={cn('size-2 rounded-full', STATUS_DOT[s])} aria-hidden />
                  {STATUS_LABEL[s]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <Checkbox
          checked={done}
          onCheckedChange={(v) => changeStatus(v === true ? 'COMPLETADA' : 'PENDIENTE')}
          aria-label={done ? 'Marcar como pendiente' : 'Marcar como completada'}
          className="mt-0.5 size-5"
        />
        <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
          <h3
            className={cn(
              'text-[15px] leading-snug font-semibold text-pretty',
              done && 'text-muted-foreground line-through',
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={cn(
                'mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground',
                done && 'line-clamp-1',
              )}
            >
              {task.description}
            </p>
          )}
        </button>
      </div>

      <footer className="mt-4 flex items-center justify-between gap-2 border-t pt-3 text-xs">
        <DueLabel task={task} status={optimisticStatus} overdue={overdue} />
        {optimisticStatus === 'EN_PROGRESO' && (
          <span className="flex items-center gap-1 text-warning-foreground">
            <CircleDashed className="size-3.5" aria-hidden />
            En ejecución
          </span>
        )}
      </footer>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {taskCode(task.id)}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente &quot;{task.title}&quot;. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}

function DueLabel({
  task,
  status,
  overdue,
}: {
  task: TaskDTO
  status: Status
  overdue: boolean
}) {
  if (status === 'COMPLETADA') {
    return (
      <span className="flex items-center gap-1.5 text-success-foreground">
        <CheckCircle2 className="size-3.5" aria-hidden />
        {task.completedAt ? `Cerrada ${formatDue(task.completedAt)}` : 'Cerrada'}
      </span>
    )
  }
  if (!task.dueDate) {
    return <span className="text-muted-foreground">Sin fecha límite</span>
  }
  return (
    <span
      className={cn(
        'flex items-center gap-1.5',
        overdue ? 'font-medium text-primary' : 'text-muted-foreground',
      )}
    >
      {overdue ? (
        <Clock className="size-3.5" aria-hidden />
      ) : (
        <CalendarDays className="size-3.5" aria-hidden />
      )}
      {overdue ? 'Vencida · ' : 'Vence: '}
      {formatDue(task.dueDate)}
    </span>
  )
}
