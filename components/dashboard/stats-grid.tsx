'use client'

import { Briefcase, ClipboardCheck, Eye, User } from 'lucide-react'

interface StatsGridProps {
  trackRecordCount: number
  tracerStudyFilled: boolean
  jobCount: number
}

export function StatsGrid({ trackRecordCount, tracerStudyFilled, jobCount }: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">Track Record</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{trackRecordCount}</p>
            <p className="mt-1 text-sm text-slate-600">Riwayat kerja tersimpan</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">Tracer Study</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{tracerStudyFilled ? 'Selesai' : '—'}</p>
            <p className="mt-1 text-sm text-slate-600">{tracerStudyFilled ? 'Kuesioner sudah diisi' : 'Belum mengisi kuesioner'}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            <ClipboardCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">Lowongan Aktif</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{jobCount}</p>
            <p className="mt-1 text-sm text-slate-600">Lowongan kerja tersedia</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            <Eye className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">Akun</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-900">Aktif</p>
            <p className="mt-1 text-sm text-slate-600">Status akun alumni</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            <User className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  )
}
