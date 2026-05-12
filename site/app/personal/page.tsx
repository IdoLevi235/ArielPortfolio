import type { Metadata } from 'next';
import InnerHero from '@/components/InnerHero';
import ProjectFull from '@/components/ProjectFull';
import content from '@/data/content';

export const metadata: Metadata = {
  title: 'Personal — Ariel Levi',
  description: 'Personal work by Ariel Levi — motion, photography, and mixed media.',
};

export default function PersonalPage() {
  const { personal } = content;

  return (
    <div className="page-enter">
      <InnerHero title={personal.title} description={personal.description} />

      {personal.projects.map(project => (
        <ProjectFull key={project.id} project={project} />
      ))}
    </div>
  );
}
