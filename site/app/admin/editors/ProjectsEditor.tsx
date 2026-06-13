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
import type { Content, Project, MediaItem } from '@/types';
import MediaManager from '../MediaManager';
import styles from '../editors.module.css';

type PageKey = 'bezalel' | 'personal' | 'photography';
type PageData = { title: string; description: string; projects: Project[] };

interface ProjectsEditorProps {
  page: PageKey;
  data: PageData;
  allContent: Content;
  onChange: (data: PageData) => void;
  onMoveProject: (project: Project, targetPage: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

const PAGE_OPTIONS: { value: PageKey; label: string }[] = [
  { value: 'bezalel', label: 'Bezalel' },
  { value: 'personal', label: 'Personal' },
  { value: 'photography', label: 'Photography' },
];

function padNum(n: number): string {
  return String(n).padStart(2, '0');
}

// ── Sortable project card ──
function SortableProject({
  id,
  project,
  index,
  page,
  onChange,
  onRemove,
  onMove,
  onUploadStart,
  onUploadEnd,
}: {
  id: string;
  project: Project;
  index: number;
  page: PageKey;
  onChange: (i: number, p: Project) => void;
  onRemove: (i: number) => void;
  onMove: (p: Project, target: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  function update<K extends keyof Project>(field: K, value: Project[K]) {
    onChange(index, { ...project, [field]: value });
  }

  function handleMediaChange(media: MediaItem[]) {
    update('media', media);
  }

  function handleRemove() {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    onRemove(index);
  }

  function handleMove(e: React.ChangeEvent<HTMLSelectElement>) {
    const target = e.target.value;
    if (target && target !== page) {
      onMove(project, target);
    }
    e.target.value = '';
  }

  const otherPages = PAGE_OPTIONS.filter((p) => p.value !== page);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={styles.projectCard}
    >
      {/* Header */}
      <div className={styles.projectCardHeader}>
        <button
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          ⠿
        </button>
        <span className={styles.projectNum}>{project.num}</span>
        <span className={styles.projectCardTitle}>{project.title || 'Untitled project'}</span>
        <div className={styles.projectCardActions}>
          <label className={styles.moveLabel}>
            <span className={styles.sr}>Move to page</span>
            <select
              onChange={handleMove}
              defaultValue=""
              className={styles.moveSelect}
              aria-label="Move to page"
            >
              <option value="" disabled>Move to…</option>
              {otherPages.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          <button
            className={styles.removeCardBtn}
            onClick={handleRemove}
            aria-label={`Delete project ${project.title}`}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Number</span>
          <input
            type="text"
            value={project.num}
            onChange={(e) => update('num', e.target.value)}
            className={styles.input}
            placeholder="01"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Title</span>
          <input
            type="text"
            value={project.title}
            onChange={(e) => update('title', e.target.value)}
            className={styles.input}
            placeholder="Project title…"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Year</span>
          <input
            type="text"
            value={project.year}
            onChange={(e) => update('year', e.target.value)}
            className={styles.input}
            placeholder="2024"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Category</span>
          <input
            type="text"
            value={project.category}
            onChange={(e) => update('category', e.target.value)}
            className={styles.input}
            placeholder="e.g. Motion, Print…"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Preview count <span className={styles.fieldHint}>(media to show before "View more")</span></span>
          <input
            type="number"
            min={0}
            value={project.previewCount ?? ''}
            onChange={(e) => update('previewCount', e.target.value === '' ? undefined : Number(e.target.value))}
            className={styles.input}
            placeholder="Leave empty to show all"
          />
        </label>
        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.fieldLabel}>Description <span className={styles.fieldHint}>(optional)</span></span>
          <textarea
            value={project.description ?? ''}
            onChange={(e) => update('description', e.target.value || null)}
            className={styles.textarea}
            rows={4}
            placeholder="Project description…"
          />
        </label>
      </div>

      {/* Media */}
      <div className={styles.mediaSection}>
        <h4 className={styles.mediaSectionTitle}>Media</h4>
        <MediaManager
          items={project.media}
          onChange={handleMediaChange}
          onUploadStart={onUploadStart}
          onUploadEnd={onUploadEnd}
        />
      </div>
    </div>
  );
}

// ── Main ProjectsEditor ──
export default function ProjectsEditor({
  page,
  data,
  // allContent is kept in the interface for future use; not needed in this component
  onChange,
  onMoveProject,
  onUploadStart,
  onUploadEnd,
}: ProjectsEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const projectIds = data.projects.map((p) => `proj-${p.id}`);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projectIds.indexOf(String(active.id));
      const newIndex = projectIds.indexOf(String(over.id));
      const reordered = arrayMove(data.projects, oldIndex, newIndex);
      // Fix isLast flags
      const fixed = reordered.map((p, i, arr) => ({ ...p, isLast: i === arr.length - 1 }));
      onChange({ ...data, projects: fixed });
    }
  }

  const updateProject = useCallback((i: number, p: Project) => {
    const projects = [...data.projects];
    projects[i] = p;
    // Fix isLast flags
    const fixed = projects.map((proj, idx, arr) => ({ ...proj, isLast: idx === arr.length - 1 }));
    onChange({ ...data, projects: fixed });
  }, [data, onChange]);

  function removeProject(i: number) {
    const projects = data.projects.filter((_, idx) => idx !== i);
    const fixed = projects.map((p, idx, arr) => ({ ...p, isLast: idx === arr.length - 1 }));
    onChange({ ...data, projects: fixed });
  }

  function addProject() {
    const nextNum = data.projects.length + 1;
    const newProject: Project = {
      id: `new-project-${Date.now()}`,
      num: padNum(nextNum),
      title: '',
      year: String(new Date().getFullYear()),
      category: '',
      description: null,
      media: [],
      isLast: true,
    };
    const projects = [
      ...data.projects.map((p) => ({ ...p, isLast: false })),
      newProject,
    ];
    onChange({ ...data, projects });
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
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className={styles.input}
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Description</span>
            <textarea
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              className={styles.textarea}
              rows={3}
            />
          </label>
        </div>
      </section>

      {/* Projects */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Projects ({data.projects.length})</h2>
        <p className={styles.hint}>Drag to reorder. Each project's number and &quot;isLast&quot; flag are managed automatically.</p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
            <div className={styles.list}>
              {data.projects.map((project, i) => (
                <SortableProject
                  key={projectIds[i]}
                  id={projectIds[i]}
                  project={project}
                  index={i}
                  page={page}
                  onChange={updateProject}
                  onRemove={removeProject}
                  onMove={onMoveProject}
                  onUploadStart={onUploadStart}
                  onUploadEnd={onUploadEnd}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button className={styles.addBtn} onClick={addProject}>+ Add project</button>
      </section>
    </div>
  );
}
