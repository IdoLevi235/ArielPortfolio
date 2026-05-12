import LazyIframe from './LazyIframe';
import styles from './VideoGrid.module.css';

const ADOBE_BASE = 'https://www-ccv.adobe.io/v1/player/ccv';

interface VideoGridProps {
  videoIds: string[];
  single?: boolean;
  label?: string;
  compact?: boolean;
}

export default function VideoGrid({ videoIds, single = false, label, compact = false }: VideoGridProps) {
  const grid = (
    <div className={`${styles.grid} ${single ? styles.single : ''}`}>
      {videoIds.map(id => (
        <LazyIframe
          key={id}
          src={`${ADOBE_BASE}/${id}/embed?bgcolor=%23191919&lazyLoading=true&api_key=BehancePro2View`}
          title={`Video ${id}`}
        />
      ))}
    </div>
  );

  if (compact) {
    return <div className={styles.compact}>{grid}</div>;
  }

  return (
    <div className={styles.section}>
      {label && <p className={styles.label}>{label}</p>}
      {grid}
    </div>
  );
}
