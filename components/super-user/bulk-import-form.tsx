'use client'

import { useState, useMemo, useRef } from 'react'
import { bulkImportUsers, type BulkImportResult } from '@/lib/actions/bulk-import'
import { excelFileToCSV } from '@/components/download-template-button'

export default function BulkImportForm() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [raw, setRaw] = useState('')
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BulkImportResult | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    setLoading(true)

    try {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      if (isExcel) {
        const csv = await excelFileToCSV(file)
        setRaw(csv)
      } else {
        const text = await file.text()
        setRaw(text)
      }
    } catch {
      setResult({
        total: 0, success: 0, failed: 1,
        errors: [{ row: 0, message: 'Gagal membaca file. Pastikan format file benar.' }],
      })
    } finally {
      setLoading(false)
    }
  }

  function clearFile() {
    setRaw('')
    setFileName('')
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const preview = useMemo(() => {
    if (!raw.trim()) return []
    const lines = raw.trim().split('\n').filter(Boolean)
    if (lines.length < 2) return []
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase())
    return lines.slice(1).map((line, i) => {
      const cols = parseCSVLine(line)
      const email = cols[headers.findIndex(h => h === 'email')] || ''
      const name = cols[headers.findIndex(h => h === 'nama' || h === 'name' || h === 'display_name')] || ''
      const role = cols[headers.findIndex(h => h === 'role' || h === 'roles')] || 'user'
      const skills = cols[headers.findIndex(h => h === 'skills' || h === 'skill')] || ''
      const location = cols[headers.findIndex(h => h === 'location' || h === 'lokasi')] || ''
      return { row: i + 2, email, name, role, skills, location, valid: email.includes('@') && name.length > 0 }
    })
  }, [raw])

  async function handleImport() {
    if (!raw.trim()) return
    setImporting(true)
    setResult(null)
    try {
      const res = await bulkImportUsers(raw)
      setResult(res)
    } catch (err) {
      setResult({
        total: 0, success: 0, failed: 1,
        errors: [{ row: 0, message: err instanceof Error ? err.message : 'Gagal mengimpor' }],
      })
    } finally {
      setImporting(false)
    }
  }

  const isExcelFile = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
          Upload File
        </label>
        <p className="text-xs text-slate-500">
          Format yang didukung: <code className="text-amikom-purple bg-sky-50 px-1 rounded">.xlsx</code> (Excel) atau <code className="text-amikom-purple bg-sky-50 px-1 rounded">.csv</code>
        </p>

        {!raw ? (
          <label className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 cursor-pointer transition-all hover:border-amikom-purple hover:bg-sky-50/50">
            {loading ? (
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amikom-purple border-t-transparent" />
            ) : (
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">
                {loading ? 'Membaca file...' : 'Klik untuk upload file'}
              </p>
              <p className="text-xs text-slate-400 mt-1">atau seret file ke sini</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-md ${
              isExcelFile ? 'bg-emerald-100 text-emerald-600' : 'bg-amikom-purple/10 text-amikom-purple'
            }`}>
              {isExcelFile ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
              <p className="text-xs text-slate-500">
                {isExcelFile ? 'Excel → CSV' : 'CSV'} · {preview.length} baris data
              </p>
            </div>
            <button
              onClick={clearFile}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-400 hover:text-slate-900"
            >
              Ganti File
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <p className="text-xs font-mono text-slate-600">
              <span className="text-slate-900 font-medium">{preview.length}</span> baris akan diimpor
            </p>
          </div>
          <div className="overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">#</th>
                  <th className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">Nama</th>
                  <th className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">Skills</th>
                  <th className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">Lokasi</th>
                  <th className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.map((p) => (
                  <tr key={p.row} className={`${!p.valid ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-2 text-slate-500 font-mono">{p.row}</td>
                    <td className="px-4 py-2 text-slate-900">{p.name}</td>
                    <td className="px-4 py-2 text-slate-600">{p.email}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                        p.role === 'super_user'
                          ? 'bg-amikom-purple/10 text-amikom-purple'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600 text-xs max-w-[150px] truncate">{p.skills || '—'}</td>
                    <td className="px-4 py-2 text-slate-600 text-xs">{p.location || '—'}</td>
                    <td className="px-4 py-2">
                      {p.valid
                        ? <span className="text-green-600 text-[10px] font-mono">✓</span>
                        : <span className="text-red-500 text-[10px] font-mono">✗</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={importing || preview.length === 0}
        className="w-full rounded-md bg-amikom-purple px-5 py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {importing ? (
          <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Mengimpor...</>
        ) : (
          `Import ${preview.length > 0 ? `${preview.length} User` : 'Data'}`
        )}
      </button>

      {/* Results */}
      {result && (
        <div className={`rounded-lg border p-5 ${
          result.failed === 0
            ? 'border-green-200 bg-green-50'
            : result.success > 0
            ? 'border-amber-200 bg-amber-50'
            : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 text-sm flex-shrink-0 ${
              result.failed === 0 ? 'text-green-600' : result.success > 0 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {result.failed === 0 ? '✓' : result.success > 0 ? '⚠' : '✗'}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                result.failed === 0 ? 'text-green-800' : result.success > 0 ? 'text-amber-800' : 'text-red-800'
              }`}>
                {result.success}/{result.total} berhasil diimpor
              </p>
              {result.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600 font-mono">
                      {e.row > 0 ? `Baris ${e.row}: ` : ''}{e.message}
                    </p>
                  ))}
                </div>
              )}
              {result.success > 0 && (
                <p className="mt-2 text-xs text-green-700">
                  Akun langsung aktif tanpa verifikasi email.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
