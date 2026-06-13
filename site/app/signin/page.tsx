/**
 * Admin sign-in page.
 *
 * Single entry point for Ariel's CMS. Presents a "Sign in with Google"
 * button that triggers the Google OAuth flow via Auth.js v5 (next-auth@5).
 *
 * `SignInClient` uses `useSearchParams()` to read ?error= from the URL,
 * which requires a <Suspense> boundary per Next.js App Router conventions.
 *
 * robots: noindex so the page doesn't appear in search results.
 */
import { Suspense } from 'react';
import type { Metadata } from 'next';
import SignInClient from './SignInClient';

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
