'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { initials, isoWeek } from '@/lib/tasks'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'
import { SignOutButton } from './sign-out-button'

type Props = {
  user: { name: string; email: string }
  total: number
  done: number
}

export function AppSidebar({ user, total, done }: Props) {
  const pathname = usePathname()
  const progress = total ? Math.round((done / total) * 100) : 0

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
      <div className="flex items-center gap-3 border-b px-5 py-5">
        <BrandLogo size={40} />
        <div className="min-w-0">
          <p className="text-[17px] leading-tight font-semibold text-foreground">
            FerroTasks
          </p>
          <p className="text-xs text-muted-foreground">Gestión de Tareas</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-xl border bg-background px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="size-2 rounded-full bg-success" aria-hidden />
              Sprint Semanal
            </p>
            <span className="rounded-full border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
              Semana {isoWeek()}
            </span>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Avance del sprint"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>{progress}% ejecutado</span>
            <span>
              {done}/{total}
            </span>
          </p>
        </div>
      </div>

      <nav aria-label="Principal" className="flex flex-col gap-1 px-4 pt-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'border-primary/15 bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                  : 'border-transparent text-sidebar-foreground hover:bg-muted',
              )}
            >
              <Icon className="size-4.5" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {'showCount' in item && item.showCount && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {total}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t px-4 py-4">
        <ThemeToggle variant="row" />
        <div className="mt-3 flex items-center gap-3 rounded-xl border bg-background p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user.email}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}
