import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションを更新する（トークンのリフレッシュ）
  // getUser()の呼び出しは必須。削除するとセッションが正しく更新されない
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未認証ユーザーが保護されたルートにアクセスした場合はログインページへリダイレクト
  const protectedPaths = ['/dashboard', '/customers', '/sessions', '/exercises']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストパスにマッチする:
     * - _next/static（静的ファイル）
     * - _next/image（画像最適化）
     * - favicon.ico, sitemap.xml, robots.txt（メタファイル）
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
