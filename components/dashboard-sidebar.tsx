'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { logout } from '@/lib/auth-actions'
import { isActiveLink } from '@/lib/utils'
import type { Profile } from '@/types/database'
import {
  Home, Briefcase, ClipboardList, Search, Sparkles, User,
  Users, BarChart3, Download, Plus, LogOut, ChevronLeft, X, ChevronRight,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SidebarProps {
  profile: Profile | null
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const sidebarWidth = 240
const sidebarCollapsedWidth = 64

const iconClass = 'h-[18px] w-[18px] shrink-0'

const userNav = [
  { href: '/dashboard', label: 'Beranda', icon: <Home className={iconClass} /> },
  { href: '/dashboard/track-record', label: 'Track Record', icon: <Briefcase className={iconClass} /> },
  { href: '/dashboard/tracer-study', label: 'Tracer Study', icon: <ClipboardList className={iconClass} /> },
  { href: '/dashboard/career', label: 'Lowongan', icon: <Search className={iconClass} /> },
  { href: '/user/rekomendasi', label: 'Rekomendasi', icon: <Sparkles className={iconClass} /> },
  { href: '/dashboard/profile', label: 'Profil', icon: <User className={iconClass} /> },
]

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: <Home className={iconClass} /> },
  { href: '/admin/alumni', label: 'Alumni', icon: <Users className={iconClass} /> },
  { href: '/admin/kuesioner', label: 'Kuesioner', icon: <ClipboardList className={iconClass} /> },
  { href: '/admin/career-center', label: 'Karir', icon: <Briefcase className={iconClass} /> },
  { href: '/admin/analytics', label: 'Analitik', icon: <BarChart3 className={iconClass} /> },
  { href: '/admin/bulk-import', label: 'Import Users', icon: <Download className={iconClass} /> },
]

export default function DashboardSidebar({ profile, collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const isSuperUser = profile?.role === 'super_user'
  const navItems = isSuperUser ? adminNav : userNav

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar (sheet) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -sidebarWidth }}
            animate={{ x: 0 }}
            exit={{ x: -sidebarWidth }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 h-full bg-white md:hidden"
            style={{ width: sidebarWidth }}
          >
            <SidebarContent
              navItems={navItems}
              pathname={pathname}
              profile={profile}
              collapsed={false}
              onToggle={() => {}}
              onClose={onMobileClose}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? sidebarCollapsedWidth : sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:block fixed left-0 top-0 z-30 h-full border-r border-amikom-hairline bg-white"
      >
        <SidebarContent
          navItems={navItems}
          pathname={pathname}
          profile={profile}
          collapsed={collapsed}
          onToggle={onToggle}
          onClose={() => {}}
        />
      </motion.aside>
    </>
  )
}

function SidebarContent({
  navItems, pathname, profile, collapsed, onToggle, onClose,
}: {
  navItems: { href: string; label: string; icon: ReactNode }[]
  pathname: string
  profile: Profile | null
  collapsed: boolean
  onToggle: () => void
  onClose: () => void
}) {
  const initials = profile?.email?.charAt(0).toUpperCase() || '?'

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-amikom-hairline px-4">
        <Link href={profile?.role === 'super_user' ? '/admin' : '/dashboard'} className="flex items-center gap-3 overflow-hidden">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-xs font-bold">
            ◇
          </span>
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            className="font-sans text-sm font-semibold tracking-[-0.02em] text-amikom-ink whitespace-nowrap"
          >
            SITRACK
          </motion.span>
        </Link>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="md:hidden h-8 w-8 flex items-center justify-center rounded-md text-amikom-ink/60 hover:bg-amikom-parchment hover:text-amikom-ink transition-colors"
          aria-label="Tutup sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const active = isActiveLink(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-amikom-purple/10 text-amikom-purple'
                  : 'text-amikom-ink/60 hover:bg-amikom-parchment hover:text-amikom-ink'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0 flex items-center">{item.icon}</span>
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                className="whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-amikom-hairline p-3 space-y-1">
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggle}
          className="hidden md:flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-amikom-ink/40 hover:text-amikom-ink hover:bg-amikom-parchment transition-colors overflow-hidden"
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          <ChevronLeft className={`h-4 w-4 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            className="whitespace-nowrap overflow-hidden"
          >
            Ciutkan
          </motion.span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-amikom-parchment text-left overflow-hidden">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-xs font-semibold">
                {initials}
              </span>
              <motion.div
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                className="overflow-hidden flex items-center gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amikom-ink truncate">{profile?.full_name || profile?.email || 'Pengguna'}</p>
                  <p className="text-[11px] text-amikom-ink/40 truncate">{profile?.email || ''}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-amikom-ink/20" />
              </motion.div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" onClick={onClose}>
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 focus:bg-red-50">
              <LogOut className="h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
