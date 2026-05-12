import styles from './Footer.module.css';
import content from '@/data/content';

export default function Footer() {
  const { site } = content;
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>{site.name} · {site.footerYear}</span>
        <nav className={styles.links} aria-label="Footer links">
          <a href={`mailto:${site.email}`} className={styles.link}>{site.email}</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn</a>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={styles.link}>Instagram</a>
        </nav>
      </div>
    </footer>
  );
}
