// The projects on the page. Add one object per project; the section renders
// them as cards in the order given, and shows a short note while the list is
// empty.
export interface Project {
  slug: string;
  name: string;
  summary: string;
  stack: string[];
  repo?: string;
  live?: string;
  year: number;
}

export const PROJECTS: Project[] = [];
