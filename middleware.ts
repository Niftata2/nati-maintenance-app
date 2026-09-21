import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is the required export name Next.js is looking for
export function middleware(request: NextRequest) {
  // For now, just let all requests pass through. 
  // You can add your auth/redirect logic here later if needed.
  return NextResponse.next()
}

// Optional: Configure which paths this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}