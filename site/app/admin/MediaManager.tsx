'use client';

import { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MediaItem } from '@/types';
import { uploadFile, toMediaItem } from './cloudinaryUpload';
import styles from './MediaManager.module.css';

interface MediaManagerProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

// ─────────────────────────────────────────────────────────────
// Upload helper (delegates to the shared Cloudinary uploader)
// ─────────────────────────────────────────────────────────────
async function uploadToCloudinary(
  file: File,
  onProgress?: (pct: number) => void
): Promise<MediaItem> {
  return toMediaItem(await uploadFile(file, onProgress));
}

// ─────────────────────────────────────────────────────────────
// Sortable item
// ─────────────────────────────────────────────────────────────
interface SortableItemProps {
  id: string;
  item: MediaItem;
  index: number;
  onDelete: (index: number) => void;
  onUpdateAlt: (index: number, alt: string) => void;
  onUpdateCaption: (index: number, caption: string) => void;
}

function SortableItem({ id, item, index, onDelete, onUpdateAlt, onUpdateCaption }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (confirmDelete) {
      onDelete(index);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={styles.mediaItem}>
      {/* Drag handle */}
      <button
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        title="Drag to reorder"
        tabIndex={0}
      >
        ⠿
      </button>

      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        {item.kind === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.alt ?? ''} className={styles.thumbImg} />
        )}
        {item.kind === 'video' && (
          <video
            src={item.url}
            className={styles.thumbImg}
            muted
            preload="metadata"
          />
        )}
        {item.kind === 'embed' && (
          <div className={styles.embedTile}>
            <span className={styles.embedProvider}>{item.provider}</span>
            <span className={styles.embedId}>{item.id}</span>
          </div>
        )}
      </div>

      {/* Meta fields */}
      <div className={styles.itemMeta}>
        {item.kind === 'image' && (
          <label className={styles.metaLabel}>
            <span className={styles.metaLabelText}>Alt text</span>
            <input
              type="text"
              value={item.alt ?? ''}
              onChange={(e) => onUpdateAlt(index, e.target.value)}
              placeholder="Describe this image…"
              className={styles.metaInput}
            />
          </label>
        )}
        {(item.kind === 'video' || item.kind === 'embed') && (
          <label className={styles.metaLabel}>
            <span className={styles.metaLabelText}>Caption</span>
            <input
              type="text"
              value={item.kind === 'video' ? (item.caption ?? '') : (item.caption ?? '')}
              onChange={(e) => onUpdateCaption(index, e.target.value)}
              placeholder="Optional caption…"
              className={styles.metaInput}
            />
          </label>
        )}
        <span className={styles.itemKind}>{item.kind}</span>
      </div>

      {/* Delete */}
      <button
        className={`${styles.deleteBtn} ${confirmDelete ? styles.deleteBtnConfirm : ''}`}
        onClick={handleDelete}
        aria-label={confirmDelete ? 'Click again to confirm delete' : 'Delete item'}
        title={confirmDelete ? 'Click again to confirm' : 'Delete'}
      >
        {confirmDelete ? 'Confirm?' : '×'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Embed form
// ─────────────────────────────────────────────────────────────
function EmbedForm({ onAdd }: { onAdd: (item: MediaItem) => void }) {
  const [mode, setMode] = useState<'url' | 'manual'>('url');
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState<'adobe' | 'youtube' | 'vimeo'>('adobe');
  const [rawId, setRawId] = useState('');
  const [caption, setCaption] = useState('');
  const [urlError, setUrlError] = useState('');

  function parseYouTubeId(u: string): string | null {
    try {
      const url = new URL(u);
      if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
      if (url.hostname.includes('youtube.com')) return url.searchParams.get('v');
    } catch { /* not a url */ }
    return null;
  }

  function parseVimeoId(u: string): string | null {
    const m = u.match(/vimeo\.com\/(\d+)/);
    return m ? m[1] : null;
  }

  function handleAddUrl() {
    setUrlError('');
    const ytId = parseYouTubeId(url);
    if (ytId) {
      onAdd({ kind: 'embed', provider: 'youtube', id: ytId, caption: caption || undefined });
      setUrl(''); setCaption('');
      return;
    }
    const viId = parseVimeoId(url);
    if (viId) {
      onAdd({ kind: 'embed', provider: 'vimeo', id: viId, caption: caption || undefined });
      setUrl(''); setCaption('');
      return;
    }
    setUrlError('Could not detect YouTube or Vimeo URL. Try the manual ID entry below.');
  }

  function handleAddManual() {
    if (!rawId.trim()) return;
    onAdd({ kind: 'embed', provider, id: rawId.trim(), caption: caption || undefined });
    setRawId(''); setCaption('');
  }

  return (
    <div className={styles.embedForm}>
      <div className={styles.embedModeTabs}>
        <button
          type="button"
          className={`${styles.embedModeTab} ${mode === 'url' ? styles.embedModeTabActive : ''}`}
          onClick={() => setMode('url')}
        >
          Paste URL
        </button>
        <button
          type="button"
          className={`${styles.embedModeTab} ${mode === 'manual' ? styles.embedModeTabActive : ''}`}
          onClick={() => setMode('manual')}
        >
          Manual ID
        </button>
      </div>

      {mode === 'url' && (
        <div className={styles.embedRow}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube or Vimeo URL…"
            className={styles.embedInput}
            aria-label="Video URL"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className={styles.embedInput}
            aria-label="Caption"
          />
          <button type="button" className={styles.embedAddBtn} onClick={handleAddUrl}>
            Add
          </button>
          {urlError && <p className={styles.embedError}>{urlError}</p>}
        </div>
      )}

      {mode === 'manual' && (
        <div className={styles.embedRow}>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'adobe' | 'youtube' | 'vimeo')}
            className={styles.embedSelect}
            aria-label="Provider"
          >
            <option value="adobe">Adobe (Behance)</option>
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
          </select>
          <input
            type="text"
            value={rawId}
            onChange={(e) => setRawId(e.target.value)}
            placeholder="Video ID…"
            className={styles.embedInput}
            aria-label="Video ID"
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className={styles.embedInput}
            aria-label="Caption"
          />
          <button type="button" className={styles.embedAddBtn} onClick={handleAddManual}>
            Add
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main MediaManager
// ─────────────────────────────────────────────────────────────
export default function MediaManager({
  items,
  onChange,
  onUploadStart,
  onUploadEnd,
}: MediaManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showEmbedForm, setShowEmbedForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Generate stable IDs for sortable (using index + kind + url/id)
  const itemIds = items.map((item, i) => {
    if (item.kind === 'embed') return `${i}-embed-${item.id}`;
    return `${i}-${item.kind}-${item.url.slice(-20)}`;
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = itemIds.indexOf(String(active.id));
      const newIndex = itemIds.indexOf(String(over.id));
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    onUploadStart?.();

    try {
      const uploaded: MediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const item = await uploadToCloudinary(files[i], (pct) => {
          setUploadProgress(Math.round((i / files.length) * 100 + pct / files.length));
        });
        uploaded.push(item);
      }
      onChange([...items, ...uploaded]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      onUploadEnd?.();
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const handleDelete = useCallback((index: number) => {
    onChange(items.filter((_, i) => i !== index));
  }, [items, onChange]);

  const handleUpdateAlt = useCallback((index: number, alt: string) => {
    onChange(items.map((item, i) => {
      if (i !== index || item.kind !== 'image') return item;
      return { ...item, alt };
    }));
  }, [items, onChange]);

  const handleUpdateCaption = useCallback((index: number, caption: string) => {
    onChange(items.map((item, i) => {
      if (i !== index) return item;
      if (item.kind === 'video') return { ...item, caption };
      if (item.kind === 'embed') return { ...item, caption };
      return item;
    }));
  }, [items, onChange]);

  function handleAddEmbed(item: MediaItem) {
    onChange([...items, item]);
    setShowEmbedForm(false);
  }

  return (
    <div className={styles.manager}>
      {/* Item grid */}
      {items.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No media yet — upload photos, videos, or add embed links below.</p>
        </div>
      )}

      {items.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={rectSortingStrategy}>
            <div className={styles.grid}>
              {items.map((item, i) => (
                <SortableItem
                  key={itemIds[i]}
                  id={itemIds[i]}
                  item={item}
                  index={i}
                  onDelete={handleDelete}
                  onUpdateAlt={handleUpdateAlt}
                  onUpdateCaption={handleUpdateCaption}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className={styles.uploadProgress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
          </div>
          <span className={styles.progressLabel}>Uploading… {uploadProgress}%</span>
        </div>
      )}

      {uploadError && (
        <p className={styles.uploadError}>
          Upload failed: {uploadError}
          <button onClick={() => setUploadError(null)} className={styles.dismissError} aria-label="Dismiss">×</button>
        </p>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className={styles.hiddenInput}
          id={`upload-${Math.random().toString(36).slice(2)}`}
          aria-label="Upload photo or video"
          disabled={uploading}
        />
        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : '↑ Upload photo / video'}
        </button>

        <button
          type="button"
          className={`${styles.embedBtn} ${showEmbedForm ? styles.embedBtnActive : ''}`}
          onClick={() => setShowEmbedForm((v) => !v)}
        >
          + Add video link
        </button>
      </div>

      {showEmbedForm && <EmbedForm onAdd={handleAddEmbed} />}
    </div>
  );
}
