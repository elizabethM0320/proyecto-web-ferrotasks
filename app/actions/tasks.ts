'use server'

import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tasks, type Task } from '@/lib/db/schema'
import {
  PRIORITIES,
  STATUSES,
  type Priority,
  type Status,
  type TaskDTO,
} from '@/lib/tasks'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('No autorizado')
  return session.user.id
}

function toDTO(t: Task): TaskDTO {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority as Priority,
    status: t.status as Status,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
  }
}

export type TaskInput = {
  title: string
  description?: string | null
  priority: string
  status: string
  dueDate?: string | null
}

type ActionResult = { ok: true } | { ok: false; error: string }

function parseInput(input: TaskInput) {
  const title = String(input.title ?? '').trim()
  if (!title) return { error: 'El título es obligatorio.' } as const
  if (title.length > 200)
    return { error: 'El título no puede superar 200 caracteres.' } as const
  const description = String(input.description ?? '').trim()
  if (description.length > 2000)
    return {
      error: 'La descripción no puede superar 2000 caracteres.',
    } as const
  if (!PRIORITIES.includes(input.priority as Priority))
    return { error: 'Prioridad inválida.' } as const
  if (!STATUSES.includes(input.status as Status))
    return { error: 'Estado inválido.' } as const
  let dueDate: Date | null = null
  if (input.dueDate) {
    dueDate = new Date(input.dueDate)
    if (Number.isNaN(dueDate.getTime()))
      return { error: 'Fecha límite inválida.' } as const
  }
  return {
    value: {
      title,
      description: description || null,
      priority: input.priority as Priority,
      status: input.status as Status,
      dueDate,
    },
  } as const
}

function refresh() {
  revalidatePath('/', 'layout')
}

export async function getTasks(): Promise<TaskDTO[]> {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt))
  return rows.map(toDTO)
}

export async function createTask(input: TaskInput): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = parseInput(input)
  if ('error' in parsed) return { ok: false, error: parsed.error! }
  const v = parsed.value
  await db.insert(tasks).values({
    userId,
    ...v,
    completedAt: v.status === 'COMPLETADA' ? new Date() : null,
  })
  refresh()
  return { ok: true }
}

export async function updateTask(
  id: number,
  input: TaskInput,
): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = parseInput(input)
  if ('error' in parsed) return { ok: false, error: parsed.error! }
  const v = parsed.value
  const [existing] = await db
    .select({ status: tasks.status, completedAt: tasks.completedAt })
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  if (!existing) return { ok: false, error: 'Tarea no encontrada.' }
  await db
    .update(tasks)
    .set({
      ...v,
      completedAt:
        v.status === 'COMPLETADA' ? (existing.completedAt ?? new Date()) : null,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  refresh()
  return { ok: true }
}

export async function setTaskStatus(
  id: number,
  status: string,
): Promise<ActionResult> {
  const userId = await getUserId()
  if (!STATUSES.includes(status as Status))
    return { ok: false, error: 'Estado inválido.' }
  await db
    .update(tasks)
    .set({
      status,
      completedAt: status === 'COMPLETADA' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  refresh()
  return { ok: true }
}

export async function deleteTask(id: number): Promise<ActionResult> {
  const userId = await getUserId()
  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  refresh()
  return { ok: true }
}
