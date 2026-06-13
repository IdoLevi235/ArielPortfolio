'use client';

import type { SiteConfig } from '@/types';
import styles from '../editors.module.css';

interface SiteEditorProps {
  site: SiteConfig;
  onChange: (site: SiteConfig) => void;
}

export default function SiteEditor({ site, onChange }: SiteEditorProps) {
  function update(field: keyof SiteConfig, value: string) {
    onChange({ ...site, [field]: value });
  }

  return (
    <div className={styles.editor}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Site settings</h2>
        <p className={styles.hint}>These values appear in the site footer and contact info.</p>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Site name</span>
            <input
              type="text"
              value={site.name}
              onChange={(e) => update('name', e.target.value)}
              className={styles.input}
              placeholder="Your name…"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Footer year</span>
            <input
              type="text"
              value={site.footerYear}
              onChange={(e) => update('footerYear', e.target.value)}
              className={styles.input}
              placeholder="2025"
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Email</span>
            <input
              type="email"
              value={site.email}
              onChange={(e) => update('email', e.target.value)}
              className={styles.input}
              placeholder="your@email.com"
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>LinkedIn URL</span>
            <input
              type="url"
              value={site.linkedin}
              onChange={(e) => update('linkedin', e.target.value)}
              className={styles.input}
              placeholder="https://linkedin.com/in/…"
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Instagram URL</span>
            <input
              type="url"
              value={site.instagram}
              onChange={(e) => update('instagram', e.target.value)}
              className={styles.input}
              placeholder="https://instagram.com/…"
            />
          </label>
        </div>
      </section>
    </div>
  );
}
