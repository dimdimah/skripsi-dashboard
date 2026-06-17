'use client'

import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { useRouter } from 'next/navigation'
import { login, type LoginState } from '@/lib/auth-actions'
import Link from 'next/link'
import { GalleryVerticalEnd } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const initialState: LoginState = { error: null, redirectTo: null }
  const [state, formAction] = useFormState(login, initialState)

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.redirectTo, router])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#FAFBFC] p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amikom-purple shadow-lg shadow-amikom-purple/20">
                    <GalleryVerticalEnd className="size-6 text-amikom-jonquil-warm" />
                  </div>
                  <span className="sr-only">SITRACK</span>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1E]">
                  Selamat Datang Kembali!
                </h1>
                <div className="text-center text-sm text-[#5A5A6E]">
                   Forum Tracer Study Amikom Solo
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[#1A1A1E]">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@amikomsolo.ac.id"
                  required
                  className="rounded-lg border-[#E8E8ED] bg-white text-[#1A1A1E] placeholder:text-[#8E8E93] focus-visible:ring-amikom-purple/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-[#1A1A1E]">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="rounded-lg border-[#E8E8ED] bg-white text-[#1A1A1E] placeholder:text-[#8E8E93] focus-visible:ring-amikom-purple/20"
                />
              </div>

              {state.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {state.error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-amikom-purple px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amikom-purple-hover hover:text-amikom-jonquil-warm active:scale-[0.98]"
              >
                Masuk
              </button>
            </div>
          </form>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[#E8E8ED]">
            <span className="relative z-10 bg-[#FAFBFC] px-2 text-[#8E8E93]">
              Atau
            </span>
          </div>

          <div className="grid gap-2 text-center text-sm text-[#5A5A6E]">
            <p>
              Hubungi admin kami{' '}
              <span className="font-medium text-[#1A1A1E]">Super Admin</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
