import styles from './ImagePlaceholder.module.css';
import type { ProjectImage } from '@/types';

interface ImageRowProps {
  images: ProjectImage[];
}

export default function ImageRow({ images }: ImageRowProps) {
  if (!images.length) return null;
  const isWide = images.length === 1;

  return (
    <div className={`${styles.row} ${isWide ? styles.wide : ''}`}>
      {images.map((img, i) =>
        img.type === 'placeholder' ? (
          <div key={i} className={`${styles.placeholder} ${isWide ? styles.placeholderWide : ''}`}>
            <span>{img.label}</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.url}
            alt={img.alt ?? ''}
            className={styles.img}
          />
        )
      )}
    </div>
  );
}
