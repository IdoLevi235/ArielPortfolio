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

export interface VideoGroup {
  id: string;
  label: string;
  videoIds: string[];
}

export interface ProjectImage {
  type: 'placeholder' | 'url';
  label?: string;
  url?: string;
  alt?: string;
}

export interface Project {
  id: string;
  num: string;
  title: string;
  year: string;
  category: string;
  description: string | null;
  videoIds: string[];
  images: ProjectImage[];
  extraImages: ProjectImage[];
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
