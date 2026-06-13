import { auth } from '@/auth';

/**
 * Local-development auth bypass.
 *
 * Active ONLY when running `next dev` (NODE_ENV === 'development') AND the
 * explicit `ADMIN_DEV_BYPASS=1` env var is set. In production NODE_ENV is
 * always 'production', so this can never be enabled on the live site — it is
 * impossible to accidentally ship an open admin.
 *
 * Purpose: smoke-test the admin UI and the local-file content fallback without
 * first configuring Google OAuth.
 */
export const DEV_BYPASS =
  process.env.NODE_ENV === 'development' && process.env.ADMIN_DEV_BYPASS === '1';

/** True if the request is authenticated, or the dev bypass is active. */
export async function isAuthed(): Promise<boolean> {
  if (DEV_BYPASS) return true;
  return Boolean(await auth());
}
