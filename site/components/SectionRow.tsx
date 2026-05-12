import Link from 'next/link';
import styles from './SectionRow.module.css';
import type { HomeSection } from '@/types';

export default function SectionRow({ section }: { section: HomeSection }) {
  return (
    <Link
      href={section.href}
      className={`${styles.row} ${section.flip ? styles.flip : ''}`}
      aria-label={`Go to ${section.label}`}
    >
      <div className={styles.img} aria-hidden="true">
        <div className={styles.imgInner} />
        <div className={styles.labelOverlay}>
          <span className={styles.label}>{section.label}</span>
        </div>
      </div>
      <div className={styles.info}>
        <h2 className={styles.infoTitle}>{section.title}</h2>
        <p className={styles.infoDesc}>{section.description}</p>
        <span className={styles.infoLink}>{section.cta}</span>
      </div>
    </Link>
  );
}
