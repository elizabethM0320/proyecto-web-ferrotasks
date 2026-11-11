export const PRIORITIES = ['ALTA', 'MEDIA', 'BAJA'] as const
export const STATUSES = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA'] as const

export type Priority = (typeof PRIORITIES)[number]
export type Status = (typeof STATUSES)[number]

export const PRIORITY_LABEL: Record<Priority, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
}

export const STATUS_LABEL: Record<Status, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En Progreso',
  COMPLETADA: 'Completada',
}

export const PRIORITY_STYLES: Record<Priority, string> = {
  ALTA: 'bg-primary/10 text-primary border-primary/20',
  MEDIA: 'bg-warning/15 text-warning-foreground border-warning/30',
  BAJA: 'bg-muted text-muted-foreground border-border',
}

export const STATUS_DOT: Record<Status, string> = {
  PENDIENTE: 'bg-muted-foreground/60',
  EN_PROGRESO: 'bg-warning',
  COMPLETADA: 'bg-success',
}

export function taskCode(id: number) {
  return `FERRO-${id}`
}

export type TaskDTO = {
  id: number
  title: string
  description: string | null
  priority: Priority
  status: Status
  dueDate: string | null
  completedAt: string | null
  createdAt: string
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter((p) => p && !p.endsWith('.'))
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'FT'
  )
}

export function isOverdue(task: Pick<TaskDTO, 'dueDate' | 'status'>) {
  return (
    !!task.dueDate &&
    task.status !== 'COMPLETADA' &&
    new Date(task.dueDate).getTime() < Date.now()
  )
}

export function formatDue(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round(
    (startOfDay(date) - startOfDay(now)) / 86_400_000,
  )
  const time = date.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  })
  if (diffDays === 0) return `Hoy, ${time}`
  if (diffDays === 1) return `Mañana, ${time}`
  if (diffDays === -1) return `Ayer, ${time}`
  return date.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
}

export function isoWeek(date = new Date()) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}
