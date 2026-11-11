import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTasks } from '@/app/actions/tasks'
import { AppSidebar } from '@/components/app/app-sidebar'
import { MobileNav } from '@/components/app/mobile-nav'
import { auth } from '@/lib/auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const tasks = await getTasks()
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'COMPLETADA').length
  const user = { name: session.user.name, email: session.user.email }

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar user={user} total={total} done={done} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav user={user} total={total} />
        {children}
      </div>
    </div>
  )
}
