import { defineCollection, z } from "astro:content";

const theoryCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    tense: z.enum(["Present Simple", "Past Simple", "Present Perfect", "Future Simple"]),
    description: z.string(),
    order: z.number().min(1).max(4),
  }),
});

export const collections = {
  theory: theoryCollection,
};
