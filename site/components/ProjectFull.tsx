'use client';

import { useState } from 'react';
import MediaGrid from './MediaGrid';
import styles from './ProjectFull.module.css';
import type { Project } from '@/types';

export default function ProjectFull({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  const total = project.media.length;
  const previewCount = project.previewCount ?? total;
  const hasMore = total > previewCount;
  const visible = expanded ? project.media : project.media.slice(0, previewCount);

  return (
    <article
      className={`${styles.proj} ${project.isLast ? styles.last : ''}`}
      id={project.id}
    >
      <header className={styles.header}>
        <span className={styles.num}>{project.num}</span>
        <div>
          <h2 className={styles.title}>{project.title}</h2>
          <p className={styles.year}>{project.year} · {project.category}</p>
        </div>
      </header>

      {project.description && (
        <p className={styles.desc}>{project.description}</p>
      )}

      <MediaGrid items={visible} />

      {hasMore && (
        <button
          className={styles.viewMore}
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? 'View less ↑' : 'View more ↓'}
        </button>
      )}
    </article>
  );
}
