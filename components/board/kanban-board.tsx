'use client'

import { Flag, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  isoWeek,
  isOverdue,
  type Priority,
  type Status,
  type TaskDTO,
} from '@/lib/tasks'
import { cn } from '@/lib/utils'
import { KanbanColumn } from './kanban-column'
import { TaskDialog } from './task-dialog'

type StatusFilter = 'ALL' | Status

const PRIORITY_CHIP: Record<Priority, { on: string; dot: string }> = {
  ALTA: { on: 'border-primary/30 bg-primary/10 text-primary', dot: 'bg-primary' },
  MEDIA: {
    on: 'border-warning/40 bg-warning/15 text-warning-foreground',
    dot: 'bg-warning',
  },
  BAJA: {
    on: 'border-muted-foreground/30 bg-muted text-foreground',
    dot: 'bg-muted-foreground/60',
  },
}

export function KanbanBoard({ tasks }: { tasks: TaskDTO[] }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([])
  const [dialog, setDialog] = useState<
    { mode: 'create'; status: Status } | { mode: 'edit'; task: TaskDTO } | null
  >(null)

  const counts = useMemo(() => {
    const c = { ALL: tasks.length, PENDIENTE: 0, EN_PROGRESO: 0, COMPLETADA: 0 }
    for (const t of tasks) c[t.status]++
    return c
  }, [tasks])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false
      if (priorityFilter.length && !priorityFilter.includes(t.priority))
        return false
      if (!q) return true
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q) ||
        `ferro-${t.id}`.includes(q)
      )
    })
  }, [tasks, query, statusFilter, priorityFilter])

  const progress = counts.ALL
    ? Math.round((counts.COMPLETADA / counts.ALL) * 100)
    : 0
  const overdue = tasks.filter(isOverdue).length
  const visibleStatuses =
    statusFilter === 'ALL' ? STATUSES : STATUSES.filter((s) => s === statusFilter)

  const togglePriority = (p: Priority) =>
    setPriorityFilter((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )

  return (
    <>
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur md:top-0 md:px-6">
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Buscar tareas</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tareas por nombre o código..."
            className="h-10 w-full rounded-xl border bg-card pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-3 focus:ring-primary/15"
          />
        </label>
        <dl className="hidden items-center gap-4 rounded-xl border bg-card px-4 py-2 text-sm lg:flex">
          <Stat label="Total" value={counts.ALL} />
          <Stat label="En Curso" value={counts.EN_PROGRESO} className="text-warning-foreground" />
          <Stat label="Completadas" value={counts.COMPLETADA} className="text-success-foreground" />
        </dl>
        <Button
          onClick={() => setDialog({ mode: 'create', status: 'PENDIENTE' })}
          className="h-10 rounded-xl px-4 font-semibold"
        >
          <Plus className="size-4" aria-hidden />
          Nueva Tarea
        </Button>
      </header>

      <main className="flex flex-col gap-6 px-4 py-6 md:px-6">
        <section className="flex flex-col gap-5 rounded-2xl border bg-card p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-accent text-primary">
              <Flag className="size-5" aria-hidden />
            </span>
            <div>
              <h1 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-balance">
                Sprint Semana {isoWeek()} · Mis Tareas
                <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success-foreground">
                  En marcha
                </span>
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {counts.ALL} tareas planificadas
                {overdue > 0 && (
                  <>
                    {' • '}
                    <span className="text-primary">{overdue} vencidas</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="w-full md:w-72">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avance del Sprint</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
            {(['ALL', ...STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  statusFilter === s
                    ? 'border-foreground bg-foreground text-background'
                    : 'bg-card text-foreground hover:bg-muted',
                )}
              >
                {s === 'ALL' ? 'Todas' : STATUS_LABEL[s]} ({counts[s]})
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Filtrar por prioridad">
            <span className="text-sm text-muted-foreground">Prioridad:</span>
            {PRIORITIES.map((p) => {
              const on = priorityFilter.includes(p)
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePriority(p)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors',
                    on ? PRIORITY_CHIP[p].on : 'bg-card text-muted-foreground hover:bg-muted',
                  )}
                >
                  <span className={cn('size-1.5 rounded-full', PRIORITY_CHIP[p].dot)} aria-hidden />
                  {PRIORITY_LABEL[p]}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className={cn(
            'grid gap-5',
            visibleStatuses.length === 3 ? 'lg:grid-cols-3' : 'max-w-xl',
          )}
        >
          {visibleStatuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={filtered.filter((t) => t.status === status)}
              onAdd={() => setDialog({ mode: 'create', status })}
              onEdit={(task) => setDialog({ mode: 'edit', task })}
            />
          ))}
        </div>
      </main>

      <TaskDialog
        key={
          dialog
            ? dialog.mode === 'edit'
              ? `edit-${dialog.task.id}`
              : `create-${dialog.status}`
            : 'closed'
        }
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        task={dialog?.mode === 'edit' ? dialog.task : undefined}
        defaultStatus={dialog?.mode === 'create' ? dialog.status : 'PENDIENTE'}
      />
    </>
  )
}

function Stat({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd className={cn('font-semibold', className)}>{value}</dd>
    </div>
  )
}
