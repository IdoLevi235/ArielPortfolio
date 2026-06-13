export interface SiteConfig {
  name: string;
  email: string;
  linkedin: string;
  instagram: string;
  footerYear: string;
}

export interface HomeSection {
  id: string;
  label: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  flip: boolean;
}

/**
 * A single piece of media in a project or group. Exactly one of three kinds:
 * - `image`  — a still uploaded to Cloudinary
 * - `video`  — a video file uploaded to Cloudinary (served directly)
 * - `embed`  — a video hosted elsewhere, referenced by provider + id
 *              (`adobe` = the legacy Behance/Adobe CCV player)
 */
export type MediaItem =
  | {
      kind: 'image';
      url: string;
      publicId?: string;
      alt?: string;
      width?: number;
      height?: number;
    }
  | {
      kind: 'embed';
      provider: 'adobe' | 'youtube' | 'vimeo';
      id: string;
      caption?: string;
    }
  | {
      kind: 'video';
      url: string;
      publicId?: string;
      poster?: string;
      caption?: string;
    };

export interface VideoGroup {
  id: string;
  label: string;
  media: MediaItem[];
}

export interface Project {
  id: string;
  num: string;
  title: string;
  year: string;
  category: string;
  description: string | null;
  media: MediaItem[];
  /**
   * How many media items to show before the "View more" toggle.
   * Omitted / undefined means show all items (no toggle).
   */
  previewCount?: number;
  isLast: boolean;
}

export interface Content {
  site: SiteConfig;
  home: {
    hero: { nameLines: string[]; subtitle: string; cta: string };
    about: { paragraphs: string[] };
    skills: string[];
    sections: HomeSection[];
  };
  ads: { title: string; description: string; groups: VideoGroup[] };
  bezalel: { title: string; description: string; projects: Project[] };
  personal: { title: string; description: string; projects: Project[] };
  photography: { title: string; description: string; projects: Project[] };
}
