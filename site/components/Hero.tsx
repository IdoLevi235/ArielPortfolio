import styles from './Hero.module.css';

interface HeroProps {
  nameLines: string[];
  subtitle: string;
  cta: string;
}

export default function Hero({ nameLines, subtitle, cta }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.left}>
        <h1 className={styles.name}>{nameLines[0]}<br />{nameLines[1]}</h1>
        <p className={styles.sub}>{subtitle}</p>
        <a href="#about" className={styles.btn} aria-label="Scroll to view work">
          {cta}
        </a>
      </div>
      <div className={styles.photo} aria-label="Portrait photo placeholder" role="img">
        <span>Photo</span>
        <span>coming soon</span>
      </div>
    </section>
  );
}
