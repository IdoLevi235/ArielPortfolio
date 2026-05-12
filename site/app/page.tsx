import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import SkillTags from '@/components/SkillTags';
import SectionRow from '@/components/SectionRow';
import styles from './page.module.css';
import content from '@/data/content';

export const metadata: Metadata = {
  title: 'Ariel Levi — Portfolio',
  description: 'Video editor, motion designer & graphic designer based in Haifa. Creative Lead at Kendago.',
};

export default function HomePage() {
  const { home } = content;

  return (
    <div className="page-enter">
      <Hero
        nameLines={home.hero.nameLines}
        subtitle={home.hero.subtitle}
        cta={home.hero.cta}
      />

      <section id="about" className={styles.twoCol} aria-label="About and Skills">
        <div className={styles.colLeft}>
          <h2 className={styles.sectTitle}>About</h2>
          <div className={styles.bodyText}>
            {home.about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <div className={styles.colRight}>
          <h2 className={styles.sectTitle}>Skills</h2>
          <SkillTags skills={home.skills} />
        </div>
      </section>

      {home.sections.map(section => (
        <SectionRow key={section.id} section={section} />
      ))}
    </div>
  );
}
