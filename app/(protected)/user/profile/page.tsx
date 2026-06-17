'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/lib/actions/profile'
import type { Profile } from '@/types/database'
import { Toaster, toast } from 'sonner'
import SkillInput from '@/components/skill-input'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [location, setLocation] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [preferredType, setPreferredType] = useState('')

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('full_name', fullName)
      fd.append('phone', phone)
      fd.append('bio', bio)
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
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-xs">◎</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
            Profile
          </p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold text-slate-900 leading-[1.1] tracking-[-0.03em]">
          My Profile.
        </h1>
        <p className="text-slate-600">
          Manage your account information and settings
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column — Edit Form */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <form onSubmit={handleSubmit}>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-6">
                Edit Profile
              </p>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-3.5 py-2.5 text-sm text-amikom-ink placeholder-amikom-ink/30 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    readOnly
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">Email tidak dapat diubah</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-3.5 py-2.5 text-sm text-amikom-ink placeholder-amikom-ink/30 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tulis bio singkat..."
                    className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-3.5 py-2.5 text-sm text-amikom-ink placeholder-amikom-ink/30 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20 resize-none"
                  />
                </div>

                <div className="h-px bg-slate-200" />

                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amikom-purple mb-4">
                    Matching Preferences
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                    Skills
                  </label>
                  <SkillInput
                    value={skills}
                    onChange={setSkills}
                    placeholder="JavaScript, React, Node.js, Python"
                  />
                  <p className="text-[10px] text-slate-500">Ketik untuk melihat saran skill yang umum digunakan</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                    Lokasi Preferensi
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Yogyakarta, Jakarta, Remote"
                    className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-3.5 py-2.5 text-sm text-amikom-ink placeholder-amikom-ink/30 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                      Pendidikan
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-3.5 py-2.5 text-sm text-amikom-ink outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                    >
                      <option value="">Pilih</option>
                      <option value="SMA">SMA / SMK</option>
                      <option value="D3">D3</option>
                      <option value="D4">D4</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                      Tipe Pekerjaan
                    </label>
                    <select
                      value={preferredType}
                      onChange={(e) => setPreferredType(e.target.value)}
                      className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-3.5 py-2.5 text-sm text-amikom-ink outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                    >
                      <option value="">Pilih</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                    Ekspektasi Gaji
                  </label>
                  <input
                    type="text"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="5-8 juta"
                    className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-3.5 py-2.5 text-sm text-amikom-ink placeholder-amikom-ink/30 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                  />
                  <p className="text-[10px] text-slate-500">Format: minimal-maksimal (contoh: 5-8 juta)</p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                   className="w-full rounded-pill bg-amikom-purple px-4 py-2.5 text-sm font-medium text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Menyimpan...</>
                  ) : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right column — Profile Preview */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-6">
              Profile Preview
            </p>

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
                  profile?.role === 'super_user'
                    ? 'bg-amikom-purple text-amikom-jonquil-warm'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                    profile?.role === 'super_user' ? 'bg-amikom-jonquil-warm' : 'bg-slate-500'
                  }`} />
                  {profile?.role === 'super_user' ? 'Super User' : 'Alumni'}
                </span>
              </div>
            </div>

            <div className="mt-6 h-px bg-slate-200" />

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Email</p>
                  <p className="mt-0.5 text-sm text-slate-900 break-all">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Full Name</p>
                  <p className="mt-0.5 text-sm text-slate-900">{fullName || profile?.full_name || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Role</p>
                  <p className="mt-0.5 text-sm text-slate-900">
                    {profile?.role === 'super_user' ? 'Super User' : 'Regular User'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Member Since</p>
                  <p className="mt-0.5 text-sm text-slate-900">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-amikom-purple mb-3">Matching Preferences</p>
              </div>

              {skills && (
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amikom-purple/10 border border-amikom-purple/20 text-amikom-purple">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Skills</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {skills.split(',').map((s, i) => (
                        <span key={i} className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {location && (
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-slate-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Lokasi</p>
                    <p className="mt-0.5 text-sm text-slate-900">{location}</p>
                  </div>
                </div>
              )}

              {(educationLevel || preferredType || expectedSalary) && (
                <div className="grid grid-cols-3 gap-4">
                  {educationLevel && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Pendidikan</p>
                      <p className="mt-0.5 text-sm text-slate-900">{educationLevel}</p>
                    </div>
                  )}
                  {preferredType && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Tipe</p>
                      <p className="mt-0.5 text-sm text-slate-900">{preferredType}</p>
                    </div>
                  )}
                  {expectedSalary && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Gaji</p>
                      <p className="mt-0.5 text-sm text-slate-900 font-mono">{expectedSalary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
