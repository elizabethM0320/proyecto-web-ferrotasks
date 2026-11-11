import { getTasks } from '@/app/actions/tasks'
import { KanbanBoard } from '@/components/board/kanban-board'

export default async function BoardPage() {
  const tasks = await getTasks()
  return <KanbanBoard tasks={tasks} />
}
