import { getTasks } from '@/app/actions/tasks'
import { MetricsView } from '@/components/metrics/metrics-view'

export default async function MetricsPage() {
  const tasks = await getTasks()
  return <MetricsView tasks={tasks} />
}
