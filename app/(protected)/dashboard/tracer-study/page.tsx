'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitTracerStudy, getTracerStudyResponse } from '@/lib/actions/tracer-study'
import type { TracerStudyQuestion, TracerStudyResponse } from '@/types/database'
import { PageHeader } from '@/components/ui/page-header'
import { GraduationCap, CheckCircle2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { EMPLOYMENT_STATUSES, EDUCATION_LEVELS, SALARY_RANGES, FIELD_MATCH_OPTIONS } from '@/lib/constants'

const steps = ['Data Kelulusan', 'Pendidikan', 'Pekerjaan', 'Saran']

export default function TracerStudyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [existingResponse, setExistingResponse] = useState<TracerStudyResponse | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [questions, setQuestions] = useState<TracerStudyQuestion[]>([])
  const [formData, setFormData] = useState({
    graduation_year: '',
    education_level: '',
    employment_status: '',
    company: '',
    position: '',
    salary_range: '',
    study_field_match: '',
    suggestions: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const existing = await getTracerStudyResponse()
      const existingData = existing as TracerStudyResponse | null
      if (existingData) {
        setExistingResponse(existingData)
        setSubmitted(true)
        setFormData({
          graduation_year: existingData.graduation_year?.toString() || '',
          education_level: existingData.education_level || '',
          employment_status: existingData.employment_status || '',
          company: existingData.company || '',
          position: existingData.position || '',
          salary_range: existingData.salary_range || '',
          study_field_match: existingData.study_field_match?.toString() || '',
          suggestions: existingData.suggestions || '',
        })

        const angkatan = existingData.graduation_year?.toString()
        const { data: qs } = await supabase
          .from('tracer_study_questions')
          .select('*')
          .eq('is_active', true)
          .eq('angkatan', angkatan)
          .order('display_order')
        if (qs) setQuestions(qs as TracerStudyQuestion[])
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nim')
          .single()
        let angkatan = new Date().getFullYear().toString()
        if ((profile as any)?.nim) {
          const yearPrefix = (profile as any).nim.substring(0, 2)
          const yearNum = parseInt(yearPrefix, 10)
          if (!isNaN(yearNum)) {
            angkatan = `20${yearNum}`
          }
        }
        const { data: qs } = await supabase
          .from('tracer_study_questions')
          .select('*')
          .eq('is_active', true)
          .eq('angkatan', angkatan)
          .order('display_order')
        if (qs) setQuestions(qs as TracerStudyQuestion[])
      }
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value)
      })

      await submitTracerStudy(fd)
      toast.success(existingResponse ? 'Kuesioner berhasil diperbarui!' : 'Kuesioner berhasil dikirim!')
      setExistingResponse({ ...formData, graduation_year: Number(formData.graduation_year) } as TracerStudyResponse)
      setSubmitted(true)
      setCurrentStep(0)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 0: {
        const year = Number(formData.graduation_year)
        return formData.graduation_year.length === 4 && !isNaN(year) && year >= 1990 && year <= 2030
      }
      case 1: return formData.education_level.length > 0
      case 2: {
        if (formData.employment_status === 'Bekerja' || formData.employment_status === 'Wirausaha') {
          return formData.employment_status.length > 0 && formData.company.trim().length > 0 && formData.position.trim().length > 0
        }
        return formData.employment_status.length > 0
      }
      case 3: return true
      default: return false
    }
  }

  function handleEdit() {
    setSubmitted(false)
    setCurrentStep(0)
  }

  // ─── SUBMITTED VIEW ───
  if (submitted && existingResponse) {
    return (
      <div className="page-container space-y-8 pb-8">
        <div className="space-y-1.5 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500 text-white text-[11px]">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Tracer Study</p>
          </div>
          <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-slate-900 leading-[1.1]">
            Kuesioner Terkirim.
          </h1>
          <p className="text-slate-600">
            Terima kasih telah mengisi kuesioner tracer study. Data Anda sangat membantu akreditasi kampus.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Berhasil terkirim</p>
              <p className="mt-1 text-sm text-emerald-700">
                Kuesioner Anda telah tersimpan di database. Data akan digunakan untuk laporan akreditasi.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Ringkasan Jawaban Anda</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryItem label="Tahun Lulus" value={formData.graduation_year || '-'} />
            <SummaryItem label="Pendidikan Terakhir" value={formData.education_level || '-'} />
            <SummaryItem label="Status Pekerjaan" value={formData.employment_status || '-'} />
            {formData.company && <SummaryItem label="Perusahaan" value={formData.company} />}
            {formData.position && <SummaryItem label="Posisi" value={formData.position} />}
            {formData.salary_range && <SummaryItem label="Kisaran Gaji" value={formData.salary_range} />}
            {formData.study_field_match && <SummaryItem label="Kesesuaian Bidang" value={formData.study_field_match} />}
            {formData.suggestions && (
              <div className="sm:col-span-2">
                <SummaryItem label="Kritik & Saran" value={formData.suggestions} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-amikom-purple/30 hover:text-amikom-purple"
          >
            <Pencil className="h-4 w-4" />
            Perbarui Jawaban
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-md bg-amikom-purple px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm active:scale-[0.98]"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ─── FORM VIEW ───
  return (
    <div className="page-container space-y-8 pb-8">
      <PageHeader
        icon={<span className="text-[11px]">📋</span>}
        label="Tracer Study"
        title="Kuesioner Alumni."
        subtitle={existingResponse
          ? 'Anda sudah mengisi kuesioner. Silakan perbarui jika ada perubahan.'
          : 'Bantu kami melacak jejak karir alumni STMIK Amikom Surakarta.'}
      />

      {/* Step Progress */}
      <div className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <button
              onClick={() => i <= currentStep && setCurrentStep(i)}
              disabled={i > currentStep}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium font-mono transition-all ${
                i === currentStep
                  ? 'bg-amikom-purple text-white'
                  : i < currentStep
                  ? 'bg-amikom-purple/10 text-amikom-purple'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{i + 1}</span>
              <span className="hidden sm:inline">{step}</span>
            </button>
            {i < steps.length - 1 && <span className="text-slate-300 text-xs">—</span>}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {/* Step 0: Data Kelulusan */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-4">
                Data Kelulusan
              </p>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                  Tahun Lulus
                </label>
                <input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) => updateField('graduation_year', e.target.value)}
                  placeholder="Contoh: 2024"
                  min={1990}
                  max={2030}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                />
              </div>
            </div>
          )}

          {/* Step 1: Pendidikan */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-4">
                Pendidikan Terakhir
              </p>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                  Pendidikan Terakhir
                </label>
                <select
                  value={formData.education_level}
                  onChange={(e) => updateField('education_level', e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                >
                  <option value="">Pilih pendidikan terakhir</option>
                  {EDUCATION_LEVELS.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Pekerjaan */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-4">
                Status Pekerjaan
              </p>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                  Status Pekerjaan Saat Ini
                </label>
                <select
                  value={formData.employment_status}
                  onChange={(e) => updateField('employment_status', e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                >
                  <option value="">Pilih status</option>
                  {EMPLOYMENT_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {(formData.employment_status === 'Bekerja' || formData.employment_status === 'Wirausaha') && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                      Nama Perusahaan / Usaha
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => updateField('company', e.target.value)}
                      placeholder="Nama perusahaan atau usaha"
                      className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                      Posisi / Jabatan
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => updateField('position', e.target.value)}
                      placeholder="Posisi atau jabatan"
                      className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                      Kisaran Gaji
                    </label>
                    <select
                      value={formData.salary_range}
                      onChange={(e) => updateField('salary_range', e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                    >
                      <option value="">Pilih kisaran gaji</option>
                      {SALARY_RANGES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                      Kesesuaian dengan Bidang Studi
                    </label>
                    <select
                      value={formData.study_field_match}
                      onChange={(e) => updateField('study_field_match', e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
                    >
                      <option value="">Pilih tingkat kesesuaian</option>
                      {FIELD_MATCH_OPTIONS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {formData.employment_status === 'Melanjutkan Studi' && (
                <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-100 p-4">
                  <span className="text-slate-600"><GraduationCap className="h-5 w-5" /></span>
                  <p className="text-sm text-slate-600">
                    Selamat! Kami mendukung keputusan Anda untuk melanjutkan studi.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Saran */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-4">
                Kritik & Saran
              </p>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                  Kritik dan Saran untuk Almamater
                </label>
                <textarea
                  value={formData.suggestions}
                  onChange={(e) => updateField('suggestions', e.target.value)}
                  rows={5}
                  placeholder="Tulis kritik dan saran Anda untuk pengembangan STMIK Amikom Surakarta..."
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-400 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={!canProceed()}
              className="rounded-md bg-amikom-purple px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-amikom-purple px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Mengirim...
                </>
              ) : (
                existingResponse ? 'Perbarui Kuesioner' : 'Kirim Kuesioner'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  )
}
