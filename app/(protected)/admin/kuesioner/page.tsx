'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createQuestion, updateQuestion, deleteQuestion, getQuestionsPerAngkatan, getQuestionsByAngkatanPaginated } from '@/lib/actions/questions'
import { exportQuestionsToExcel } from '@/lib/actions/export'
import type { TracerStudyQuestion } from '@/types/database'
import { ClipboardList, ChevronRight, Plus, Download } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface QuestionForm {
  question_text: string
  question_type: string
  options: string
  is_active: boolean
  display_order: number
  angkatan: string
}

const emptyForm: QuestionForm = {
  question_text: '',
  question_type: 'text',
  options: '',
  is_active: true,
  display_order: 0,
  angkatan: new Date().getFullYear().toString(),
}

interface AngkatanStat {
  angkatan: string
  count: number
  active: number
}

export default function AdminKuesionerPage() {
  const [angkatanStats, setAngkatanStats] = useState<AngkatanStat[]>([])
  const [selectedAngkatan, setSelectedAngkatan] = useState<string | null>(null)
  const [questions, setQuestions] = useState<TracerStudyQuestion[]>([])
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [totalQuestionPages, setTotalQuestionPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [questionPage, setQuestionPage] = useState(1)
  const [showAddAngkatan, setShowAddAngkatan] = useState(false)
  const [newAngkatan, setNewAngkatan] = useState(new Date().getFullYear().toString())
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<QuestionForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { loadAngkatanList() }, [])

  async function loadAngkatanList() {
    try {
      const stats = await getQuestionsPerAngkatan()
      setAngkatanStats(stats)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  async function selectAngkatan(angkatan: string) {
    setSelectedAngkatan(angkatan)
    setQuestionPage(1)
    setLoading(true)
    try {
      const result = await getQuestionsByAngkatanPaginated(angkatan, 1)
      setQuestions(result.questions as TracerStudyQuestion[])
      setTotalQuestions(result.total)
      setTotalQuestionPages(result.totalPages)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat pertanyaan')
    } finally {
      setLoading(false)
    }
  }

  async function loadQuestionPage(angkatan: string, page: number) {
    setQuestionPage(page)
    setLoading(true)
    try {
      const result = await getQuestionsByAngkatanPaginated(angkatan, page)
      setQuestions(result.questions as TracerStudyQuestion[])
      setTotalQuestions(result.total)
      setTotalQuestionPages(result.totalPages)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat pertanyaan')
    } finally {
      setLoading(false)
    }
  }

  function goBack() {
    setSelectedAngkatan(null)
    setQuestions([])
  }

  function openAdd() {
    setForm({ ...emptyForm, angkatan: selectedAngkatan || new Date().getFullYear().toString() })
    setEditingId(null)
    setShowFormDialog(true)
  }

  function openEdit(q: TracerStudyQuestion) {
    setForm({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options ? q.options.join('\n') : '',
      is_active: q.is_active,
      display_order: q.display_order,
      angkatan: (q as TracerStudyQuestion & { angkatan?: string }).angkatan || '2024',
    })
    setEditingId(q.id)
    setShowFormDialog(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('question_text', form.question_text)
      fd.append('question_type', form.question_type)
      fd.append('options', form.options)
      fd.append('is_active', form.is_active ? 'true' : 'false')
      fd.append('display_order', form.display_order.toString())
      fd.append('angkatan', form.angkatan)

      if (editingId) {
        await updateQuestion(editingId, fd)
        toast.success('Pertanyaan berhasil diperbarui')
      } else {
        await createQuestion(fd)
        toast.success('Pertanyaan berhasil ditambahkan')
      }

    setShowFormDialog(false)
    if (selectedAngkatan) loadQuestionPage(selectedAngkatan, 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  function confirmDelete(id: string) {
    setDeleteConfirm(id)
  }

  async function handleDelete() {
    if (!deleteConfirm) return
    const promise = deleteQuestion(deleteConfirm)
    toast.promise(promise, {
      loading: 'Menghapus pertanyaan...',
      success: () => {
        setDeleteConfirm(null)
        if (selectedAngkatan) loadQuestionPage(selectedAngkatan, questionPage)
        return 'Pertanyaan berhasil dihapus'
      },
      error: (err) => err instanceof Error ? err.message : 'Terjadi kesalahan',
    })
  }

  async function toggleActive(q: TracerStudyQuestion) {
    try {
      const supabase = createClient()
      await supabase
        .from('tracer_study_questions')
        .update({ is_active: !q.is_active } as never)
        .eq('id', q.id)
      if (selectedAngkatan) loadQuestionPage(selectedAngkatan, questionPage)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status')
    }
  }

  // ═══════════════ VIEW: Angkatan Cards Overview ═══════════════
  if (!selectedAngkatan) {
    return (
      <div className="space-y-8">
        <PageHeader
          icon={<ClipboardList className="h-3.5 w-3.5" />}
          label="Kuesioner"
          title="Kelola Kuesioner."
          subtitle="Pilih angkatan untuk mengelola pertanyaan kuesioner."
        />

        {/* Add Angkatan Button */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <button
            onClick={() => {
              setNewAngkatan(new Date().getFullYear().toString())
              setShowAddAngkatan(true)
            }}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-5 py-3 text-sm font-medium text-slate-500 transition-all hover:border-amikom-purple/40 hover:text-amikom-purple active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Tambah Angkatan Baru
          </button>
        </div>

        {/* Add Angkatan AlertDialog */}
        <AlertDialog open={showAddAngkatan} onOpenChange={setShowAddAngkatan}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tambah Angkatan Baru</AlertDialogTitle>
              <AlertDialogDescription>
                Masukkan tahun angkatan untuk membuat kuesioner baru. Pertanyaan default akan ditambahkan secara otomatis.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider mb-2">
                Tahun Angkatan
              </label>
              <input
                type="number"
                value={newAngkatan}
                onChange={(e) => setNewAngkatan(e.target.value)}
                min={1990}
                max={2030}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    document.getElementById('confirm-add-angkatan')?.click()
                  }
                }}
                placeholder="Contoh: 2024"
                className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                id="confirm-add-angkatan"
                onClick={() => {
                  if (!/^\d{4}$/.test(newAngkatan)) {
                    toast.error('Format tahun harus 4 digit')
                    return
                  }
                  const year = parseInt(newAngkatan, 10)
                  if (year < 1990 || year > 2030) {
                    toast.error('Tahun harus antara 1990 dan 2030')
                    return
                  }
                  const fd = new FormData()
                  fd.append('question_text', 'Tahun Berapa Anda Lulus?')
                  fd.append('question_type', 'number')
                  fd.append('options', '')
                  fd.append('is_active', 'true')
                  fd.append('display_order', '1')
                  fd.append('angkatan', newAngkatan)
                  createQuestion(fd).then(() => {
                    toast.success(`Angkatan ${newAngkatan} berhasil ditambahkan`)
                    setShowAddAngkatan(false)
                    loadAngkatanList()
                  }).catch(err => toast.error(err.message))
                }}
              >
                Tambah
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Angkatan Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amikom-purple border-t-transparent" />
          </div>
        ) : angkatanStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-16">
            <ClipboardList className="h-10 w-10 text-slate-400" />
            <p className="mt-4 text-sm text-slate-500">Belum ada angkatan. Tambahkan angkatan pertama.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {angkatanStats.map((stat) => (
              <button
                key={stat.angkatan}
                onClick={() => selectAngkatan(stat.angkatan)}
                className="group rounded-xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-amikom-purple/30 hover:shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-amikom-purple">
                      Angkatan
                    </p>
                    <p className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-slate-900">
                      {stat.angkatan}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span>{stat.count} pertanyaan</span>
                  <span className="text-green-600">{stat.active} aktif</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ═══════════════ VIEW: Questions for Selected Angkatan ═══════════════
  return (
    <div className="space-y-8">
      <div className="space-y-1.5 animate-fade-in-up">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amikom-purple transition-colors"
        >
          <ChevronRight className="h-3 w-3 rotate-180" />
          Kembali ke Daftar Angkatan
        </button>
        <PageHeader
          icon={<ClipboardList className="h-3.5 w-3.5" />}
          label={`Angkatan ${selectedAngkatan}`}
          title="Pertanyaan Kuesioner."
          subtitle={`${totalQuestions} pertanyaan untuk angkatan ${selectedAngkatan}.`}
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    const base64 = await exportQuestionsToExcel(selectedAngkatan!)
                    const binaryString = atob(base64)
                    const bytes = new Uint8Array(binaryString.length)
                    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i)
                    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `kuesioner-angkatan-${selectedAngkatan}.xlsx`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  } catch {
                    toast.error('Gagal mengekspor data kuesioner')
                  }
                }}
                className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button onClick={openAdd}
                className="rounded-md bg-amikom-purple px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm">
                + Tambah
              </button>
            </div>
          }
        />
      </div>

      {/* Question List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amikom-purple border-t-transparent" />
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-16">
          <ClipboardList className="h-10 w-10 text-slate-400" />
          <p className="mt-4 text-sm text-slate-500">Belum ada pertanyaan untuk angkatan ini</p>
          <button onClick={openAdd} className="mt-4 rounded-pill bg-amikom-purple px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm">
            Tambah Pertanyaan
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-mono text-slate-500">{q.display_order || i + 1}</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-medium ${
                      q.is_active ? 'bg-amikom-purple/10 text-amikom-purple' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {q.question_type}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                      q.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {q.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-900">{q.question_text}</p>
                  {q.options && q.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {q.options.map((opt, idx) => (
                        <span key={`${opt}-${idx}`} className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600">{opt}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => toggleActive(q)}
                    className={`rounded-md border px-3 py-1.5 text-xs transition-all ${
                      q.is_active
                        ? 'border-slate-200 text-slate-600 hover:border-slate-400'
                        : 'border-amikom-purple/30 text-amikom-purple hover:bg-amikom-purple/5'
                    }`}>
                    {q.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button onClick={() => openEdit(q)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-400 hover:text-slate-900">
                    Edit
                  </button>
                  <button onClick={() => confirmDelete(q.id)}
                    className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-300">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={questionPage} totalPages={totalQuestionPages} onPageChange={(p) => loadQuestionPage(selectedAngkatan!, p)} />

      {/* Question Form AlertDialog */}
      <AlertDialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingId ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Angkatan {form.angkatan}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Teks Pertanyaan</label>
              <textarea required value={form.question_text} onChange={(e) => setForm(f => ({ ...f, question_text: e.target.value }))}
                rows={3} placeholder="Tulis pertanyaan..."
                className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20 resize-none" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Tipe</label>
                <select value={form.question_type} onChange={(e) => setForm(f => ({ ...f, question_type: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20">
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                  <option value="radio">Radio</option>
                  <option value="number">Number</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Urutan</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">Angkatan</label>
                <input type="text" value={form.angkatan} onChange={(e) => setForm(f => ({ ...f, angkatan: e.target.value }))}
                  pattern="\d{4}" maxLength={4}
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20" />
              </div>
            </div>

            {(form.question_type === 'select' || form.question_type === 'radio') && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
                  Opsi (pisahkan dengan baris baru)
                </label>
                <textarea value={form.options} onChange={(e) => setForm(f => ({ ...f, options: e.target.value }))}
                  rows={4} placeholder="Opsi 1&#10;Opsi 2&#10;Opsi 3"
                  className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20 resize-none" />
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-amikom-purple focus:ring-amikom-purple/20" />
              <span className="text-sm text-slate-600">Aktif</span>
            </label>
          </form>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowFormDialog(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-form-question"
              onClick={(e) => {
                e.preventDefault()
                handleSubmit(new Event('submit') as unknown as React.FormEvent)
              }}
              className="bg-amikom-purple text-white hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm"
            >
              {submitting ? (
                <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Menyimpan...</>
              ) : editingId ? 'Simpan' : 'Tambah'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pertanyaan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pertanyaan akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
