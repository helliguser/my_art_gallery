import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Защищённые маршруты
  const protectedRoutes = ['/profile', '/upload', '/my-posts']
  const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  // Редактирование поста
  const isEditRoute = /\/post\/\d+\/edit/.test(request.nextUrl.pathname)

  if ((isProtected || isEditRoute) && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect_to', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}