/**
 * Next.js 16 Proxy (middleware was renamed to proxy in v16.0.0).
 * See: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 *
 * Protects:
 *   /admin/**          → unauthenticated: redirect to /signin
 *   /api/content/**    → unauthenticated: JSON 401
 *   /api/upload-sign   → unauthenticated: JSON 401
 *
 * Auth.js v5 routes under /api/auth/** are NOT in the matcher so
 * NextAuth can handle sign-in, callback, and session routes freely.
 *
 * Auth.js v5 pattern: `auth(callback)` wraps a NextAuthMiddleware where
 * `req` is a NextAuthRequest (NextRequest + `.auth: Session | null`).
 * The return value is a NextMiddleware-compatible function that Next.js 16
 * accepts as the named `proxy` export.
 */
import { NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import { auth } from '@/auth';
import type { NextAuthRequest } from 'next-auth';
import { DEV_BYPASS } from '@/lib/devAuth';

export const proxy = auth(function proxyHandler(
  req: NextAuthRequest,
  _event: NextFetchEvent,
) {
  const { pathname } = req.nextUrl;
  // Local-dev bypass: never active in production (see lib/devAuth.ts).
  const isAuthenticated = DEV_BYPASS || req.auth?.user != null;

  // --- Admin pages: redirect unauthenticated users to /signin ---
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const signInUrl = req.nextUrl.clone();
      signInUrl.pathname = '/signin';
      signInUrl.searchParams.set('callbackUrl', req.nextUrl.href);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // --- Protected API routes: JSON 401 for unauthenticated requests ---
  if (
    pathname.startsWith('/api/content') ||
    pathname === '/api/upload-sign'
  ) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

/**
 * Matcher: only intercept routes that need auth protection.
 * /api/auth/** is intentionally excluded so NextAuth handles its own
 * sign-in/callback/session/csrf routes without interference.
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/content/:path*',
    '/api/upload-sign',
  ],
};
