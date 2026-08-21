import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl

  // Protected routes
  const isAdminPage = pathname.startsWith("/admin")
  const isAdminAPI = pathname.startsWith("/api/admin")

  // Allow login and registration routes without prior authentication
  const isPublicAdminRoute =
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/register"

  // Check only protected routes
  if ((isAdminPage || isAdminAPI) && !isPublicAdminRoute) {

    const sessionCookie = request.cookies.get("session")

    // No session cookie
    if (!sessionCookie) {

      if (isAdminAPI) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      )
    }

    // Validate session
    const session = await getSession(sessionCookie.value)

    if (!session) {

      if (isAdminAPI) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*"
  ]
}
