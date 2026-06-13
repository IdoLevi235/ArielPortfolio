import styles from './Hero.module.css';
import type { ImageRef } from '@/types';

interface HeroProps {
  nameLines: string[];
  subtitle: string;
  cta: string;
  photo?: ImageRef;
}

export default function Hero({ nameLines, subtitle, cta, photo }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.left}>
        <h1 className={styles.name}>{nameLines[0]}<br />{nameLines[1]}</h1>
        <p className={styles.sub}>{subtitle}</p>
        <a href="#about" className={styles.btn} aria-label="Scroll to view work">
          {cta}
        </a>
      </div>
      <div className={styles.photo} role="img" aria-label={photo?.alt || 'Portrait photo'}>
        {photo?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.url}
            alt={photo.alt ?? `${nameLines.join(' ')} portrait`}
            className={styles.photoImg}
          />
        ) : (
          <>
            <span>Photo</span>
            <span>coming soon</span>
          </>
        )}
      </div>
    </section>
  );
}
