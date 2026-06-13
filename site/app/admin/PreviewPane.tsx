'use client';

import type { Content } from '@/types';
import Hero from '@/components/Hero';
import SkillTags from '@/components/SkillTags';
import SectionRow from '@/components/SectionRow';
import InnerHero from '@/components/InnerHero';
import MediaGrid from '@/components/MediaGrid';
import ProjectFull from '@/components/ProjectFull';
import styles from './PreviewPane.module.css';

type Tab = 'home' | 'ads' | 'bezalel' | 'personal' | 'photography' | 'site';

interface PreviewPaneProps {
  content: Content;
  tab: Tab;
}

export default function PreviewPane({ content, tab }: PreviewPaneProps) {
  return (
    <div className={styles.pane}>
      <div className={styles.notice}>
        <span className={styles.noticeIcon}>👁</span>
        Live preview — this is how your site will look after publishing.
      </div>

      <div className={styles.frame}>
        {tab === 'home' && (
          <div className={styles.previewContent}>
            <Hero
              nameLines={content.home.hero.nameLines}
              subtitle={content.home.hero.subtitle}
              cta={content.home.hero.cta}
            />
            <div className={styles.previewSection}>
              <div className={styles.aboutCols}>
                <div>
                  <h2 className={styles.previewSectTitle}>About</h2>
                  <div className={styles.aboutText}>
                    {content.home.about.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className={styles.previewSectTitle}>Skills</h2>
                  <SkillTags skills={content.home.skills} />
                </div>
              </div>
            </div>
            {content.home.sections.map((section) => (
              <SectionRow key={section.id} section={section} />
            ))}
          </div>
        )}

        {tab === 'ads' && (
          <div className={styles.previewContent}>
            <InnerHero title={content.ads.title} description={content.ads.description} />
            {content.ads.groups.map((group) => (
              <MediaGrid key={group.id} items={group.media} label={group.label} section />
            ))}
          </div>
        )}

        {(tab === 'bezalel' || tab === 'personal' || tab === 'photography') && (
          <div className={styles.previewContent}>
            <InnerHero
              title={content[tab].title}
              description={content[tab].description}
            />
            {content[tab].projects.map((project) => (
              <ProjectFull key={project.id} project={project} />
            ))}
          </div>
        )}

        {tab === 'site' && (
          <div className={styles.previewContent}>
            <div className={styles.sitePreview}>
              <h2 className={styles.sitePreviewTitle}>Site settings preview</h2>
              <table className={styles.siteTable}>
                <tbody>
                  {(Object.entries(content.site) as [string, string][]).map(([key, val]) => (
                    <tr key={key} className={styles.siteRow}>
                      <td className={styles.siteKey}>{key}</td>
                      <td className={styles.siteVal}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
