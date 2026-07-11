import { NextRequest, NextResponse } from 'next/server'

/**
 * Protected routes that require authentication
 * Routes starting with these patterns require a valid auth token
 */
const PROTECTED_ROUTES = ['/dashboard', '/creator', '/admin', '/profile', '/donations']

/**
 * Admin-only routes
 */
const ADMIN_ROUTES = ['/admin']

/**
 * Creator-only routes  
 */
const CREATOR_ROUTES = ['/creator']

/**
 * Auth routes that redirect to dashboard if already authenticated
 */
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

/**
 * Middleware to protect routes based on authentication status
 * This runs on every request before it reaches the page
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value || null
  const userRole = request.cookies.get('user_role')?.value || null

  // For auth routes: redirect to dashboard if already authenticated.
  //
  // ESCAPE HATCH (`?expired=1`): this cookie check only proves a token EXISTS,
  // not that it's valid. When the API rejects a user's tokens (rotated signing
  // key, revoked session), the client clears storage and sends them to
  // /login?expired=1 — if we bounced that back to /dashboard on a stale
  // cookie, the user would loop between a dead dashboard and here forever,
  // stuck on a blank loading screen with no way to re-login.
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (token && !searchParams.has('expired')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // No token - redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access
    if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Creator routes require 'creator' role
    // Dashboard at /dashboard is accessible to 'creator' and 'admin' roles
    if (CREATOR_ROUTES.some((route) => pathname.startsWith(route))) {
      if (userRole !== 'creator' && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return NextResponse.next()
}

/**
 * Configuration for middleware matcher
 * Specify which routes should be protected by this middleware
 */
export const config = {
  matcher: [
    /* Protect all routes except these */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
