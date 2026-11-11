'use client'

import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

type Mode = 'sign-in' | 'sign-up'

export function AuthCard() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const ids = { name: useId(), email: useId(), password: useId(), remember: useId() }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const name = String(form.get('name') ?? '').trim()

    if (mode === 'sign-up' && password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    const result =
      mode === 'sign-up'
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password, rememberMe: remember })
    setLoading(false)

    if (result.error) {
      setError(
        mode === 'sign-up'
          ? 'No se pudo crear la cuenta. Verifica los datos e inténtalo de nuevo.'
          : 'Credenciales inválidas. Verifica tu correo y contraseña.',
      )
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-[460px] rounded-2xl border bg-card px-6 py-10 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.12)] sm:px-10">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size={80} />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-balance">
          FerroTasks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestión Operativa y Sprints
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Acceso"
        className="mt-8 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
      >
        {(
          [
            ['sign-in', 'Iniciar Sesión'],
            ['sign-up', 'Crear Cuenta'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => {
              setMode(value)
              setError(null)
            }}
            className={cn(
              'rounded-lg py-2 text-sm font-medium transition-colors',
              mode === value
                ? 'bg-card text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate={false}>
        {mode === 'sign-up' && (
          <Field id={ids.name} label="Nombre completo" icon={<User className="size-4" />}>
            <input
              id={ids.name}
              name="name"
              required
              autoComplete="name"
              placeholder="Ing. Carlos Mendoza"
              className={inputClass}
            />
          </Field>
        )}

        <Field
          id={ids.email}
          label="Correo o identificador"
          icon={<Mail className="size-4" />}
        >
          <input
            id={ids.email}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="operador@ferrominera.gob.ve"
            className={inputClass}
          />
        </Field>

        <Field
          id={ids.password}
          label="Contraseña"
          icon={<Lock className="size-4" />}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        >
          <input
            id={ids.password}
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            placeholder={mode === 'sign-up' ? 'Mínimo 8 caracteres' : '••••••••••••'}
            className={inputClass}
          />
        </Field>

        {mode === 'sign-in' && (
          <div className="flex items-center gap-2.5">
            <Checkbox
              id={ids.remember}
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
            />
            <label htmlFor={ids.remember} className="text-sm text-muted-foreground">
              Recordar sesión en este equipo
            </label>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl text-[15px] font-semibold shadow-[0_6px_16px_-6px] shadow-primary/50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          {mode === 'sign-in' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          {!loading && <ArrowRight className="size-4" aria-hidden />}
        </Button>
      </form>
    </div>
  )
}

const inputClass =
  'h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70'

function Field({
  id,
  label,
  icon,
  trailing,
  children,
}: {
  id: string
  label: string
  icon: ReactNode
  trailing?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-semibold tracking-wider text-foreground/80 uppercase"
      >
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-3.5 transition-colors focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/15">
        <span className="text-muted-foreground" aria-hidden>
          {icon}
        </span>
        {children}
        {trailing}
      </div>
    </div>
  )
}
