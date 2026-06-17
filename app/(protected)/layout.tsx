// FILE: app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import BottomBar from '@/components/bottom-bar'
import { getCurrentProfile } from '@/utils/get-role'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getCurrentProfile()

  return (
    <>
      <Navbar profile={profile} />
      <main className="min-h-screen bg-slate-50 pb-28 pt-14 text-slate-600">
        {children}
      </main>
      <BottomBar profile={profile} />
    </>
  )
}
