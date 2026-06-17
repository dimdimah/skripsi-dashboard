import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AddUserForm from '@/components/admin/add-user-form'

export default function AdminAddUserPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-1.5 animate-fade-in-up">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-[10px]">+</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
            Tambah User
          </p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-slate-900 leading-[1.1]">
          Tambah User Baru.
        </h1>
        <p className="text-slate-600">
          Buat akun user baru secara manual.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <AddUserForm />
      </div>

      <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-100 p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <span className="mt-0.5 text-slate-900 text-sm font-bold">✦</span>
        <div>
          <p className="text-sm font-medium text-slate-900">Info</p>
          <p className="mt-1 text-xs text-slate-600">
            User akan langsung aktif tanpa perlu verifikasi email. Password minimal 6 karakter dan email harus menggunakan domain <strong>@amikomsolo.ac.id</strong>.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-sky-200 bg-sky-50 p-5 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
        <span className="mt-0.5 text-amikom-purple text-sm flex-shrink-0">◇</span>
        <div>
          <p className="text-sm font-medium text-amikom-purple">Import Massal?</p>
          <p className="mt-1 text-xs text-slate-600">
            Ingin menambah banyak user sekaligus?{' '}
            <Link href="/admin/bulk-import" className="font-semibold text-amikom-purple underline decoration-amikom-purple/20 underline-offset-2 hover:decoration-amikom-purple">
              Gunakan import CSV
            </Link>
            untuk mengupload data puluhan user dalam sekali proses.
          </p>
        </div>
      </div>
    </div>
  )
}
