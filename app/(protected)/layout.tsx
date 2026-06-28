'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Toaster } from 'sonner'
import Navbar from '@/components/navbar'
import DashboardSidebar from '@/components/dashboard-sidebar'
import type { Profile } from '@/types/database'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data as Profile | null)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return null

  const sidebarOffset = isDesktop ? (sidebarCollapsed ? 64 : 240) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar
        profile={profile}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarOffset,
        }}
      >
        <Navbar
          profile={profile}
          onSidebarToggle={() => {
            if (isDesktop) {
              setSidebarCollapsed(!sidebarCollapsed)
            } else {
              setMobileSidebarOpen(!mobileSidebarOpen)
            }
          }}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="min-h-[calc(100vh-3.5rem)] py-6 text-slate-600">
          {children}
        </main>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fafafc',
            border: '1px solid #e0e0e0',
            color: '#1d1d1f',
            fontSize: '14px',
            borderRadius: '11px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
        }}
      />
    </div>
  )
}
