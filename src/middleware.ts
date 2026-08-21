import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── 1. ADMIN ROUTE PROTECTION ───────────────────────────────────────────
  const isAdminPage = pathname.startsWith("/admin")
  const isAdminAPI = pathname.startsWith("/api/admin")
  const isPublicAdminRoute =
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/register" ||
    pathname === "/api/admin/logout"

  if ((isAdminPage || isAdminAPI) && !isPublicAdminRoute) {
    const sessionCookie = request.cookies.get("session")

    if (!sessionCookie) {
      if (isAdminAPI) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const session = await getSession(sessionCookie.value)
    if (!session) {
      if (isAdminAPI) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ─── 2. CUSTOMER ACCOUNT ROUTE PROTECTION ────────────────────────────────
  // If someone shares a link to /my-orders, require login first
  const isCustomerAccountPage = pathname.startsWith("/my-orders")

  if (isCustomerAccountPage) {
    const customerCookie = request.cookies.get("customer_session")

    if (!customerCookie) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const session = await getSession(customerCookie.value)
    if (!session) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/my-orders/:path*"
  ]
}
