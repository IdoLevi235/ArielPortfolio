'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './LazyIframe.module.css';

interface LazyIframeProps {
  src: string;
  title: string;
}

export default function LazyIframe({ src, title }: LazyIframeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.wrap}>
      {visible
        ? <iframe src={src} title={title} allowFullScreen className={styles.iframe} loading="lazy" />
        : <div className={styles.placeholder} aria-hidden="true" />
      }
    </div>
  );
}
