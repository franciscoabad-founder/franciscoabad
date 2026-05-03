import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  // schema recibe el helper `image()` para que paths relativos en
  // frontmatter (heroImage) se resuelvan a ImageMetadata. Esto permite
  // pasar entry.data.heroImage directo a <Image> de astro:assets sin
  // workarounds de import.meta.glob.
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      category: z.enum(["Systems Thinking", "Founder Systems", "Liderazgo"]),
      readTime: z.number(),
      slug: z.string(),
      draft: z.boolean().default(false),
      author: z.string().default("Francisco Abad"),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
    }),
});

export const collections = { blog };
