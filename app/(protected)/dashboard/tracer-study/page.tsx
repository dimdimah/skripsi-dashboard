'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitTracerStudy, getTracerStudyResponse } from '@/lib/actions/tracer-study'
import type { TracerStudyQuestion, TracerStudyResponse } from '@/types/database'
import { GraduationCap } from 'lucide-react'
import { Toaster, toast } from 'sonner'

const steps = ['Data Kelulusan', 'Pendidikan', 'Pekerjaan', 'Saran']

export default function TracerStudyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [existingResponse, setExistingResponse] = useState<TracerStudyResponse | null>(null)
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

      // Get existing response to determine user's angkatan
      const existing = await getTracerStudyResponse()
      const existingData = existing as TracerStudyResponse | null
      if (existingData) {
        setExistingResponse(existingData)
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

        // Load questions for the user's angkatan
        const angkatan = existingData.graduation_year?.toString()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: qs } = await (supabase.from('tracer_study_questions') as any)
          .select('*')
          .eq('is_active', true)
          .eq('angkatan', angkatan)
          .order('display_order')
        if (qs) setQuestions(qs as unknown as TracerStudyQuestion[])
      } else {
        // No existing response: try to get angkatan from profile (NIM first 2 digits + 2000)
        const { data: profile } = await supabase
          .from('profiles')
          .select('nim')
          .single() as { data: { nim: string | null } | null; error: unknown }
        let angkatan = new Date().getFullYear().toString()
        if (profile?.nim) {
          const yearPrefix = profile.nim.substring(0, 2)
          const yearNum = parseInt(yearPrefix, 10)
          if (!isNaN(yearNum)) {
            angkatan = `20${yearNum}`
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: qs } = await (supabase.from('tracer_study_questions') as any)
          .select('*')
          .eq('is_active', true)
          .eq('angkatan', angkatan)
          .order('display_order')
        if (qs) setQuestions(qs as unknown as TracerStudyQuestion[])
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
      router.refresh()
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

  return (
    <div className="page-container space-y-8 pb-8">
      <Toaster position="top-center" />
      {/* Header */}
      <div className="space-y-2 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-xs">📋</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">Tracer Study</p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold text-slate-900 leading-[1.1] tracking-[-0.03em]">
          Kuesioner Alumni.
        </h1>
        <p className="text-slate-600">
          {existingResponse
            ? 'Anda sudah mengisi kuesioner. Silakan perbarui jika ada perubahan.'
            : 'Bantu kami melacak jejak karir alumni STMIK Amikom Surakarta.'}
        </p>
      </div>

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
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-4">
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
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-4">
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
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Pekerjaan */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-4">
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
                  <option value="Bekerja">Bekerja</option>
                  <option value="Belum Bekerja">Belum Bekerja</option>
                  <option value="Wirausaha">Wirausaha</option>
                  <option value="Melanjutkan Studi">Melanjutkan Studi</option>
                  <option value="Tidak bekerja / Mencari pekerjaan">Tidak bekerja / Mencari pekerjaan</option>
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
                      <option value="< 3 juta">&lt; Rp 3.000.000</option>
                      <option value="3-5 juta">Rp 3.000.000 - Rp 5.000.000</option>
                      <option value="5-10 juta">Rp 5.000.000 - Rp 10.000.000</option>
                      <option value="10-20 juta">Rp 10.000.000 - Rp 20.000.000</option>
                      <option value="> 20 juta">&gt; Rp 20.000.000</option>
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
                      <option value="Sangat Sesuai">Sangat Sesuai</option>
                      <option value="Sesuai">Sesuai</option>
                      <option value="Kurang Sesuai">Kurang Sesuai</option>
                      <option value="Tidak Sesuai">Tidak Sesuai</option>
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
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500 mb-4">
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
