import type { Metadata } from 'next';
import InnerHero from '@/components/InnerHero';
import ProjectFull from '@/components/ProjectFull';
import content from '@/data/content';

export const metadata: Metadata = {
  title: 'Photography — Ariel Levi',
  description: 'A collection of film and digital photography by Ariel Levi.',
};

export default function PhotographyPage() {
  const { photography } = content;

  return (
    <div className="page-enter">
      <InnerHero title={photography.title} description={photography.description} />

      {photography.projects.map(project => (
        <ProjectFull key={project.id} project={project} />
      ))}
    </div>
  );
}
