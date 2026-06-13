'use client';

import { useCallback } from 'react';
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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Content, MediaItem, VideoGroup } from '@/types';
import MediaManager from '../MediaManager';
import styles from '../editors.module.css';

type AdsData = Content['ads'];

interface AdsEditorProps {
  ads: AdsData;
  onChange: (ads: AdsData) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

function generateGroupId(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `group-${Date.now()}`;
}

// ── Sortable group card ──
function SortableGroup({
  id,
  group,
  index,
  onChange,
  onRemove,
  onUploadStart,
  onUploadEnd,
}: {
  id: string;
  group: VideoGroup;
  index: number;
  onChange: (i: number, g: VideoGroup) => void;
  onRemove: (i: number) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  function handleLabelChange(label: string) {
    onChange(index, { ...group, label });
  }

  function handleMediaChange(media: MediaItem[]) {
    onChange(index, { ...group, media });
  }

  function handleRemove() {
    if (!window.confirm(`Delete group "${group.label}"? This cannot be undone.`)) return;
    onRemove(index);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={styles.groupCard}
    >
      <div className={styles.groupCardHeader}>
        <button className={styles.dragHandle} {...attributes} {...listeners} aria-label="Drag to reorder">⠿</button>
        <label className={styles.groupLabelField}>
          <span className={styles.fieldLabel}>Group label</span>
          <input
            type="text"
            value={group.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className={styles.input}
            placeholder="e.g. Kendago · 2021–Present"
          />
        </label>
        <button
          className={styles.removeCardBtn}
          onClick={handleRemove}
          aria-label={`Delete group ${group.label}`}
        >
          Delete group
        </button>
      </div>

      <div className={styles.groupCardBody}>
        <MediaManager
          items={group.media}
          onChange={handleMediaChange}
          onUploadStart={onUploadStart}
          onUploadEnd={onUploadEnd}
        />
      </div>
    </div>
  );
}

export default function AdsEditor({ ads, onChange, onUploadStart, onUploadEnd }: AdsEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const groupIds = ads.groups.map((g) => `group-${g.id}`);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = groupIds.indexOf(String(active.id));
      const newIndex = groupIds.indexOf(String(over.id));
      onChange({ ...ads, groups: arrayMove(ads.groups, oldIndex, newIndex) });
    }
  }

  const updateGroup = useCallback((i: number, g: VideoGroup) => {
    const groups = [...ads.groups];
    groups[i] = g;
    onChange({ ...ads, groups });
  }, [ads, onChange]);

  function removeGroup(i: number) {
    onChange({ ...ads, groups: ads.groups.filter((_, idx) => idx !== i) });
  }

  function addGroup() {
    const label = 'New group';
    onChange({
      ...ads,
      groups: [
        ...ads.groups,
        { id: generateGroupId(`group-${Date.now()}`), label, media: [] },
      ],
    });
  }

  return (
    <div className={styles.editor}>
      {/* Page meta */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Page header</h2>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Page title</span>
            <input
              type="text"
              value={ads.title}
              onChange={(e) => onChange({ ...ads, title: e.target.value })}
              className={styles.input}
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Description</span>
            <textarea
              value={ads.description}
              onChange={(e) => onChange({ ...ads, description: e.target.value })}
              className={styles.textarea}
              rows={4}
            />
          </label>
        </div>
      </section>

      {/* Groups */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Video groups</h2>
        <p className={styles.hint}>Each group is a labelled section of videos. Drag to reorder groups.</p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
            <div className={styles.list}>
              {ads.groups.map((group, i) => (
                <SortableGroup
                  key={groupIds[i]}
                  id={groupIds[i]}
                  group={group}
                  index={i}
                  onChange={updateGroup}
                  onRemove={removeGroup}
                  onUploadStart={onUploadStart}
                  onUploadEnd={onUploadEnd}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button className={styles.addBtn} onClick={addGroup}>+ Add group</button>
      </section>
    </div>
  );
}
