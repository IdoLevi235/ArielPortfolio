'use client';

import { usePathname } from 'next/navigation';

/**
 * Renders the site chrome (nav/footer) everywhere EXCEPT the admin and
 * sign-in routes, which have their own focused layout. The children are
 * server components passed in from the root layout.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidden = pathname?.startsWith('/admin') || pathname?.startsWith('/signin');
  if (hidden) return null;
  return <>{children}</>;
}
