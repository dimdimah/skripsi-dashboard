'use client'

import { useState, useEffect } from 'react'
import { getAlumniStats } from '@/lib/actions/alumni'
import { Users, CheckCircle, BarChart3, TrendingUp } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalAlumni: number
    totalSuperUsers: number
    totalUsers: number
    tracerStudyFilled: number
  } | null>(null)

  useEffect(() => {
    getAlumniStats().then(setStats).catch(() => {})
  }, [])

  const responseRate = stats && stats.totalAlumni > 0
    ? Math.round((stats.tracerStudyFilled / stats.totalAlumni) * 100)
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-[10px]">◆</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Admin Panel</p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-slate-900 leading-[1.1]">
          Dashboard Admin.
        </h1>
        <p className="text-slate-600">Ringkasan data alumni dan metrik kampus.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">Total Alumni</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{stats?.totalAlumni || 0}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">Super Users</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{stats?.totalSuperUsers || 0}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amikom-purple/10 text-amikom-purple border border-amikom-purple/20">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">Kuesioner Terisi</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{stats?.tracerStudyFilled || 0}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">Response Rate</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{responseRate}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <a href="/admin/alumni"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Manajemen</p>
          <h3 className="font-sans text-lg font-semibold text-slate-900 mt-2">Kelola Alumni</h3>
          <p className="text-sm text-slate-600 mt-1">Cari, reset password, dan hapus akun alumni.</p>
        </a>
        <a href="/admin/bulk-import"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Import</p>
          <h3 className="font-sans text-lg font-semibold text-slate-900 mt-2">Import User Massal</h3>
          <p className="text-sm text-slate-600 mt-1">Tambah banyak user sekaligus dari data CSV.</p>
        </a>
        <a href="/admin/analytics"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Analisis</p>
          <h3 className="font-sans text-lg font-semibold text-slate-900 mt-2">Lihat Analitik</h3>
          <p className="text-sm text-slate-600 mt-1">Grafik dan statistik data tracer study untuk akreditasi.</p>
        </a>
        <a href="/admin/kuesioner"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Kuesioner</p>
          <h3 className="font-sans text-lg font-semibold text-slate-900 mt-2">Atur Kuesioner</h3>
          <p className="text-sm text-slate-600 mt-1">Kelola pertanyaan kuesioner dan ekspor data Excel.</p>
        </a>
        <a href="/admin/add-user"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">User Baru</p>
          <h3 className="font-sans text-lg font-semibold text-slate-900 mt-2">Tambah User</h3>
          <p className="text-sm text-slate-600 mt-1">Buat akun user baru secara manual satu per satu.</p>
        </a>
        <a href="/admin/career-center"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-sm hover:-translate-y-0.5 block">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Career Center</p>
          <h3 className="font-sans text-lg font-semibold text-slate-900 mt-2">Kelola Lowongan</h3>
          <p className="text-sm text-slate-600 mt-1">Publikasikan dan kelola lowongan kerja untuk alumni.</p>
        </a>
      </div>
    </div>
  )
}
