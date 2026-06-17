'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, changePassword } from '@/lib/actions/profile'
import type { Profile } from '@/types/database'
import { Toaster, toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile form
  const [fullName, setFullName] = useState('')
  const [nim, setNim] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      const profileData = p as Profile | null
      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
        setNim(profileData.nim || '')
        setTanggalLahir(profileData.tanggal_lahir || '')
        setPhone(profileData.phone || '')
        setBio(profileData.bio || '')
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('full_name', fullName)
      fd.append('phone', phone)
      fd.append('bio', bio)
      fd.append('nim', nim)
      fd.append('tanggal_lahir', tanggalLahir)
      await updateProfile(fd)
      toast.success('Profil berhasil diperbarui')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter')
      return
    }
    setChangingPassword(true)
    try {
      const fd = new FormData()
      fd.append('current_password', currentPassword)
      fd.append('new_password', newPassword)
      fd.append('confirm_password', confirmPassword)
      await changePassword(fd)
      toast.success('Password berhasil diubah')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center py-16">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amikom-purple border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="page-container space-y-8 pb-8">
      <Toaster position="top-center" />
      {/* Header */}
      <div className="space-y-2 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-xs">👤</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Profile</p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold text-slate-900 leading-[1.1] tracking-[-0.03em]">
          My Profile.
        </h1>
        <p className="text-slate-600">Kelola informasi akun dan pengaturan Anda.</p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left — Edit Profile */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-6">Edit Profile</p>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Nama Lengkap</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">NIM</label>
                <input type="text" value={nim} onChange={(e) => setNim(e.target.value)}
                  placeholder="Nomor Induk Mahasiswa"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Tanggal Lahir</label>
                <input type="date" value={tanggalLahir} onChange={(e) => setTanggalLahir(e.target.value)}
                  className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-3.5 py-2.5 text-sm text-amikom-ink outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Email</label>
                <input type="email" value={profile?.email || ''} readOnly
                  className="w-full rounded-md border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed" />
                <p className="text-xs text-slate-500">Email tidak dapat diubah</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">No. Telepon</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812 3456 7890"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  placeholder="Tulis bio singkat..."
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20 resize-none" />
              </div>

              <button type="submit" disabled={saving}
                className="w-full rounded-md bg-amikom-purple px-4 py-2.5 text-sm font-medium text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? (
                  <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Menyimpan...</>
                ) : 'Simpan Perubahan'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-6">Ganti Password</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Password Saat Ini</label>
                <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Password Baru</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Konfirmasi Password Baru</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
              </div>
              <button type="submit" disabled={changingPassword}
                className="w-full rounded-md bg-amikom-purple px-4 py-2.5 text-sm font-medium text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm disabled:opacity-50 flex items-center justify-center gap-2">
                {changingPassword ? (
                  <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Mengganti...</>
                ) : 'Ganti Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right — Profile Preview */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sticky top-20">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-6">Profile Preview</p>
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                <span className="text-2xl font-semibold text-slate-900 font-mono">
                  {(fullName || profile?.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{fullName || 'User'}</p>
                <p className="text-sm text-slate-600">{profile?.email}</p>
                <span className={`mt-2 inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-medium font-mono tracking-wider uppercase ${
                  profile?.role === 'super_user' ? 'bg-amikom-purple text-amikom-jonquil-warm' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${profile?.role === 'super_user' ? 'bg-amikom-jonquil-warm' : 'bg-slate-500'}`} />
                  {profile?.role === 'super_user' ? 'Super User' : 'Alumni'}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {nim && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">NIM</p>
                  <p className="mt-0.5 text-sm text-slate-900">{nim}</p>
                </div>
              )}
              {phone && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Telepon</p>
                  <p className="mt-0.5 text-sm text-slate-900">{phone}</p>
                </div>
              )}
              {bio && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Bio</p>
                  <p className="mt-0.5 text-sm text-slate-600">{bio}</p>
                </div>
              )}
              <div className="h-px bg-slate-200" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Bergabung Sejak</p>
                <p className="mt-0.5 text-sm text-slate-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
