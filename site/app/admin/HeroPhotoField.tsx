'use client';

import { useRef, useState } from 'react';
import type { ImageRef } from '@/types';
import { uploadFile } from './cloudinaryUpload';
import styles from './HeroPhotoField.module.css';

interface HeroPhotoFieldProps {
  photo?: ImageRef;
  onChange: (photo?: ImageRef) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

export default function HeroPhotoField({
  photo,
  onChange,
  onUploadStart,
  onUploadEnd,
}: HeroPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    onUploadStart?.();
    try {
      const r = await uploadFile(file, setProgress);
      onChange({ url: r.url, publicId: r.publicId, alt: photo?.alt ?? '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      onUploadEnd?.();
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.preview}>
        {photo?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={photo.alt || 'Hero portrait'} className={styles.thumb} />
        ) : (
          <span className={styles.placeholder}>No photo yet</span>
        )}
      </div>

      <div className={styles.controls}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className={styles.hiddenInput}
          aria-label="Upload hero photo"
          disabled={uploading}
        />
        <div className={styles.btnRow}>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? `Uploading… ${progress}%` : photo?.url ? 'Replace photo' : '↑ Upload photo'}
          </button>
          {photo?.url && (
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => onChange(undefined)}
              disabled={uploading}
            >
              Remove
            </button>
          )}
        </div>

        {photo?.url && (
          <label className={styles.altLabel}>
            <span className={styles.altLabelText}>Alt text (for accessibility)</span>
            <input
              type="text"
              value={photo.alt ?? ''}
              onChange={(e) => onChange({ ...photo, alt: e.target.value })}
              placeholder="e.g. Ariel Levi portrait"
              className={styles.altInput}
            />
          </label>
        )}

        {error && <p className={styles.error}>Upload failed: {error}</p>}
        <p className={styles.hint}>Replaces the &ldquo;Photo coming soon&rdquo; placeholder in the hero.</p>
      </div>
    </div>
  );
}
