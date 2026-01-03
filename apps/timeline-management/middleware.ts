import { auth } from "@repo/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isAuth = !!req.auth
    const isLoginPage = req.nextUrl.pathname.startsWith('/login')

    console.log(`[Middleware] ${req.nextUrl.pathname} Auth: ${isAuth}, Cookie: ${req.cookies.get('spt.session-token')?.value?.substring(0, 10)}...`)


    if (isAuth && isLoginPage) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    const isPublicPage = req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith('/project/');

    if (!isAuth && !isLoginPage && !isPublicPage) {
        // Redirect to Local Login
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
