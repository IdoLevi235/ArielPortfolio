import type { Metadata } from 'next';
import InnerHero from '@/components/InnerHero';
import MediaGrid from '@/components/MediaGrid';
import content from '@/data/content';

export const metadata: Metadata = {
  title: 'Ads — Ariel Levi',
  description: 'Performance video ads by Ariel Levi — motion, editing, and marketing design.',
};

export default function AdsPage() {
  const { ads } = content;

  return (
    <div className="page-enter">
      <InnerHero title={ads.title} description={ads.description} />

      {ads.groups.map(group => (
        <MediaGrid key={group.id} items={group.media} label={group.label} section />
      ))}
    </div>
  );
}
