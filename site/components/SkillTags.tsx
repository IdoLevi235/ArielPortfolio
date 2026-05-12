import styles from './SkillTags.module.css';

export default function SkillTags({ skills }: { skills: string[] }) {
  return (
    <ul className={styles.tags} aria-label="Skills">
      {skills.map(skill => (
        <li key={skill} className={styles.tag}>{skill}</li>
      ))}
    </ul>
  );
}
