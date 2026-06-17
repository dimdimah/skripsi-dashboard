import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/utils/get-role'
import { StatsGrid } from '@/components/dashboard/stats-grid'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getCurrentProfile()

  const { count: trackCount } = await supabase
    .from('track_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: tracerData } = await supabase
    .from('tracer_study_responses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { count: jobCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div className="page-container space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-1.5 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-[10px]">◇</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
            Dashboard
          </p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-slate-900 leading-[1.1]">
          Overview
        </h1>
        <p className="text-slate-600">
          Welcome back, <span className="text-slate-900 font-medium">{profile?.email}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <StatsGrid
          trackRecordCount={trackCount ?? 0}
          tracerStudyFilled={!!tracerData}
          jobCount={jobCount ?? 0}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-sans text-base font-semibold tracking-[-0.02em] text-slate-900">Quick Actions</h3>
                <p className="mt-0.5 text-sm text-slate-600">Mulai dari sini</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a href="/dashboard/track-record"
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Track Record</p>
                <p className="text-sm text-slate-900 mt-1 font-medium">Kelola Riwayat Kerja</p>
                <p className="text-xs text-slate-500 mt-0.5">{trackCount ?? 0} record tersimpan</p>
              </a>
              <a href="/dashboard/tracer-study"
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Tracer Study</p>
                <p className="text-sm text-slate-900 mt-1 font-medium">Isi Kuesioner</p>
                <p className="text-xs text-slate-500 mt-0.5">{tracerData ? 'Sudah diisi' : 'Belum diisi'}</p>
              </a>
              <a href="/dashboard/career"
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Career Center</p>
                <p className="text-sm text-slate-900 mt-1 font-medium">Lihat Lowongan</p>
                <p className="text-xs text-slate-500 mt-0.5">{jobCount ?? 0} lowongan aktif</p>
              </a>
              <a href="/user/rekomendasi"
                className="rounded-lg border border-amikom-purple/20 bg-amikom-purple/5 p-4 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amikom-purple">Smart Match</p>
                <p className="text-sm text-slate-900 mt-1 font-medium">Rekomendasi Lowongan</p>
                <p className="text-xs text-slate-500 mt-0.5">Berdasarkan profil kamu</p>
              </a>
              <a href="/dashboard/profile"
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Profile</p>
                <p className="text-sm text-slate-900 mt-1 font-medium">Edit Profil</p>
                <p className="text-xs text-slate-500 mt-0.5">Perbarui data diri</p>
              </a>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-sans text-base font-semibold tracking-[-0.02em] text-slate-900">Account Info</h3>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Email</p>
              <p className="mt-1.5 text-sm text-slate-900 break-all">{profile?.email}</p>
            </div>
            <div className="h-px bg-slate-200" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Role</p>
              <div className="mt-1.5">
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold font-mono tracking-wider uppercase border ${
                  profile?.role === 'super_user'
                    ? 'bg-amikom-purple text-amikom-jonquil-warm border-amikom-purple'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                    profile?.role === 'super_user' ? 'bg-amikom-jonquil-warm' : 'bg-amikom-purple'
                  }`} />
                  {profile?.role === 'super_user' ? 'Super User' : 'User'}
                </span>
              </div>
            </div>
            <div className="h-px bg-slate-200" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Member Since</p>
              <p className="mt-1.5 text-sm text-slate-900">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
