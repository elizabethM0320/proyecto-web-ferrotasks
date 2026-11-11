'use client'

import { Loader2 } from 'lucide-react'
import { useId, useState, useTransition, type FormEvent } from 'react'
import { toast } from 'sonner'
import { createTask, updateTask } from '@/app/actions/tasks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  taskCode,
  type Priority,
  type Status,
  type TaskDTO,
} from '@/lib/tasks'

function toLocalInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskDTO
  defaultStatus: Status
}) {
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'MEDIA')
  const [status, setStatus] = useState<Status>(task?.status ?? defaultStatus)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const id = useId()

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const due = String(form.get('dueDate') ?? '')
    const input = {
      title: String(form.get('title') ?? ''),
      description: String(form.get('description') ?? ''),
      priority,
      status,
      dueDate: due ? new Date(due).toISOString() : null,
    }
    setError(null)
    startTransition(async () => {
      const res = task ? await updateTask(task.id, input) : await createTask(input)
      if (!res.ok) {
        setError(res.error)
        return
      }
      toast.success(task ? 'Tarea actualizada' : 'Tarea creada')
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task ? 'Editar tarea' : 'Nueva tarea'}
            {task && (
              <span className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-mono text-[11px] text-primary">
                {taskCode(task.id)}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Define el título, prioridad, estado y fecha límite de la tarea.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-title`}>Título</Label>
            <Input
              id={`${id}-title`}
              name="title"
              required
              maxLength={200}
              defaultValue={task?.title}
              placeholder="Ej. Calibración de balanza de tolva #3"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-desc`}>
              Descripción <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id={`${id}-desc`}
              name="description"
              maxLength={2000}
              rows={3}
              defaultValue={task?.description ?? ''}
              placeholder="Detalles, alcance o notas de la tarea"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-priority`}>Prioridad</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger id={`${id}-priority`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-status`}>Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger id={`${id}-status`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-due`}>Fecha límite</Label>
            <Input
              id={`${id}-due`}
              name="dueDate"
              type="datetime-local"
              defaultValue={toLocalInput(task?.dueDate ?? null)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {task ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
