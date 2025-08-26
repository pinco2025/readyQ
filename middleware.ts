import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Firebase middleware - simplified for now
// We'll handle authentication on the client side with Firebase
export function middleware(request: NextRequest) {
  // For now, allow all requests
  // Firebase handles authentication on the client side
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
