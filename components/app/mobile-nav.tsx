'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'
import { SignOutButton } from './sign-out-button'

export function MobileNav({
  total,
}: {
  user: { name: string; email: string }
  total: number
}) {
  const pathname = usePathname()
  return (
    <div className="sticky top-0 z-30 border-b bg-sidebar md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={34} />
          <span className="font-semibold">FerroTasks</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle className="px-2.5 py-1 text-xs" />
          <SignOutButton />
        </div>
      </div>
      <nav aria-label="Principal" className="flex gap-1 overflow-x-auto px-3 pb-2">
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
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm',
                active
                  ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
              {'showCount' in item && item.showCount && (
                <span className="text-xs">({total})</span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
