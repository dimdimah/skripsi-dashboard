# AGENT CODE GENERATION PROMPT
# Next.js + Supabase — Role-Based Auth (super_user & user)

## INSTRUKSI UNTUK AGENT

Kamu adalah code generator. Tugasmu adalah membuat semua file di bawah ini **persis seperti yang tertulis**, tidak menambah atau mengurangi logika kecuali diminta.

Buat file dalam urutan berikut:
1. SQL Migration
2. TypeScript types
3. Supabase client helpers
4. Middleware
5. Utils / helpers
6. Components
7. Layouts
8. Pages

Setiap file dimulai dengan komentar `// FILE: path/dari/root/proyek`

---

## KONTEKS PROYEK

- Base template: `npx create-next-app --example with-supabase`
- Framework: Next.js 14+ App Router
- Auth & DB: Supabase
- Language: TypeScript strict
- Styling: Tailwind CSS
- Package manager: npm

Dua role yang digunakan:
- `super_user` → CRUD semua data + manajemen user lain
- `user` → CRUD data milik sendiri saja

---

## STRUKTUR FOLDER LENGKAP

```
with-supabase-app/
├── app/
│   ├── layout.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── sign-up/page.tsx
│   └── (protected)/
│       ├── layout.tsx
│       ├── dashboard/page.tsx
│       ├── super-user/
│       │   ├── layout.tsx
│       │   └── users/page.tsx
│       └── user/
│           ├── layout.tsx
│           └── profile/page.tsx
├── components/
│   └── auth/
│       └── role-guard.tsx
├── lib/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── utils/
│   └── get-role.ts
├── types/
│   └── database.ts
├── middleware.ts
└── supabase/
    └── migrations/
        └── 001_rbac.sql
```

---

## FILE 1 — SQL MIGRATION

```sql
-- FILE: supabase/migrations/001_rbac.sql
-- Jalankan via: supabase db push  ATAU paste di Supabase SQL Editor

-- 1. Buat enum role
create type public.app_role as enum ('super_user', 'user');

-- 2. Buat tabel profiles
create table public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  email      text not null,
  role       public.app_role not null default 'user',
  full_name  text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Fungsi trigger: auto-insert ke profiles saat user baru register
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')::public.app_role
  );
  return new;
end;
$$;

-- 4. Pasang trigger ke auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Fungsi trigger: auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 6. Enable RLS
alter table public.profiles enable row level security;

-- 7. Helper function: ambil role dari uid (menghindari infinite recursion pada RLS)
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

-- 8. RLS Policies

-- super_user: SELECT semua profil
create policy "super_user: select all profiles"
  on public.profiles for select
  using ( public.get_my_role() = 'super_user' );

-- super_user: UPDATE semua profil
create policy "super_user: update all profiles"
  on public.profiles for update
  using ( public.get_my_role() = 'super_user' );

-- super_user: DELETE profil user lain (bukan dirinya sendiri)
create policy "super_user: delete other profiles"
  on public.profiles for delete
  using ( public.get_my_role() = 'super_user' and id != auth.uid() );

-- user biasa: SELECT profil sendiri
create policy "user: select own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- user biasa: UPDATE profil sendiri (tidak bisa ubah role)
create policy "user: update own profile"
  on public.profiles for update
  using ( auth.uid() = id )
  with check ( role = (select role from public.profiles where id = auth.uid()) );
```

---

## FILE 2 — TYPESCRIPT TYPES

```typescript
// FILE: types/database.ts

export type AppRole = 'super_user' | 'user'

export interface Profile {
  id: string
  email: string
  role: AppRole
  full_name: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
    }
    Enums: {
      app_role: AppRole
    }
  }
}
```

---

## FILE 3 — SUPABASE CLIENT (Browser)

```typescript
// FILE: lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## FILE 4 — SUPABASE CLIENT (Server)

```typescript
// FILE: lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component tidak bisa set cookie — diabaikan
          }
        },
      },
    }
  )
}
```

---

## FILE 5 — SUPABASE CLIENT (Middleware)

```typescript
// FILE: lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, supabaseResponse }
}
```

---

## FILE 6 — MIDDLEWARE (Root)

```typescript
// FILE: middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = await createMiddlewareClient(request)

  // PENTING: selalu gunakan getUser(), bukan getSession()
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Jika belum login dan akses protected route → redirect login
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/super-user') ||
    pathname.startsWith('/user')

  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Jika sudah login dan akses auth route → redirect dashboard
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/sign-up')
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Guard khusus route /super-user/* → harus super_user
  if (user && pathname.startsWith('/super-user')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_user') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## FILE 7 — UTILS: GET ROLE

```typescript
// FILE: utils/get-role.ts
import { createClient } from '@/lib/supabase/server'
import type { AppRole } from '@/types/database'

/**
 * Ambil role user yang sedang login (server-side).
 * Return null jika tidak ada session.
 */
export async function getUserRole(): Promise<AppRole | null> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) return null

  return profile.role
}

/**
 * Ambil profile lengkap user yang sedang login.
 * Return null jika tidak ada session.
 */
export async function getCurrentProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
```

---

## FILE 8 — COMPONENT: ROLE GUARD

```tsx
// FILE: components/auth/role-guard.tsx
import { redirect } from 'next/navigation'
import { getUserRole } from '@/utils/get-role'
import type { AppRole } from '@/types/database'

interface RoleGuardProps {
  allowedRoles: AppRole[]
  redirectTo?: string
  children: React.ReactNode
}

/**
 * Server Component guard.
 * Redirect jika role user tidak ada dalam allowedRoles.
 */
export async function RoleGuard({
  allowedRoles,
  redirectTo = '/dashboard',
  children,
}: RoleGuardProps) {
  const role = await getUserRole()

  if (!role || !allowedRoles.includes(role)) {
    redirect(redirectTo)
  }

  return <>{children}</>
}
```

---

## FILE 9 — ROOT LAYOUT

```tsx
// FILE: app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'App with RBAC',
  description: 'Next.js + Supabase Role-Based Auth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

---

## FILE 10 — PROTECTED LAYOUT (Cek Session)

```tsx
// FILE: app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
```

---

## FILE 11 — SUPER-USER LAYOUT (Guard Role)

```tsx
// FILE: app/(protected)/super-user/layout.tsx
import { RoleGuard } from '@/components/auth/role-guard'

export default function SuperUserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={['super_user']} redirectTo="/dashboard">
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-indigo-700 text-white px-6 py-3 text-sm font-medium">
          Super User Panel
        </nav>
        <main className="p-6">{children}</main>
      </div>
    </RoleGuard>
  )
}
```

---

## FILE 12 — USER LAYOUT

```tsx
// FILE: app/(protected)/user/layout.tsx
import { RoleGuard } from '@/components/auth/role-guard'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={['user', 'super_user']} redirectTo="/login">
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-blue-600 text-white px-6 py-3 text-sm font-medium">
          User Panel
        </nav>
        <main className="p-6">{children}</main>
      </div>
    </RoleGuard>
  )
}
```

---

## FILE 13 — PAGE: DASHBOARD

```tsx
// FILE: app/(protected)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/utils/get-role'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getCurrentProfile()

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-6">Selamat datang, {profile?.email}</p>

      <div className="bg-white rounded-xl border p-5 space-y-2">
        <p className="text-sm text-gray-500">Role aktif</p>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          profile?.role === 'super_user'
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {profile?.role}
        </span>
      </div>

      <div className="mt-6 flex gap-3">
        {profile?.role === 'super_user' && (
          <a
            href="/super-user/users"
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            Manajemen User
          </a>
        )}
        <a
          href="/user/profile"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          Profil Saya
        </a>
      </div>
    </div>
  )
}
```

---

## FILE 14 — PAGE: MANAJEMEN USER (super_user only)

```tsx
// FILE: app/(protected)/super-user/users/page.tsx
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

export default async function ManajemenUserPage() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="text-red-500">Gagal memuat data: {error.message}</p>
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Manajemen User</h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(users as Profile[]).map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{u.email}</td>
                <td className="px-4 py-3 text-gray-600">{u.full_name ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'super_user'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users?.length === 0 && (
          <p className="text-center py-8 text-gray-400">Belum ada user.</p>
        )}
      </div>
    </div>
  )
}
```

---

## FILE 15 — PAGE: PROFIL USER

```tsx
// FILE: app/(protected)/user/profile/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/utils/get-role'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getCurrentProfile()

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Profil Saya</h1>

      <div className="bg-white rounded-xl border divide-y">
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">Email</p>
          <p className="text-gray-900">{profile?.email}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">Nama Lengkap</p>
          <p className="text-gray-900">{profile?.full_name ?? '—'}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">Role</p>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {profile?.role}
          </span>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">Bergabung</p>
          <p className="text-gray-600">
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
              : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## FILE 16 — PAGE: LOGIN

```tsx
// FILE: app/(auth)/login/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string }
}) {
  async function loginAction(formData: FormData) {
    'use server'
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    redirect(searchParams.next ?? '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl border p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Masuk</h1>

        {searchParams.error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
            {searchParams.error}
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Masuk
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <a href="/sign-up" className="text-blue-600 hover:underline">
            Daftar
          </a>
        </p>
      </div>
    </div>
  )
}
```

---

## FILE 17 — PAGE: SIGN UP

```tsx
// FILE: app/(auth)/sign-up/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string }
}) {
  async function signUpAction(formData: FormData) {
    'use server'
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      options: {
        data: { role: 'user' }, // default role saat register
      },
    })

    if (error) {
      redirect(`/sign-up?error=${encodeURIComponent(error.message)}`)
    }

    redirect('/sign-up?success=1')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl border p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Daftar Akun</h1>

        {searchParams.error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
            {searchParams.error}
          </p>
        )}

        {searchParams.success && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2">
            Akun berhasil dibuat! Cek email untuk verifikasi.
          </p>
        )}

        <form action={signUpAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Daftar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Sudah punya akun?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Masuk
          </a>
        </p>
      </div>
    </div>
  )
}
```

---

## ENVIRONMENT VARIABLES

```env
# FILE: .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## URUTAN SETUP (untuk agent / developer)

```
1. npx create-next-app --example with-supabase with-supabase-app
2. cd with-supabase-app
3. Buat .env.local dengan URL dan KEY dari Supabase dashboard
4. Jalankan SQL migration di Supabase SQL Editor
5. Buat semua file TypeScript sesuai urutan FILE 2–17
6. npm run dev
7. Register akun pertama → ubah role ke super_user via SQL:
   UPDATE public.profiles SET role = 'super_user' WHERE email = 'admin@kamu.com';
```

---

## CATATAN KEAMANAN (WAJIB DIBACA)

1. **RLS adalah security layer utama** — middleware hanya untuk UX redirect. Jika RLS tidak aktif, data bisa diakses siapa saja.
2. **Selalu gunakan `getUser()`** di server, bukan `getSession()` — `getSession()` tidak memvalidasi JWT ke server Supabase.
3. **Helper `get_my_role()`** menggunakan `security definer` untuk menghindari infinite recursion pada RLS policy.
4. **User tidak bisa mengubah role sendiri** — policy `with check` memastikan kolom `role` tidak berubah saat user update profil sendiri.
5. **Cookie handler di `lib/supabase/server.ts`** wajib lengkap (getAll + setAll) agar session refresh otomatis berjalan.