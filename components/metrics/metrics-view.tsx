'use client'

import {
  AlarmClock,
  BarChart3,
  CheckCheck,
  Gauge,
  ListChecks,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import {
  PRIORITIES,
  PRIORITY_LABEL,
  PRIORITY_STYLES,
  STATUSES,
  STATUS_LABEL,
  formatDue,
  isOverdue,
  taskCode,
  type TaskDTO,
} from '@/lib/tasks'
import { cn } from '@/lib/utils'

const STATUS_COLOR = {
  PENDIENTE: 'var(--chart-5)',
  EN_PROGRESO: 'var(--chart-2)',
  COMPLETADA: 'var(--chart-4)',
} as const

const PRIORITY_COLOR = {
  ALTA: 'bg-primary',
  MEDIA: 'bg-warning',
  BAJA: 'bg-muted-foreground/50',
} as const

export function MetricsView({ tasks }: { tasks: TaskDTO[] }) {
  const total = tasks.length
  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [s, tasks.filter((t) => t.status === s).length]),
  ) as Record<(typeof STATUSES)[number], number>
  const completion = total ? Math.round((byStatus.COMPLETADA / total) * 100) : 0
  const overdueTasks = tasks.filter(isOverdue)
  const completedWithDue = tasks.filter(
    (t) => t.status === 'COMPLETADA' && t.dueDate && t.completedAt,
  )
  const onTime = completedWithDue.filter(
    (t) => new Date(t.completedAt!) <= new Date(t.dueDate!),
  ).length
  const onTimeRate = completedWithDue.length
    ? Math.round((onTime / completedWithDue.length) * 100)
    : null

  const upcoming = tasks
    .filter((t) => t.status !== 'COMPLETADA' && t.dueDate)
    .sort((a, b) => +new Date(a.dueDate!) - +new Date(b.dueDate!))
    .slice(0, 6)

  let acc = 0
  const gradient = total
    ? `conic-gradient(${STATUSES.map((s) => {
        const start = (acc / total) * 360
        acc += byStatus[s]
        const end = (acc / total) * 360
        return `${STATUS_COLOR[s]} ${start}deg ${end}deg`
      }).join(', ')})`
    : 'conic-gradient(var(--muted) 0deg 360deg)'

  return (
    <main className="flex flex-col gap-6 px-4 py-6 md:px-6">
      <section className="rounded-2xl border bg-card p-5 md:p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-accent text-primary">
            <BarChart3 className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-balance">
              Métricas & Resumen
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Indicadores de entrega, cumplimiento de fechas límite y
              distribución de tus tareas por estado y prioridad.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            icon={Gauge}
            label="Tasa de finalización"
            value={`${completion}%`}
            progress={completion}
            barClass="bg-primary"
            footer={`${byStatus.COMPLETADA} de ${total} tareas`}
          />
          <Kpi
            icon={ListChecks}
            label="Tareas totales"
            value={String(total)}
            progress={total ? (byStatus.EN_PROGRESO / total) * 100 : 0}
            barClass="bg-warning"
            footer={`${byStatus.EN_PROGRESO} en curso · ${byStatus.PENDIENTE} pendientes`}
          />
          <Kpi
            icon={CheckCheck}
            label="Entregas a tiempo"
            value={onTimeRate === null ? '—' : `${onTimeRate}%`}
            progress={onTimeRate ?? 0}
            barClass="bg-success"
            footer={
              completedWithDue.length
                ? `${onTime} de ${completedWithDue.length} con fecha límite`
                : 'Sin entregas con fecha límite'
            }
          />
          <Kpi
            icon={AlarmClock}
            label="Tareas vencidas"
            value={String(overdueTasks.length)}
            progress={total ? (overdueTasks.length / total) * 100 : 0}
            barClass="bg-destructive"
            footer={overdueTasks.length ? 'Requieren atención' : 'Todo al día'}
            valueClass={overdueTasks.length ? 'text-primary' : undefined}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-2xl border bg-card p-5 md:p-6">
          <h2 className="font-semibold">Distribución por estado</h2>
          <p className="text-sm text-muted-foreground">Tareas según su estado actual</p>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
            <div
              className="relative size-40 shrink-0 rounded-full"
              style={{ background: gradient }}
              role="img"
              aria-label={STATUSES.map((s) => `${STATUS_LABEL[s]}: ${byStatus[s]}`).join(', ')}
            >
              <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-card">
                <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
                  Total
                </span>
                <span className="text-3xl font-semibold">{total}</span>
              </div>
            </div>
            <ul className="flex w-full flex-col gap-3">
              {STATUSES.map((s) => (
                <li key={s} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: STATUS_COLOR[s] }}
                      aria-hidden
                    />
                    {STATUS_LABEL[s]}
                  </span>
                  <span className="font-semibold">
                    {total ? Math.round((byStatus[s] / total) * 100) : 0}%{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({byStatus[s]})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 md:p-6">
          <h2 className="font-semibold">Carga por prioridad</h2>
          <p className="text-sm text-muted-foreground">
            Abiertas vs. completadas por nivel de prioridad
          </p>
          <div className="mt-6 flex flex-col gap-5">
            {PRIORITIES.map((p) => {
              const all = tasks.filter((t) => t.priority === p)
              const doneCount = all.filter((t) => t.status === 'COMPLETADA').length
              const pct = all.length ? (doneCount / all.length) * 100 : 0
              return (
                <div key={p}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{PRIORITY_LABEL[p]}</span>
                    <span className="text-muted-foreground">
                      {doneCount}/{all.length} completadas
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full', PRIORITY_COLOR[p])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center justify-between gap-3 border-b p-5 md:px-6">
          <div>
            <h2 className="font-semibold">Próximos vencimientos</h2>
            <p className="text-sm text-muted-foreground">
              Tareas abiertas ordenadas por fecha límite
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            Ver tablero
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No hay tareas abiertas con fecha límite.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs tracking-wider text-muted-foreground uppercase">
                  <th scope="col" className="px-6 py-3 font-medium">Código</th>
                  <th scope="col" className="px-3 py-3 font-medium">Tarea</th>
                  <th scope="col" className="px-3 py-3 font-medium">Prioridad</th>
                  <th scope="col" className="px-3 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-6 py-3 text-right font-medium">Vence</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((t) => {
                  const overdue = isOverdue(t)
                  return (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="px-6 py-3 font-mono text-xs font-semibold text-primary">
                        {taskCode(t.id)}
                      </td>
                      <td className="max-w-xs truncate px-3 py-3 font-medium">{t.title}</td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                            PRIORITY_STYLES[t.priority],
                          )}
                        >
                          {PRIORITY_LABEL[t.priority]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{STATUS_LABEL[t.status]}</td>
                      <td
                        className={cn(
                          'px-6 py-3 text-right whitespace-nowrap',
                          overdue ? 'font-medium text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {overdue ? 'Vencida · ' : ''}
                        {formatDue(t.dueDate!)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  progress,
  barClass,
  footer,
  valueClass,
}: {
  icon: LucideIcon
  label: string
  value: string
  progress: number
  barClass: string
  footer: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <Icon className="size-4 text-primary" aria-hidden />
      </div>
      <p className={cn('mt-3 text-3xl font-semibold', valueClass)}>{value}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', barClass)}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{footer}</p>
    </div>
  )
}
