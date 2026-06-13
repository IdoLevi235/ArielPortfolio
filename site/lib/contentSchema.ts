import { z } from 'zod';

// ---------------------------------------------------------------------------
// MediaItem — discriminated union on `kind`
// ---------------------------------------------------------------------------

const MediaItemImageSchema = z.object({
  kind: z.literal('image'),
  url: z.string(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const MediaItemEmbedSchema = z.object({
  kind: z.literal('embed'),
  provider: z.enum(['adobe', 'youtube', 'vimeo']),
  id: z.string(),
  caption: z.string().optional(),
});

const MediaItemVideoSchema = z.object({
  kind: z.literal('video'),
  url: z.string(),
  publicId: z.string().optional(),
  poster: z.string().optional(),
  caption: z.string().optional(),
});

const MediaItemSchema = z.discriminatedUnion('kind', [
  MediaItemImageSchema,
  MediaItemEmbedSchema,
  MediaItemVideoSchema,
]);

// ---------------------------------------------------------------------------
// VideoGroup
// ---------------------------------------------------------------------------

const VideoGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  media: z.array(MediaItemSchema),
});

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

const ProjectSchema = z.object({
  id: z.string(),
  num: z.string(),
  title: z.string(),
  year: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  media: z.array(MediaItemSchema),
  previewCount: z.number().optional(),
  isLast: z.boolean(),
});

// ---------------------------------------------------------------------------
// SiteConfig
// ---------------------------------------------------------------------------

const SiteConfigSchema = z.object({
  name: z.string(),
  email: z.string(),
  linkedin: z.string(),
  instagram: z.string(),
  footerYear: z.string(),
});

// ---------------------------------------------------------------------------
// HomeSection
// ---------------------------------------------------------------------------

const HomeSectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  title: z.string(),
  description: z.string(),
  cta: z.string(),
  href: z.string(),
  flip: z.boolean(),
});

// ---------------------------------------------------------------------------
// ProjectSection (bezalel / personal / photography)
// ---------------------------------------------------------------------------

const ProjectSectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  projects: z.array(ProjectSchema),
});

// ---------------------------------------------------------------------------
// Content (root)
// ---------------------------------------------------------------------------

export const ContentSchema = z.object({
  site: SiteConfigSchema,
  home: z.object({
    hero: z.object({
      nameLines: z.array(z.string()),
      subtitle: z.string(),
      cta: z.string(),
    }),
    about: z.object({
      paragraphs: z.array(z.string()),
    }),
    skills: z.array(z.string()),
    sections: z.array(HomeSectionSchema),
  }),
  ads: z.object({
    title: z.string(),
    description: z.string(),
    groups: z.array(VideoGroupSchema),
  }),
  bezalel: ProjectSectionSchema,
  personal: ProjectSectionSchema,
  photography: ProjectSectionSchema,
});

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

export type ValidateResult =
  | { success: true; data: z.infer<typeof ContentSchema> }
  | { success: false; error: string };

export function validateContent(data: unknown): ValidateResult {
  const result = ContentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Produce a short human-readable summary of the first few issues
  const issues = result.error.issues;
  const summary = issues
    .slice(0, 3)
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
  const suffix = issues.length > 3 ? ` … (${issues.length - 3} more)` : '';
  return { success: false, error: summary + suffix };
}
