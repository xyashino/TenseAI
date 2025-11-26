import type { TenseName } from "@/types";

export interface TenseCardData {
  name: TenseName;
  slug: string;
  description: string;
}

export interface TheoryFrontmatter {
  title: string;
  tense: TenseName;
  description: string;
  order: number;
}
