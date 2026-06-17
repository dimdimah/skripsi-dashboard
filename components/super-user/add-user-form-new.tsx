'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddUserForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'super_user'>('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } },
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      setEmail('')
      setPassword('')
      setRole('user')

      setTimeout(() => {
        router.push('/super-user/users')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
          <span className="mt-0.5 text-red-500 text-sm flex-shrink-0">⚠</span>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-100 p-4">
          <span className="mt-0.5 text-slate-900 text-sm flex-shrink-0">✓</span>
          <div>
            <p className="text-sm font-medium text-slate-900">User created successfully.</p>
            <p className="mt-0.5 text-xs text-slate-600">Redirecting...</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600 font-mono uppercase tracking-wider">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'super_user')}
            className="w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-amikom-purple focus:ring-2 focus:ring-amikom-purple/20"
          >
            <option value="user">Regular User</option>
            <option value="super_user">Super User</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-amikom-purple px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Creating User...
          </>
        ) : (
          'Create User'
        )}
      </button>
    </form>
  )
}
