'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './Nav.module.css';

const navLinks = [
  { href: '/',             label: 'About' },
  { href: '/ads',          label: 'Ads' },
  { href: '/bezalel',      label: 'Bezalel' },
  { href: '/personal',     label: 'Personal' },
  { href: '/photography',  label: 'Photography' },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Ariel Levi — home">
          Ariel Levi
        </Link>

        {/* Desktop links */}
        <div className={styles.links} role="menubar">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              className={`${styles.link} ${pathname === href ? styles.active : ''}`}
            >
              {label}
            </Link>
          ))}
          <a
            href="mailto:arielefraim5@gmail.com"
            role="menuitem"
            className={styles.link}
          >
            Contact
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className={styles.overlay} role="dialog" aria-label="Mobile menu">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.overlayLink} ${pathname === href ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <a
            href="mailto:arielefraim5@gmail.com"
            className={styles.overlayLink}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>
        </div>
      )}
    </nav>
  );
}
