// One-time migration: convert legacy `videoIds` / `images` / `extraImages`
// into the unified `media[]` model. Idempotent — re-running is a no-op once
// projects already expose `media`.
//
// Run from the `site/` directory:  node scripts/migrate-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentPath = path.join(__dirname, '..', 'data', 'content.json');

const content = JSON.parse(readFileSync(contentPath, 'utf-8'));

const adobeEmbed = (id) => ({ kind: 'embed', provider: 'adobe', id });

const legacyImageToMedia = (img) => {
  // Only real uploaded images survive; `placeholder` stand-ins are dropped.
  if (img.type === 'url' && img.url) {
    return { kind: 'image', url: img.url, ...(img.alt ? { alt: img.alt } : {}) };
  }
  return null;
};

const migrateProject = (p) => {
  if (Array.isArray(p.media)) return p; // already migrated

  const fromVideos = (p.videoIds ?? []).map(adobeEmbed);
  const fromImages = (p.images ?? []).map(legacyImageToMedia).filter(Boolean);
  const fromExtra = (p.extraImages ?? []).map(legacyImageToMedia).filter(Boolean);

  const base = [...fromVideos, ...fromImages];
  const media = [...base, ...fromExtra];

  const next = {
    id: p.id,
    num: p.num,
    title: p.title,
    year: p.year,
    category: p.category,
    description: p.description ?? null,
    media,
    isLast: !!p.isLast,
  };
  // Preserve the "View more" boundary only if there were extra images.
  if (fromExtra.length > 0) next.previewCount = base.length;
  return next;
};

const migrateProjects = (section) => {
  if (section?.projects) section.projects = section.projects.map(migrateProject);
};

// Project sections
migrateProjects(content.bezalel);
migrateProjects(content.personal);
migrateProjects(content.photography);

// Ads groups: videoIds -> media (adobe embeds)
if (content.ads?.groups) {
  content.ads.groups = content.ads.groups.map((g) =>
    Array.isArray(g.media)
      ? g
      : { id: g.id, label: g.label, media: (g.videoIds ?? []).map(adobeEmbed) }
  );
}

writeFileSync(contentPath, JSON.stringify(content, null, 2) + '\n', 'utf-8');
console.log('content.json migrated to unified media[] model.');
