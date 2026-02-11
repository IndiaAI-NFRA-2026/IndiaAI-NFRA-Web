/**
 * Next.js Proxy for authentication and RBAC
 * Runs on the Edge Runtime before requests are processed
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/auth', '/forgot-password', '/reset-password', '/sso/callback'];

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Without cookies we cannot reliably check auth/token state in proxy.
  // All routes (including protected ones) are handled in the app using API calls/localStorage.
  return NextResponse.next();
}
