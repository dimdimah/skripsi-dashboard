import Link from 'next/link'
import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#FAFBFC] p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amikom-purple shadow-lg shadow-amikom-purple/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-6 text-amikom-jonquil-warm"
                >
                  <path d="M4 7v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
                  <path d="M4 12v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
                  <path d="M4 17v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
                  <path d="M4 22v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
                </svg>
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

          <LoginForm />

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
