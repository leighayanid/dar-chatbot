import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get the session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('[Proxy]', request.nextUrl.pathname, 'Session:', !!session)

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // If there's no session and the user is trying to access a protected route
  if (!session && (request.nextUrl.pathname === '/' || isProtectedRoute)) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    // Copy cookies to redirect response
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // If there's a session and the user is trying to access the login or register page
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    // Copy cookies to redirect response
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: ['/', '/login', '/register', '/forgot-password', '/dashboard', '/settings'],
}
