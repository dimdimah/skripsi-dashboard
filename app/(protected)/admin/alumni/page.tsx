'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { resetUserPassword, deleteUser } from '@/lib/actions/alumni'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Search, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import AddUserForm from '@/components/admin/add-user-form'
import type { Profile } from '@/types/database'
import { Toaster, toast } from 'sonner'

export default function AdminAlumniPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showResetPw, setShowResetPw] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    try {
      const supabase = createClient()
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (data) setUsers(data as Profile[])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.nim || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleResetPassword() {
    if (!selectedUser || !newPassword) return
    setActionLoading(true)
    try {
      await resetUserPassword(selectedUser.id, newPassword)
      toast.success(`Password ${selectedUser.email} berhasil direset`)
      setShowResetPw(false)
      setNewPassword('')
      setSelectedUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal reset password')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedUser) return
    if (!confirm(`Yakin ingin menghapus akun ${selectedUser.email}? Tindakan ini tidak dapat dibatalkan.`)) return
    setActionLoading(true)
    try {
      await deleteUser(selectedUser.id)
      toast.success(`Akun ${selectedUser.email} berhasil dihapus`)
      setSelectedUser(null)
      loadUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus akun')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Toaster position="top-center" />
      {/* Header */}
      <div className="space-y-1.5 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-[10px]">◆</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Admin Panel</p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-slate-900 leading-[1.1]">
          Manajemen Alumni.
        </h1>
        <p className="text-slate-600">Kelola akun alumni, reset password, dan hapus akun.</p>
      </div>

      {/* Stats + Search + Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="text-sm text-slate-600 font-mono">
          <span className="text-slate-900 font-medium">{users.length}</span> total akun
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari email, nama, atau NIM..."
              className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="rounded-md bg-amikom-purple px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            Tambah User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amikom-purple border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold font-mono uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold font-mono uppercase tracking-wider text-slate-500">Nama</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold font-mono uppercase tracking-wider text-slate-500">NIM</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold font-mono uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold font-mono uppercase tracking-wider text-slate-500">Bergabung</th>
                  <th className="px-6 py-3.5 text-center text-[10px] font-semibold font-mono uppercase tracking-wider text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors duration-200 hover:bg-slate-50">
                    <td className="px-6 py-4"><p className="text-sm font-medium text-slate-900">{user.email}</p></td>
                    <td className="px-6 py-4"><p className="text-sm text-slate-600">{user.full_name || '—'}</p></td>
                    <td className="px-6 py-4"><p className="text-sm text-slate-600 font-mono">{user.nim || '—'}</p></td>
                    <td className="px-6 py-4">
                      <Badge variant={user.role === 'super_user' ? 'default' : 'secondary'}>
                        {user.role === 'super_user' ? 'Super User' : 'User'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500">
                        {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setSelectedUser(user)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-2xl text-slate-500">◆</span>
                        <p className="text-sm text-slate-500">{searchQuery ? 'Tidak ada hasil' : 'Belum ada pengguna'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedUser && !showResetPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-md mx-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Aksi</p>
                <h3 className="font-sans text-lg font-semibold text-slate-900 mt-1">{selectedUser.email}</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="space-y-3">
              <button onClick={() => { setShowResetPw(true); setNewPassword('') }}
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 text-left transition-all hover:border-slate-400 hover:bg-slate-50">
                🔑 Reset Password
              </button>
              <button onClick={handleDelete} disabled={actionLoading}
                className="w-full rounded-md border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 text-left transition-all hover:bg-red-50 hover:border-red-300 disabled:opacity-50">
                {actionLoading ? 'Menghapus...' : '🗑️ Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
            <DialogDescription>
              Buat akun user baru. User akan langsung aktif tanpa verifikasi email.
            </DialogDescription>
          </DialogHeader>
          <AddUserForm onSuccess={() => { setShowAddDialog(false); loadUsers() }} />
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      {showResetPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => { setShowResetPw(false); setSelectedUser(null) }}>
          <div className="w-full max-w-md mx-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-4">Reset Password</p>
            <p className="text-sm text-slate-600 mb-4">
              Masukkan password baru untuk <strong>{selectedUser?.email}</strong>
            </p>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password baru (min. 6 karakter)" minLength={6}
              className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20 mb-4" />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setShowResetPw(false); setSelectedUser(null) }}
                className="rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-400 hover:text-slate-900">
                Batal
              </button>
              <button onClick={handleResetPassword} disabled={actionLoading || newPassword.length < 6}
                className="rounded-md bg-amikom-purple px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm disabled:opacity-50">
                {actionLoading ? 'Menyimpan...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
