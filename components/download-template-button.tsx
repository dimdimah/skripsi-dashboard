'use client'

import * as XLSX from 'xlsx'

const HEADERS = [
  'Nama',
  'Email',
  'Password',
  'Role',
  'Skills',
  'Location',
  'Education Level',
  'Expected Salary',
  'Preferred Type',
]

const SAMPLE_DATA = [
  ['Budi Santoso', 'budi@amikomsolo.ac.id', 'rahasia123', 'user', 'JavaScript; React; Node.js', 'Yogyakarta', 'S1', '5-8 juta', 'Full-time'],
  ['Siti Aminah', 'siti@amikomsolo.ac.id', 'amikom456', 'user', 'Python; Machine Learning', 'Jakarta', 'S2', '8-12 juta', 'Full-time'],
  ['Ahmad Fauzi', 'ahmad@amikomsolo.ac.id', 'fauzi789', 'user', 'Java; Spring Boot', 'Surakarta', 'S1', '4-7 juta', 'Contract'],
  ['Dewi Lestari', 'dewi@amikomsolo.ac.id', 'lestari321', 'user', 'Figma; Adobe XD; CSS', 'Remote', 'S1', '5-8 juta', 'Part-time'],
  ['Rudi Hartono', 'rudi@amikomsolo.ac.id', 'hartono654', 'user', 'SQL; PostgreSQL; Excel', 'Yogyakarta', 'D3', '3-5 juta', 'Internship'],
  ['Admin Utama', 'admin@amikomsolo.ac.id', 'admin987', 'super_user', '', '', '', '', ''],
]

export function generateExcelBlob(): Blob {
  const wb = XLSX.utils.book_new()
  const wsData = [HEADERS, ...SAMPLE_DATA]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  ws['!cols'] = [
    { wch: 20 },
    { wch: 30 },
    { wch: 15 },
    { wch: 12 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Template Import')

  const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export function excelFileToCSV(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const csv = XLSX.utils.sheet_to_csv(ws)
        resolve(csv)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Gagal membaca file Excel'))
    reader.readAsArrayBuffer(file)
  })
}

export default function DownloadTemplateButton() {
  function handleDownload() {
    const blob = generateExcelBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'template-import-alumni.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-lg border border-amikom-purple/20 bg-amikom-purple/5 p-5 animate-fade-in-up" style={{ animationDelay: '0.03s' }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amikom-purple/10 text-amikom-purple">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Download Template Excel</p>
            <p className="text-xs text-slate-600 mt-0.5">Gunakan template ini sebagai panduan format import data alumni</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex-shrink-0 rounded-md bg-amikom-purple px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-amikom-purple-hover active:scale-[0.98] flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download .xlsx
        </button>
      </div>
    </div>
  )
}
