import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import type { Profile } from '@/types/database'

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = await createMiddlewareClient(request)

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/super-user') ||
    pathname.startsWith('/user') ||
    pathname.startsWith('/admin')

  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/sign-up')
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: Profile | null }

    const redirectTo = profile?.role === 'super_user' ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  if (user && (pathname.startsWith('/super-user') || pathname.startsWith('/admin'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: Profile | null }

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
