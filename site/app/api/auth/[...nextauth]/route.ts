/**
 * Next.js 16 App Router catch-all route handler for Auth.js v5.
 * Delegates all GET and POST requests under /api/auth/* to the NextAuth
 * handlers exported from @/auth.
 *
 * Convention: route.ts must export named HTTP-method functions.
 * See: node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
 */
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
