// FILE: lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function signUp(
  email: string,
  password: string,
  options?: { role?: string }
) {
  const supabase = createClient()
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: options?.role || 'user',
      },
    },
  })
}
