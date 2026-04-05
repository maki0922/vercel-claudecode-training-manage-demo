import { NextResponse, type NextRequest } from 'next/server'

/**
 * ルート保護のMiddleware
 *
 * @supabase/ssr は Vercel Edge Runtime で動作しないため、
 * cookieの存在チェックのみを行う軽量な実装にしている。
 * 実際のセッション検証（auth.getUser()）は
 * app/(dashboard)/layout.tsx の Server Component で行う。
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedPaths = ['/dashboard', '/customers', '/sessions', '/exercises']
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  if (isProtectedPath) {
    // Supabaseのセッションcookieの存在を確認する
    const hasAuthCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'))

    if (!hasAuthCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
