'use client';

import { useState } from 'react';
import VideoGrid from './VideoGrid';
import ImageRow from './ImagePlaceholder';
import styles from './ProjectFull.module.css';
import type { Project } from '@/types';

export default function ProjectFull({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = project.extraImages.length > 0;

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

      {project.videoIds.length > 0 && (
        <VideoGrid
          videoIds={project.videoIds}
          single={project.videoIds.length === 1}
          compact
        />
      )}

      {project.images.length > 0 && (
        <ImageRow images={project.images} />
      )}

      {hasMore && (
        <>
          {expanded && <ImageRow images={project.extraImages} />}
          <button
            className={styles.viewMore}
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'View less ↑' : 'View more ↓'}
          </button>
        </>
      )}
    </article>
  );
}
