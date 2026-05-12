import type { Metadata } from 'next';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: 'Admin — Ariel Levi',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">⬡</div>
        <h1 className={styles.title}>CMS Admin</h1>
        <p className={styles.desc}>
          Content management is coming in Phase 2. Here you&apos;ll be able to add,
          edit, reorder and delete projects, videos, and sections without touching code.
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>+</span>
            <span>Add / remove projects & sections</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>↕</span>
            <span>Drag-and-drop reordering</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>↑</span>
            <span>Upload images via Cloudinary</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✎</span>
            <span>Edit all text inline</span>
          </div>
        </div>
        <p className={styles.status}>Phase 2 — not yet implemented</p>
      </div>
    </div>
  );
}
