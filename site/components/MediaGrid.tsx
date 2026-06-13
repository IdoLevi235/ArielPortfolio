import LazyIframe from './LazyIframe';
import styles from './MediaGrid.module.css';
import type { MediaItem } from '@/types';

const ADOBE_BASE = 'https://www-ccv.adobe.io/v1/player/ccv';

/** Build the iframe src for an embedded video by provider. */
export function embedSrc(item: Extract<MediaItem, { kind: 'embed' }>): string {
  switch (item.provider) {
    case 'youtube':
      return `https://www.youtube.com/embed/${item.id}`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${item.id}`;
    case 'adobe':
    default:
      return `${ADOBE_BASE}/${item.id}/embed?bgcolor=%23191919&lazyLoading=true&api_key=BehancePro2View`;
  }
}

interface MediaGridProps {
  items: MediaItem[];
  /** When set, renders inside a labelled <section> (used by the ads page). */
  label?: string;
  section?: boolean;
}

export default function MediaGrid({ items, label, section = false }: MediaGridProps) {
  if (!items.length) return null;
  const single = items.length === 1;

  const grid = (
    <div className={`${styles.grid} ${single ? styles.single : ''}`}>
      {items.map((item, i) => (
        <MediaCell key={i} item={item} />
      ))}
    </div>
  );

  if (section) {
    return (
      <div className={styles.section}>
        {label && <p className={styles.label}>{label}</p>}
        {grid}
      </div>
    );
  }

  return <div className={styles.compact}>{grid}</div>;
}

function MediaCell({ item }: { item: MediaItem }) {
  if (item.kind === 'image') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.url} alt={item.alt ?? ''} className={styles.img} />;
  }
  if (item.kind === 'video') {
    return (
      <video
        className={styles.video}
        src={item.url}
        poster={item.poster}
        controls
        preload="none"
      />
    );
  }
  return <LazyIframe src={embedSrc(item)} title={item.caption ?? `Video ${item.id}`} />;
}
