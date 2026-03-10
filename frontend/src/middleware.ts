import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLoggedIn = request.cookies.get('loggedIn')?.value === 'true'
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + '?'))

  if (pathname === '/' || pathname === '') {
    if (hasLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/dashboard') && !hasLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublic && hasLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/dashboard', '/dashboard/:path*'],
}
