import Link from 'next/link';
import styles from './InnerHero.module.css';

interface InnerHeroProps {
  title: string;
  description: string;
}

export default function InnerHero({ title, description }: InnerHeroProps) {
  return (
    <div className={styles.inner}>
      <Link href="/" className={styles.back} aria-label="Back to home">
        Back to Home
      </Link>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.desc}>{description}</p>
    </div>
  );
}
