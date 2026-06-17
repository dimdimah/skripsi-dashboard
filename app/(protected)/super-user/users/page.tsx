import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'
import { AdminStatsGrid } from '@/components/dashboard/admin-stats'
import { UsersDataTable } from '@/components/dashboard/users-data-table'

export default async function ManajemenUserPage() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="page-container py-8">
        <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
          <span className="mt-0.5 text-red-500 text-sm flex-shrink-0">⚠</span>
          <p className="text-sm text-red-600">Gagal memuat data: {error.message}</p>
        </div>
      </div>
    )
  }

  const safeUsers: Profile[] = users ?? []
  const superUserCount = safeUsers.filter((u) => u.role === 'super_user').length
  const regularUserCount = safeUsers.filter((u) => u.role === 'user').length

  return (
    <div className="page-container space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-1.5 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-[10px]">◆</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
            Admin Panel
          </p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-slate-900 leading-[1.1]">
          User Management
        </h1>
        <p className="text-slate-600">
          Manage all registered users and their roles
        </p>
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <AdminStatsGrid
          totalUsers={users?.length || 0}
          superUserCount={superUserCount}
          regularUserCount={regularUserCount}
        />
      </div>

      {/* Users Table */}
      <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-semibold tracking-[-0.02em] text-slate-900">
              All Users
            </h2>
            <p className="mt-1 text-sm text-slate-600 font-mono">
              <span className="text-slate-900 font-medium">{users?.length}</span> total users{' · '}
              <span className="text-amikom-purple font-medium">{superUserCount}</span> super users{' · '}
              <span className="text-slate-600">{regularUserCount}</span> regular users
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/super-user/bulk-import"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-400 hover:text-slate-900"
            >
              <span>📋</span>
              Bulk Import
            </a>
            <a
              href="/super-user/add-user"
              className="inline-flex items-center gap-2 rounded-pill bg-amikom-purple px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm"
            >
              <span>+</span>
              Add New User
            </a>
          </div>
        </div>
        <UsersDataTable users={safeUsers} />
      </div>
    </div>
  )
}
