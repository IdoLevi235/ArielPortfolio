'use client';

import { useState, useMemo } from 'react';
import ProjectFull from './ProjectFull';
import styles from './ProjectFilter.module.css';
import type { Project } from '@/types';

const ALL = 'All';

export default function ProjectFilter({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => {
    const cats = [ALL, ...Array.from(new Set(projects.map(p => p.category)))];
    return cats;
  }, [projects]);

  const [active, setActive] = useState(ALL);

  const visible = active === ALL ? projects : projects.filter(p => p.category === active);

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Filter projects by category">
        {categories.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={active === cat}
            className={`${styles.tab} ${active === cat ? styles.tabActive : ''}`}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div>
        {visible.map((project, i) => (
          <ProjectFull
            key={project.id}
            project={{ ...project, isLast: i === visible.length - 1 }}
          />
        ))}
      </div>
    </div>
  );
}
