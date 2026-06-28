'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, changePassword } from '@/lib/actions/profile'
import { calculateProfileCompleteness, getProfileCompletenessDetails } from '@/lib/utils/profile-completeness'
import SkillSelector from '@/components/skill-selector'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/ui/page-header'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { Profile } from '@/types/database'
import { EDUCATION_LEVELS, JOB_TYPES } from '@/lib/constants'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completeness, setCompleteness] = useState({ percentage: 0, missingFields: [] as string[] })

  // Profile form
  const [fullName, setFullName] = useState('')
  const [nim, setNim] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  // Matching fields
  const [skills, setSkills] = useState('')
  const [location, setLocation] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [preferredType, setPreferredType] = useState('')

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
        setCompleteness(getProfileCompletenessDetails(profileData))
        setFullName(profileData.full_name || '')
        setNim(profileData.nim || '')
        setTanggalLahir(profileData.tanggal_lahir || '')
        setPhone(profileData.phone || '')
        setBio(profileData.bio || '')
        setSkills(Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '')
        setLocation(profileData.location || '')
        setEducationLevel(profileData.education_level || '')
        setExpectedSalary(profileData.expected_salary || '')
        setPreferredType(profileData.preferred_type || '')
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
      fd.append('skills', skills)
      fd.append('location', location)
      fd.append('education_level', educationLevel)
      fd.append('expected_salary', expectedSalary)
      fd.append('preferred_type', preferredType)
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
      <PageHeader
        icon={<span className="text-xs">👤</span>}
        label="Profile"
        title="My Profile."
        subtitle="Kelola informasi akun dan pengaturan Anda."
      />

      {/* Completeness Banner */}
      {completeness.percentage < 100 && (
        <div className={`rounded-lg border p-5 animate-fade-in-up ${
          completeness.percentage >= 80
            ? 'border-emerald-200 bg-emerald-50'
            : completeness.percentage >= 50
            ? 'border-amber-200 bg-amber-50'
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border ${
              completeness.percentage >= 80
                ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                : completeness.percentage >= 50
                ? 'bg-amber-100 text-amber-600 border-amber-200'
                : 'bg-red-100 text-red-600 border-red-200'
            }`}>
              {completeness.percentage >= 80 ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${
                completeness.percentage >= 80 ? 'text-emerald-800' : completeness.percentage >= 50 ? 'text-amber-800' : 'text-red-800'
              }`}>
                Profil {completeness.percentage}% lengkap
              </p>
              <p className={`mt-1 text-xs ${
                completeness.percentage >= 80 ? 'text-emerald-700' : completeness.percentage >= 50 ? 'text-amber-700' : 'text-red-700'
              }`}>
                {completeness.missingFields.length > 0
                  ? `Lengkapi data berikut untuk rekomendasi yang lebih akurat: ${completeness.missingFields.slice(0, 3).join(', ')}${completeness.missingFields.length > 3 ? '...' : ''}`
                  : 'Profil Anda sudah lengkap!'}
              </p>
              <div className="mt-3 h-2 rounded-full bg-white/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completeness.percentage >= 80 ? 'bg-emerald-500' : completeness.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left — Edit Profile */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-6">Edit Profile</p>

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

              {/* ─── Skills ─── */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] font-mono uppercase tracking-wider text-amikom-purple mb-3">
                  Kemampuan &amp; Preferensi
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Data ini digunakan untuk mencocokkan profil kamu dengan lowongan pekerjaan yang tersedia.
                </p>

                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Skill / Kemampuan</label>
                  <SkillSelector value={skills} onChange={setSkills} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Lokasi Domisili</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lokasi..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Solo Raya">Solo Raya</SelectItem>
                      <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                      <SelectItem value="Semarang">Semarang</SelectItem>
                      <SelectItem value="Jakarta">Jakarta</SelectItem>
                      <SelectItem value="Bandung">Bandung</SelectItem>
                      <SelectItem value="Surabaya">Surabaya</SelectItem>
                      <SelectItem value="Malang">Malang</SelectItem>
                      <SelectItem value="Bali">Bali</SelectItem>
                      <SelectItem value="Luar Jawa">Luar Jawa</SelectItem>
                      <SelectItem value="Remote / WFH">Remote / WFH</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Pendidikan</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                >
                  <option value="">Pilih pendidikan...</option>
                  {EDUCATION_LEVELS.map((e) => (
                    <option key={e} value={e}>{e === 'SMA' ? 'SMA / SMK' : e}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Ekspektasi Gaji</label>
                  <Select value={expectedSalary} onValueChange={setExpectedSalary}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih range gaji..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="1-3 juta">&lt; 3 juta</SelectItem>
                        <SelectItem value="3-5 juta">3 - 5 juta</SelectItem>
                        <SelectItem value="5-10 juta">5 - 10 juta</SelectItem>
                        <SelectItem value="10-20 juta">10 - 20 juta</SelectItem>
                        <SelectItem value="20-50 juta">&gt; 20 juta</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Tipe Pekerjaan</label>
                  <select value={preferredType} onChange={(e) => setPreferredType(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20">
                    <option value="">Pilih tipe...</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
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
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-6">Ganti Password</p>
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
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-6">Profile Preview</p>
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
              {educationLevel && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Pendidikan</p>
                  <p className="mt-0.5 text-sm text-slate-900">{educationLevel}</p>
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
