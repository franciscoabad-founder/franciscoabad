import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(["Systems Thinking", "Founder Systems", "Liderazgo"]),
    readTime: z.number(),
    slug: z.string(),
    draft: z.boolean().default(false),
    author: z.string().default("Francisco Abad"),
  }),
});

export const collections = { blog };
