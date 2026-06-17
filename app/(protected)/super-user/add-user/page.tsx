import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AddUserFormNew from '@/components/super-user/add-user-form-new'

export default function AddUserPage() {
  return (
    <div className="page-container max-w-2xl space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-1.5 animate-fade-in-up">
        <Link
          href="/super-user/users"
          className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amikom-purple text-amikom-jonquil-warm text-[10px]">+</span>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
            Add New
          </p>
        </div>
        <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-slate-900 leading-[1.1]">
          Add New User
        </h1>
        <p className="text-slate-600">
          Create a new user account and assign a role
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <AddUserFormNew />
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-100 p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <span className="mt-0.5 text-slate-900 text-sm font-bold">✦</span>
        <div>
          <p className="text-sm font-medium text-slate-900">
            Info
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Users will receive an email verification link. They need to confirm their email before they can access the system.
          </p>
        </div>
      </div>
    </div>
  )
}
