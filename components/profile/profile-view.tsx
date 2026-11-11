'use client'

import { KeyRound, Loader2, Monitor, Moon, Palette, ShieldCheck, Sun, UserRound } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMounted } from '@/components/theme-toggle'
import { useRouter } from 'next/navigation'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { initials } from '@/lib/tasks'
import { cn } from '@/lib/utils'

type User = { name: string; email: string; createdAt: string }

export function ProfileView({ user }: { user: User }) {
  return (
    <main className="flex flex-col gap-6 px-4 py-6 md:px-6">
      <div>
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          FerroTasks / <span className="text-primary">Configuración de usuario</span>
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-balance md:text-3xl">
          Perfil & Ajustes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra tu información personal, credenciales de acceso y
          preferencias de interfaz.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border bg-card p-5 md:p-6">
            <div className="flex items-center gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">CVG Ferrominera Orinoco</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Miembro desde{' '}
                  {new Date(user.createdAt).toLocaleDateString('es-VE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Correo institucional
              </p>
              <p className="mt-2 flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 font-mono text-sm">
                <span className="truncate">{user.email}</span>
                <ShieldCheck className="size-4 shrink-0 text-success" aria-label="Cuenta protegida" />
              </p>
            </div>
          </section>

          <PersonalInfoCard name={user.name} />
        </div>

        <div className="flex flex-col gap-6">
          <AppearanceCard />
          <PasswordCard />
        </div>
      </div>
    </main>
  )
}

function Card({
  icon,
  title,
  tag,
  children,
}: {
  icon: ReactNode
  title: string
  tag: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 md:p-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-semibold">
          <span className="text-primary" aria-hidden>
            {icon}
          </span>
          {title}
        </h2>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {tag}
        </span>
      </header>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function PersonalInfoCard({ name }: { name: string }) {
  const router = useRouter()
  const id = useId()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = String(new FormData(e.currentTarget).get('name') ?? '').trim()
    if (!value) return toast.error('El nombre es obligatorio.')
    setLoading(true)
    const { error } = await authClient.updateUser({ name: value })
    setLoading(false)
    if (error) return toast.error('No se pudo actualizar el perfil.')
    toast.success('Perfil actualizado')
    router.refresh()
  }

  return (
    <Card icon={<UserRound className="size-5" />} title="Información personal" tag="Perfil">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={id}>Nombre completo</Label>
          <Input id={id} name="name" defaultValue={name} required maxLength={100} autoComplete="name" />
        </div>
        <Button type="submit" disabled={loading} className="self-end">
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Guardar cambios
        </Button>
      </form>
    </Card>
  )
}

function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const options = [
    { value: 'light', label: 'Modo Claro', icon: Sun },
    { value: 'dark', label: 'Modo Oscuro', icon: Moon },
    { value: 'system', label: 'Automático', icon: Monitor },
  ] as const

  return (
    <Card icon={<Palette className="size-5" />} title="Preferencias de pantalla" tag="UI-Config">
      <p className="text-sm font-medium">Modo de visualización</p>
      <div className="mt-3 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Tema">
        {options.map((o) => {
          const active = mounted && theme === o.value
          const Icon = o.icon
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(o.value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm transition-colors',
                active
                  ? 'border-primary bg-accent font-semibold text-primary'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon className="size-5" aria-hidden />
              {o.label}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function PasswordCard() {
  const id = useId()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const currentPassword = String(form.get('current') ?? '')
    const newPassword = String(form.get('next') ?? '')
    const confirm = String(form.get('confirm') ?? '')
    if (newPassword.length < 8)
      return toast.error('La nueva contraseña debe tener al menos 8 caracteres.')
    if (newPassword !== confirm) return toast.error('Las contraseñas no coinciden.')
    setLoading(true)
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    })
    setLoading(false)
    if (error) return toast.error('No se pudo cambiar la contraseña. Verifica la contraseña actual.')
    formEl.reset()
    toast.success('Contraseña actualizada')
  }

  return (
    <Card icon={<KeyRound className="size-5" />} title="Seguridad & Credenciales" tag="Auth-Module">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-current`}>Contraseña actual</Label>
          <Input id={`${id}-current`} name="current" type="password" required autoComplete="current-password" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-next`}>Nueva contraseña</Label>
            <Input
              id={`${id}-next`}
              name="next"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${id}-confirm`}>Confirmar contraseña</Label>
            <Input id={`${id}-confirm`} name="confirm" type="password" required minLength={8} autoComplete="new-password" />
          </div>
        </div>
        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          Las contraseñas se almacenan con hash bcrypt. Al cambiarla se cerrarán
          las demás sesiones activas.
        </p>
        <Button type="submit" disabled={loading} className="self-end">
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Actualizar contraseña
        </Button>
      </form>
    </Card>
  )
}
