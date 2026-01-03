import { auth } from "@repo/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    // For main site, we mainly just want to pass the session to the client
    // We might not need strict redirects unless accessing /admin
    // But current /admin page exists.

    const isAuth = !!req.auth
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')

    // If accessing admin page without auth, redirect to login
    if (isAdminPage && !isAuth) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
