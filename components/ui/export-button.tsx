'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

export function ExportButton({ onExport, filename, label, loadingLabel }: {
  onExport: () => Promise<string | void>
  filename: string
  label: string
  loadingLabel?: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    try {
      setLoading(true)
      const base64 = await onExport()
      if (base64) {
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export failed:', err)
      alert('Gagal mengekspor data. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      {loading ? (loadingLabel || 'Mengekspor...') : label}
    </button>
  )
}
