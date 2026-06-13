/**
 * Auth.js v5 (next-auth@5) configuration.
 *
 * Single-user setup: only the address in ALLOWED_EMAIL may sign in.
 * The signIn callback enforces this server-side during the OAuth flow.
 *
 * Required runtime env vars:
 *   AUTH_SECRET          – random secret for JWT signing (openssl rand -base64 32)
 *   AUTH_GOOGLE_ID       – Google OAuth client ID
 *   AUTH_GOOGLE_SECRET   – Google OAuth client secret
 *   ALLOWED_EMAIL        – the one email address permitted to access the admin
 */
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],

  session: { strategy: 'jwt' },

  pages: { signIn: '/signin' },

  callbacks: {
    signIn({ profile }) {
      const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
      if (!allowed) return false; // no allowlist configured → deny everyone
      const email = profile?.email?.trim().toLowerCase();
      return email === allowed;
    },
  },
});
