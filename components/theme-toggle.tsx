'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

const subscribe = () => () => {}

export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

export function ThemeToggle({
  variant = 'pill',
  className,
}: {
  variant?: 'pill' | 'row'
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const isDark = mounted && resolvedTheme === 'dark'
  const toggle = () => setTheme(isDark ? 'light' : 'dark')

  if (variant === 'row') {
    return (
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-muted',
          className,
        )}
      >
        <span className="flex items-center gap-2.5">
          {isDark ? (
            <Moon className="size-4 text-chart-3" aria-hidden />
          ) : (
            <Sun className="size-4 text-warning" aria-hidden />
          )}
          Cambiar Tema
        </span>
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {isDark ? 'Oscuro' : 'Claro'}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm text-foreground shadow-xs transition-colors hover:bg-muted',
        className,
      )}
    >
      {isDark ? (
        <Moon className="size-4 text-chart-3" aria-hidden />
      ) : (
        <Sun className="size-4 text-warning" aria-hidden />
      )}
      {isDark ? 'Modo Oscuro' : 'Modo Claro'}
    </button>
  )
}
