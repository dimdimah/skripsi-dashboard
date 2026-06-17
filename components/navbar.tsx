'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth-actions'
import { isActiveLink } from '@/lib/utils'
import type { Profile } from '@/types/database'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar'
import LogoutButton from '@/components/logout-button'

interface NavbarProps {
  profile: Profile | null
}

export default function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isSuperUser = profile?.role === 'super_user'

  const primaryLinks = isSuperUser
    ? [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/alumni', label: 'Alumni' },
        { href: '/admin/bulk-import', label: 'Import' },
        { href: '/admin/analytics', label: 'Analitik' },
        { href: '/admin/kuesioner', label: 'Kuesioner' },
        { href: '/admin/career-center', label: 'Karir' },
      ]
    : [
        { href: '/dashboard', label: 'Beranda' },
        { href: '/dashboard/tracer-study', label: 'Kuesioner' },
        { href: '/dashboard/track-record', label: 'Riwayat' },
        { href: '/dashboard/career', label: 'Lowongan' },
        { href: '/user/rekomendasi', label: 'Rekomendasi' },
        { href: '/dashboard/profile', label: 'Profil' },
      ]

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-50 h-14 border-b border-amikom-hairline bg-white/95 backdrop-blur-md">
        <div className="page-container h-full">
          <div className="flex h-full items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-xs font-bold">
                  ◇
                </span>
                <span className="hidden sm:inline-block font-sans text-sm font-semibold tracking-[-0.02em] text-amikom-ink">
                  SITRACK
                </span>
              </div>

              <div className="hidden md:flex items-center gap-1">
                {primaryLinks.map((link) => {
                  const active = isActiveLink(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        active
                          ? 'text-amikom-purple '
                          : 'text-amikom-ink/40 hover:text-amikom-ink'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-md text-amikom-ink/60 hover:bg-amikom-parchment hover:text-amikom-ink transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              <Menubar className="border-none bg-transparent p-0">
                <MenubarMenu>
                  <MenubarTrigger className="rounded-md focus:bg-amikom-parchment focus:text-amikom-ink data-[state=open]:bg-amikom-parchment data-[state=open]:text-amikom-ink">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-sm font-semibold">
                      {profile?.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </MenubarTrigger>
                  <MenubarContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-amikom-ink truncate">
                        {profile?.full_name || profile?.email || 'Pengguna'}
                      </p>
                    </div>
                    <MenubarSeparator />
                    <MenubarItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem
                      className="text-amikom-danger focus:bg-amikom-danger-bg focus:text-amikom-danger"
                      onClick={() => logout()}
                    >
                      <LogoutButton />
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-amikom-hairline bg-white/95 backdrop-blur-md">
            <div className="page-container py-3">
              <div className="flex flex-col gap-1">
                {primaryLinks.map((link) => {
                  const active = isActiveLink(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-amikom-purple-light text-amikom-purple'
                          : 'text-amikom-ink/40 hover:bg-amikom-parchment hover:text-amikom-ink'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 top-14 z-40 bg-black/20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
