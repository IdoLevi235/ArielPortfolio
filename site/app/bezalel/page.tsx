import type { Metadata } from 'next';
import InnerHero from '@/components/InnerHero';
import ProjectFilter from '@/components/ProjectFilter';
import content from '@/data/content';

export const metadata: Metadata = {
  title: 'Bezalel — Ariel Levi',
  description: 'Selected works from Ariel Levi\'s B.Des in Visual Communication at Bezalel Academy of Arts and Design.',
};

export default function BezalelPage() {
  const { bezalel } = content;

  return (
    <div className="page-enter">
      <InnerHero title={bezalel.title} description={bezalel.description} />
      <ProjectFilter projects={bezalel.projects} />
    </div>
  );
}
