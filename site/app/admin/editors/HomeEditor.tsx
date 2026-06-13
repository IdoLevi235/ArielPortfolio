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
import type { Content, HomeSection } from '@/types';
import styles from '../editors.module.css';

type HomeData = Content['home'];

interface HomeEditorProps {
  home: HomeData;
  onChange: (home: HomeData) => void;
}

// ── Sortable paragraph row ──
function SortableParagraph({
  id,
  value,
  index,
  onChange,
  onRemove,
}: {
  id: string;
  value: string;
  index: number;
  onChange: (i: number, v: string) => void;
  onRemove: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={styles.sortableRow}
    >
      <button className={styles.dragHandle} {...attributes} {...listeners} aria-label="Drag to reorder">⠿</button>
      <textarea
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        className={styles.textarea}
        rows={3}
        aria-label={`Paragraph ${index + 1}`}
        placeholder="About paragraph…"
      />
      <button
        className={styles.removeBtn}
        onClick={() => onRemove(index)}
        aria-label={`Remove paragraph ${index + 1}`}
      >
        ×
      </button>
    </div>
  );
}

// ── Sortable skill tag ──
function SortableSkill({
  id,
  value,
  index,
  onChange,
  onRemove,
}: {
  id: string;
  value: string;
  index: number;
  onChange: (i: number, v: string) => void;
  onRemove: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={styles.tagRow}
    >
      <button className={styles.dragHandleSmall} {...attributes} {...listeners} aria-label="Drag to reorder">⠿</button>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        className={styles.tagInput}
        aria-label={`Skill ${index + 1}`}
        placeholder="Skill name…"
      />
      <button
        className={styles.removeBtn}
        onClick={() => onRemove(index)}
        aria-label={`Remove skill ${index + 1}`}
      >
        ×
      </button>
    </div>
  );
}

// ── Sortable section row ──
function SortableSection({
  id,
  section,
  index,
  onChange,
}: {
  id: string;
  section: HomeSection;
  index: number;
  onChange: (i: number, s: HomeSection) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  function update(field: keyof HomeSection, value: string | boolean) {
    onChange(index, { ...section, [field]: value });
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={styles.sectionCard}
    >
      <div className={styles.sectionCardHeader}>
        <button className={styles.dragHandle} {...attributes} {...listeners} aria-label="Drag to reorder">⠿</button>
        <span className={styles.sectionCardTitle}>{section.label || section.id}</span>
        <label className={styles.flipToggle}>
          <input
            type="checkbox"
            checked={section.flip}
            onChange={(e) => update('flip', e.target.checked)}
          />
          <span>Flip layout</span>
        </label>
      </div>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Label</span>
          <input type="text" value={section.label} onChange={(e) => update('label', e.target.value)} className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Title</span>
          <input type="text" value={section.title} onChange={(e) => update('title', e.target.value)} className={styles.input} />
        </label>
        <label className={`${styles.field} ${styles.fieldFull}`}>
          <span className={styles.fieldLabel}>Description</span>
          <textarea value={section.description} onChange={(e) => update('description', e.target.value)} className={styles.textarea} rows={3} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>CTA text</span>
          <input type="text" value={section.cta} onChange={(e) => update('cta', e.target.value)} className={styles.input} />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Link (href)</span>
          <input type="text" value={section.href} onChange={(e) => update('href', e.target.value)} className={styles.input} />
        </label>
      </div>
    </div>
  );
}

// ── Main HomeEditor ──
export default function HomeEditor({ home, onChange }: HomeEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Hero
  function updateHero(field: keyof typeof home.hero, value: string) {
    onChange({ ...home, hero: { ...home.hero, [field]: value } });
  }

  function updateNameLine(i: number, value: string) {
    const nameLines = [...home.hero.nameLines];
    nameLines[i] = value;
    onChange({ ...home, hero: { ...home.hero, nameLines } });
  }

  // About paragraphs
  const paragraphIds = home.about.paragraphs.map((_, i) => `para-${i}`);

  function handleParagraphDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = paragraphIds.indexOf(String(active.id));
      const newIndex = paragraphIds.indexOf(String(over.id));
      onChange({ ...home, about: { paragraphs: arrayMove(home.about.paragraphs, oldIndex, newIndex) } });
    }
  }

  function updateParagraph(i: number, v: string) {
    const paragraphs = [...home.about.paragraphs];
    paragraphs[i] = v;
    onChange({ ...home, about: { paragraphs } });
  }

  function removeParagraph(i: number) {
    onChange({ ...home, about: { paragraphs: home.about.paragraphs.filter((_, idx) => idx !== i) } });
  }

  function addParagraph() {
    onChange({ ...home, about: { paragraphs: [...home.about.paragraphs, ''] } });
  }

  // Skills
  const skillIds = home.skills.map((_, i) => `skill-${i}`);

  function handleSkillDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = skillIds.indexOf(String(active.id));
      const newIndex = skillIds.indexOf(String(over.id));
      onChange({ ...home, skills: arrayMove(home.skills, oldIndex, newIndex) });
    }
  }

  function updateSkill(i: number, v: string) {
    const skills = [...home.skills];
    skills[i] = v;
    onChange({ ...home, skills });
  }

  function removeSkill(i: number) {
    onChange({ ...home, skills: home.skills.filter((_, idx) => idx !== i) });
  }

  function addSkill() {
    onChange({ ...home, skills: [...home.skills, ''] });
  }

  // Sections
  const sectionIds = home.sections.map((s) => `section-${s.id}`);

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionIds.indexOf(String(active.id));
      const newIndex = sectionIds.indexOf(String(over.id));
      onChange({ ...home, sections: arrayMove(home.sections, oldIndex, newIndex) });
    }
  }

  const updateSection = useCallback((i: number, s: HomeSection) => {
    const sections = [...home.sections];
    sections[i] = s;
    onChange({ ...home, sections });
  }, [home, onChange]);

  return (
    <div className={styles.editor}>
      {/* Hero */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Hero</h2>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Name — line 1</span>
            <input
              type="text"
              value={home.hero.nameLines[0] ?? ''}
              onChange={(e) => updateNameLine(0, e.target.value)}
              className={styles.input}
              placeholder="First name…"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Name — line 2</span>
            <input
              type="text"
              value={home.hero.nameLines[1] ?? ''}
              onChange={(e) => updateNameLine(1, e.target.value)}
              className={styles.input}
              placeholder="Last name…"
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Subtitle</span>
            <input
              type="text"
              value={home.hero.subtitle}
              onChange={(e) => updateHero('subtitle', e.target.value)}
              className={styles.input}
              placeholder="Tagline…"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>CTA button text</span>
            <input
              type="text"
              value={home.hero.cta}
              onChange={(e) => updateHero('cta', e.target.value)}
              className={styles.input}
              placeholder="e.g. View Work ↓"
            />
          </label>
        </div>
      </section>

      {/* About */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About paragraphs</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleParagraphDragEnd}>
          <SortableContext items={paragraphIds} strategy={verticalListSortingStrategy}>
            <div className={styles.list}>
              {home.about.paragraphs.map((p, i) => (
                <SortableParagraph
                  key={paragraphIds[i]}
                  id={paragraphIds[i]}
                  value={p}
                  index={i}
                  onChange={updateParagraph}
                  onRemove={removeParagraph}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button className={styles.addBtn} onClick={addParagraph}>+ Add paragraph</button>
      </section>

      {/* Skills */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSkillDragEnd}>
          <SortableContext items={skillIds} strategy={verticalListSortingStrategy}>
            <div className={styles.tagList}>
              {home.skills.map((skill, i) => (
                <SortableSkill
                  key={skillIds[i]}
                  id={skillIds[i]}
                  value={skill}
                  index={i}
                  onChange={updateSkill}
                  onRemove={removeSkill}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button className={styles.addBtn} onClick={addSkill}>+ Add skill</button>
      </section>

      {/* Sections */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Homepage sections</h2>
        <p className={styles.hint}>Drag to reorder. These sections appear on the homepage below the about block.</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
            <div className={styles.list}>
              {home.sections.map((section, i) => (
                <SortableSection
                  key={sectionIds[i]}
                  id={sectionIds[i]}
                  section={section}
                  index={i}
                  onChange={updateSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>
    </div>
  );
}
