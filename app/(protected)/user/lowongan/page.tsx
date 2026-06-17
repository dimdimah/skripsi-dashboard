'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import type { Job } from '@/types/database'

const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'] as const

export default function LowonganPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        if (data) setJobs(data as Job[])
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = activeFilter === 'All' || job.type === activeFilter
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="page-container space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-xs">▽</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
            Alumni Portal
          </p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold text-slate-900 leading-[1.1] tracking-[-0.03em]">
          Daftar Lowongan.
        </h1>
        <p className="text-slate-600">
          Temukan peluang karir terbaik untuk alumni.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lowongan, perusahaan, atau skill..."
            className="w-full rounded-md border border-amikom-hairline bg-amikom-canvas px-10 py-2.5 text-sm text-amikom-ink placeholder-amikom-ink/30 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20 shadow-sm"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
        {jobTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`rounded-md px-4 py-1.5 text-xs font-medium font-mono uppercase tracking-wider transition-all ${
              activeFilter === type
                ? 'bg-amikom-purple text-amikom-jonquil-warm shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Job count */}
      {!loading && (
        <p className="text-xs font-mono text-slate-500 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-amikom-purple">{filteredJobs.length}</span> lowongan ditemukan
        </p>
      )}

      {/* Loading or Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amikom-purple border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className="group relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                style={{ animationDelay: `${0.12 + index * 0.03}s` }}
              >
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans text-base font-semibold text-slate-900 truncate">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">{job.company}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs text-slate-500">{job.location}</span>
                      </div>
                    </div>
                    <Badge variant={job.type === 'Full-time' ? 'default' : job.type === 'Internship' ? 'warning' : 'secondary'}>
                      {job.type}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-md border border-slate-200/60 bg-slate-50/60 px-2.5 py-1 text-[11px] font-medium font-mono text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/40">
                    <span className="text-sm font-semibold text-slate-900 font-mono">{job.salary || '—'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(job.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <span className="text-3xl text-slate-500">▽</span>
              <p className="mt-4 text-sm text-slate-500">Tidak ada lowongan yang ditemukan</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveFilter('All') }}
                className="mt-4 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer stats */}
      {!loading && jobs.length > 0 && (
        <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-200/30 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900 font-mono">{jobs.length}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Total Lowongan</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-amikom-purple font-mono">{jobs.filter(j => j.type === 'Full-time').length}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Full Time</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-amber-500 font-mono">{jobs.filter(j => j.type === 'Internship').length}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Internship</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900 font-mono">{jobs.filter(j => j.location === 'Remote').length}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Remote</p>
          </div>
        </div>
      )}
    </div>
  )
}
