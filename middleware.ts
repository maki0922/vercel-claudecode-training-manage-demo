import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
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
