import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProfileView } from '@/components/profile/profile-view'
import { auth } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  return (
    <ProfileView
      user={{
        name: session.user.name,
        email: session.user.email,
        createdAt: new Date(session.user.createdAt).toISOString(),
      }}
    />
  )
}
