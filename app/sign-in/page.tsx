import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthCard } from '@/components/auth/auth-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { auth } from '@/lib/auth'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-5 md:px-22">
        <p className="flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          Sistema operacional activo
        </p>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <AuthCard />
      </main>
      <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">
        © CVG Ferrominera Orinoco • Puerto Ordaz, Venezuela
      </footer>
    </div>
  )
}
