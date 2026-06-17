'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getJobRecommendations } from '@/lib/actions/matching'
import { Badge } from '@/components/ui/badge'
import type { MatchResult } from '@/types/database'

const confidenceColors = {
  high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-500 border-slate-200',
}

const confidenceLabels = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
}

function ScoreBar({ score }: { score: number }) {
  const percent = Math.round(score * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: percent >= 70 ? '#22c55e' : percent >= 40 ? '#f59e0b' : '#ef4444',
          }}
        />
      </div>
      <span className="text-sm font-semibold font-mono text-slate-900 w-10 text-right">
        {percent}%
      </span>
    </div>
  )
}

function BreakdownDetail({ breakdown }: { breakdown: MatchResult['breakdown'] }) {
  const items = [
    { label: 'Skill', value: breakdown.skill, icon: '◇' },
    { label: 'Lokasi', value: breakdown.location, icon: '◎' },
    { label: 'Gaji', value: breakdown.salary, icon: '◈' },
    { label: 'Tipe', value: breakdown.type, icon: '▹' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">{item.icon}</span>
          <span className="text-slate-500">{item.label}</span>
          <span className={`font-mono font-medium ${
            item.value === null ? 'text-slate-400' :
            item.value >= 0.7 ? 'text-emerald-600' :
            item.value >= 0.4 ? 'text-amber-600' : 'text-red-500'
          }`}>
            {item.value === null ? '—' : `${Math.round(item.value * 100)}%`}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function RekomendasiPage() {
  const [results, setResults] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score')

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getJobRecommendations(20)
        setResults(data)
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const sorted = [...results].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score
    return new Date(b.job.created_at).getTime() - new Date(a.job.created_at).getTime()
  })

  return (
    <div className="page-container space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-xs">★</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
            Smart Matching
          </p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold text-slate-900 leading-[1.1] tracking-[-0.03em]">
          Rekomendasi Lowongan.
        </h1>
        <p className="text-slate-600">
          Lowongan yang dipilih berdasarkan profil dan preferensi kamu.
        </p>
      </div>

      {/* Sort controls */}
      {!loading && results.length > 0 && (
        <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <span className="text-xs font-mono text-slate-500">Urutkan:</span>
          <button
            onClick={() => setSortBy('score')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium font-mono transition-all ${
              sortBy === 'score'
                ? 'bg-amikom-purple text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'
            }`}
          >
            Score Tertinggi
          </button>
          <button
            onClick={() => setSortBy('date')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium font-mono transition-all ${
              sortBy === 'date'
                ? 'bg-amikom-purple text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'
            }`}
          >
            Terbaru
          </button>
        </div>
      )}

      {/* Stats summary */}
      {!loading && results.length > 0 && (
        <div className="flex items-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900 font-mono">{results.length}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Total Match</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-emerald-600 font-mono">
              {results.filter(r => r.score >= 0.7).length}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">High Match</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-amber-500 font-mono">
              {results.filter(r => r.score >= 0.4 && r.score < 0.7).length}
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Medium Match</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amikom-purple border-t-transparent" />
        </div>
      ) : results.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 rounded-lg border border-slate-200 bg-white">
          <span className="text-3xl text-slate-500">★</span>
          <p className="mt-4 text-sm text-slate-500">Belum ada rekomendasi</p>
          <p className="mt-1 text-xs text-slate-400">Lengkapi profil kamu untuk mendapatkan rekomendasi lowongan</p>
          <a
            href="/user/profile"
            className="mt-4 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all"
          >
            Lengkapi Profil
          </a>
        </div>
      ) : (
        /* Results grid */
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {sorted.map((result, index) => {
            const isExpanded = expandedId === result.job.id
            const percent = Math.round(result.score * 100)

            return (
              <div
                key={result.job.id}
                className="rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-sm"
                style={{ animationDelay: `${0.1 + index * 0.03}s` }}
              >
                {/* Main row */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : result.job.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-sans text-base font-semibold text-slate-900 truncate">
                          {result.job.title}
                        </h3>
                        <Badge variant={result.job.type === 'Full-time' ? 'default' : result.job.type === 'Internship' ? 'warning' : 'secondary'}>
                          {result.job.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">{result.job.company}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs text-slate-500">{result.job.location}</span>
                        {result.job.salary && (
                          <>
                            <span className="text-slate-500">·</span>
                            <span className="text-xs font-mono text-slate-500">{result.job.salary}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Score display */}
                    <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium font-mono px-2 py-0.5 rounded border ${confidenceColors[result.confidence]}`}>
                          {confidenceLabels[result.confidence]}
                        </span>
                      </div>
                      <ScoreBar score={result.score} />
                    </div>
                  </div>

                  {/* Skills */}
                  {result.job.skills && result.job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {result.job.skills.map((skill) => {
                        const isMatched = result.breakdown.skill !== null &&
                          (result.breakdown.skill ?? 0) > 0
                        return (
                          <span
                            key={skill}
                            className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium font-mono ${
                              isMatched
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border border-slate-200/60 bg-slate-50/60 text-slate-600'
                            }`}
                          >
                            {skill}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Expand hint */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400">
                      {result.availableFeatures}/{result.totalFeatures} kriteria terpakai
                    </span>
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <div className="pt-4 space-y-4">
                      {/* Description */}
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                          Deskripsi Lowongan
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {result.job.description}
                        </p>
                      </div>

                      {/* Match breakdown */}
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                          Detail Match
                        </p>
                        <BreakdownDetail breakdown={result.breakdown} />
                      </div>

                      {/* Contact */}
                      {result.job.contact_info && (
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                            Kontak
                          </p>
                          <p className="text-sm text-slate-600">{result.job.contact_info}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-2">
                        {result.job.url && (
                          <a
                            href={result.job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-pill bg-amikom-purple px-5 py-2 text-xs font-medium text-white transition-all hover:bg-amikom-purple-hover active:scale-[0.98]"
                          >
                            Lamar Sekarang
                          </a>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">
                          Sumber: {result.job.source}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
